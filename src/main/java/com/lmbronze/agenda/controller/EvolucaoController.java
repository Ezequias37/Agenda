package com.lmbronze.agenda.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.model.EvolucaoCliente;
import com.lmbronze.agenda.model.Role;
import com.lmbronze.agenda.model.StatusAgendamento;
import com.lmbronze.agenda.model.Usuario;
import com.lmbronze.agenda.repository.AgendamentoRepository;
import com.lmbronze.agenda.repository.EvolucaoClienteRepository;
import com.lmbronze.agenda.service.FileStorageService;

@RestController
@RequestMapping("/api/evolucao")
public class EvolucaoController {

    private final EvolucaoClienteRepository evolucaoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final FileStorageService fileStorageService;

    public EvolucaoController(EvolucaoClienteRepository evolucaoRepository,
                              AgendamentoRepository agendamentoRepository,
                              FileStorageService fileStorageService) {
        this.evolucaoRepository = evolucaoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> adicionar(
            @RequestParam Long agendamentoId,
            @RequestParam(required = false) String descricao,
            @RequestParam MultipartFile foto,
            Authentication auth) {

        Usuario usuario = (Usuario) auth.getPrincipal();

        Agendamento agendamento = agendamentoRepository.findById(agendamentoId).orElse(null);
        if (agendamento == null) {
            return ResponseEntity.notFound().build();
        }
        if (agendamento.getStatus() != StatusAgendamento.CONCLUIDO) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Só é possível adicionar evolução a agendamentos concluídos"));
        }

        Cliente cliente = agendamento.getCliente();
        if (!temPermissao(usuario, cliente)) {
            return ResponseEntity.status(403).body(Map.of("erro", "Sem permissão para esta ação"));
        }

        if (foto == null || foto.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Envie uma foto"));
        }

        try {
            String url = fileStorageService.salvarImagem(foto, "evolucoes");
            EvolucaoCliente evolucao = new EvolucaoCliente();
            evolucao.setCliente(cliente);
            evolucao.setAgendamento(agendamento);
            evolucao.setEmpresa(agendamento.getEmpresa());
            evolucao.setFotoUrl(url);
            evolucao.setDescricao(descricao);
            return ResponseEntity.ok(evolucaoRepository.save(evolucao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("erro", "Falha ao salvar a foto"));
        }
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<?> listarPorCliente(@PathVariable Long id, Authentication auth) {
        Usuario usuario = (Usuario) auth.getPrincipal();
        boolean isDono = usuario.getCliente() != null && usuario.getCliente().getId().equals(id);
        if (!isDono && usuario.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("erro", "Sem permissão para esta ação"));
        }
        List<EvolucaoCliente> lista = evolucaoRepository.findByClienteIdOrderByDataDesc(id);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/agendamento/{id}")
    public ResponseEntity<?> listarPorAgendamento(@PathVariable Long id, Authentication auth) {
        Usuario usuario = (Usuario) auth.getPrincipal();
        Agendamento agendamento = agendamentoRepository.findById(id).orElse(null);
        if (agendamento == null) {
            return ResponseEntity.notFound().build();
        }
        if (!temPermissao(usuario, agendamento.getCliente())) {
            return ResponseEntity.status(403).body(Map.of("erro", "Sem permissão para esta ação"));
        }
        return ResponseEntity.ok(evolucaoRepository.findByAgendamentoIdOrderByDataDesc(id));
    }

    private boolean temPermissao(Usuario usuario, Cliente cliente) {
        boolean isDono = usuario.getCliente() != null && cliente != null
                && usuario.getCliente().getId().equals(cliente.getId());
        return isDono || usuario.getRole() == Role.ADMIN;
    }
}
