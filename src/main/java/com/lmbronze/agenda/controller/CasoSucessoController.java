package com.lmbronze.agenda.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.model.CasoSucesso;
import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.model.Role;
import com.lmbronze.agenda.model.StatusAgendamento;
import com.lmbronze.agenda.model.Usuario;
import com.lmbronze.agenda.repository.AgendamentoRepository;
import com.lmbronze.agenda.repository.CasoSucessoRepository;
import com.lmbronze.agenda.service.FileStorageService;
import com.lmbronze.agenda.service.GeradorImagemService;
import com.lmbronze.agenda.service.GeradorLegendaService;

@RestController
@RequestMapping("/api/casos")
public class CasoSucessoController {

    private final CasoSucessoRepository casoSucessoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final FileStorageService fileStorageService;
    private final GeradorImagemService geradorImagemService;
    private final GeradorLegendaService geradorLegendaService;

    public CasoSucessoController(CasoSucessoRepository casoSucessoRepository,
                                 AgendamentoRepository agendamentoRepository,
                                 FileStorageService fileStorageService,
                                 GeradorImagemService geradorImagemService,
                                 GeradorLegendaService geradorLegendaService) {
        this.casoSucessoRepository = casoSucessoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.fileStorageService = fileStorageService;
        this.geradorImagemService = geradorImagemService;
        this.geradorLegendaService = geradorLegendaService;
    }

    // --- Cliente envia um novo case (aprovado = false) ---

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> criar(
            @RequestParam Long agendamentoId,
            @RequestParam String titulo,
            @RequestParam(required = false) String descricao,
            @RequestParam MultipartFile foto,
            Authentication auth) {

        Usuario usuario = (Usuario) auth.getPrincipal();

        Agendamento agendamento = agendamentoRepository.findById(agendamentoId).orElse(null);
        if (agendamento == null) {
            return ResponseEntity.notFound().build();
        }
        if (agendamento.getStatus() != StatusAgendamento.CONCLUIDO) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Só é possível enviar um case para agendamentos concluídos"));
        }

        Cliente cliente = agendamento.getCliente();
        if (!temPermissao(usuario, cliente)) {
            return ResponseEntity.status(403).body(Map.of("erro", "Sem permissão para esta ação"));
        }
        if (titulo == null || titulo.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe um título"));
        }
        if (foto == null || foto.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Envie uma foto"));
        }

        try {
            String url = fileStorageService.salvarImagem(foto, "casos-originais");
            CasoSucesso caso = new CasoSucesso();
            caso.setEmpresa(agendamento.getEmpresa());
            caso.setCliente(cliente);
            caso.setAgendamento(agendamento);
            caso.setTitulo(titulo);
            caso.setDescricao(descricao);
            caso.setFotoUrl(url);
            caso.setAprovado(false);
            return ResponseEntity.ok(casoSucessoRepository.save(caso));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("erro", "Falha ao salvar a foto"));
        }
    }

    // --- ADMIN: lista os pendentes (não aprovados) ---

    @GetMapping("/pendentes")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CasoSucesso> pendentes() {
        return casoSucessoRepository.findByAprovadoFalseOrderByDataCriacaoDesc();
    }

    // --- Cliente: lista os próprios cases enviados ---

    @GetMapping("/meus")
    public ResponseEntity<List<CasoSucesso>> meus(Authentication auth) {
        Usuario usuario = (Usuario) auth.getPrincipal();
        if (usuario.getCliente() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(casoSucessoRepository.findByClienteIdOrderByDataCriacaoDesc(usuario.getCliente().getId()));
    }

    // --- ADMIN: aprova e dispara a geração da imagem + legenda ---

    @PatchMapping("/{id}/aprovar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> aprovar(@PathVariable Long id) {
        return casoSucessoRepository.findById(id)
                .map(caso -> {
                    try {
                        String legenda = geradorLegendaService.gerarLegenda(caso);
                        String imagemUrl = geradorImagemService.gerarImagemCaso(caso);
                        caso.setAprovado(true);
                        caso.setLegendaPronta(legenda);
                        caso.setImagemProntaUrl(imagemUrl);
                        return ResponseEntity.ok(casoSucessoRepository.save(caso));
                    } catch (Exception e) {
                        // Mantém o caso como pendente se a geração falhar.
                        return ResponseEntity.internalServerError()
                                .body(Map.of("erro", "Falha ao gerar imagem/legenda: " + e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- ADMIN: rejeita (remove) um case pendente ---

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejeitar(@PathVariable Long id) {
        return casoSucessoRepository.findById(id)
                .map(caso -> {
                    casoSucessoRepository.delete(caso);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- Vitrine pública (sem autenticação) ---

    @GetMapping("/publicos")
    public List<CasoPublicoDTO> publicos(@RequestParam Long empresaId) {
        return casoSucessoRepository.findByAprovadoTrueAndEmpresaIdOrderByDataCriacaoDesc(empresaId).stream()
                .map(c -> new CasoPublicoDTO(
                        c.getId(),
                        c.getTitulo(),
                        c.getDescricao(),
                        c.getImagemProntaUrl() != null ? c.getImagemProntaUrl() : c.getFotoUrl(),
                        c.getCliente() != null ? primeiroNome(c.getCliente().getNome()) : null,
                        c.getDataCriacao()
                ))
                .toList();
    }

    private boolean temPermissao(Usuario usuario, Cliente cliente) {
        boolean isDono = usuario.getCliente() != null && cliente != null
                && usuario.getCliente().getId().equals(cliente.getId());
        return isDono || usuario.getRole() == Role.ADMIN;
    }

    private String primeiroNome(String nomeCompleto) {
        if (nomeCompleto == null || nomeCompleto.isBlank()) {
            return null;
        }
        return nomeCompleto.trim().split("\\s+")[0];
    }

    /** DTO enxuto para a vitrine pública — nunca expõe email/telefone do cliente. */
    public record CasoPublicoDTO(Long id, String titulo, String descricao, String imagemUrl,
                                  String clienteNome, LocalDateTime data) {}
}
