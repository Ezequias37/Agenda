package com.lmbronze.agenda.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lmbronze.agenda.model.Empresa;
import com.lmbronze.agenda.model.Usuario;
import com.lmbronze.agenda.repository.EmpresaRepository;
import com.lmbronze.agenda.service.FileStorageService;

@RestController
@RequestMapping("/api/empresa")
public class EmpresaController {

    private final EmpresaRepository empresaRepository;
    private final FileStorageService fileStorageService;

    public EmpresaController(EmpresaRepository empresaRepository, FileStorageService fileStorageService) {
        this.empresaRepository = empresaRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> obterConfig(Authentication auth) {
        Empresa empresa = empresaDoUsuario(auth);
        if (empresa == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(empresa);
    }

    /** Dados públicos da empresa para a página de Informações (sem autenticação). */
    @GetMapping("/publico")
    public ResponseEntity<?> obterConfigPublica(@RequestParam Long empresaId) {
        return empresaRepository.findById(empresaId)
                .map(empresa -> ResponseEntity.ok(new EmpresaPublicaDTO(
                        empresa.getId(),
                        empresa.getNomeFantasia(),
                        empresa.getTelefone(),
                        empresa.getEndereco(),
                        empresa.getLogoUrl(),
                        empresa.getCorPrimaria(),
                        empresa.getCorSecundaria(),
                        empresa.getOQueLevar(),
                        empresa.getRecomendacoes()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/config", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> atualizarConfig(
            Authentication auth,
            @RequestParam(required = false) String nomeFantasia,
            @RequestParam(required = false) String razaoSocial,
            @RequestParam(required = false) String cnpj,
            @RequestParam(required = false) String telefone,
            @RequestParam(required = false) String endereco,
            @RequestParam(required = false) String corPrimaria,
            @RequestParam(required = false) String corSecundaria,
            @RequestParam(required = false) String oQueLevar,
            @RequestParam(required = false) String recomendacoes,
            @RequestParam(required = false) MultipartFile logo) {

        Empresa empresa = empresaDoUsuario(auth);
        if (empresa == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Usuário não vinculado a uma empresa"));
        }

        if (nomeFantasia != null && !nomeFantasia.isBlank()) empresa.setNomeFantasia(nomeFantasia);
        if (razaoSocial != null) empresa.setRazaoSocial(razaoSocial);
        if (cnpj != null) empresa.setCnpj(cnpj);
        if (telefone != null) empresa.setTelefone(telefone);
        if (endereco != null) empresa.setEndereco(endereco);
        if (corPrimaria != null && !corPrimaria.isBlank()) empresa.setCorPrimaria(corPrimaria);
        if (corSecundaria != null && !corSecundaria.isBlank()) empresa.setCorSecundaria(corSecundaria);
        if (oQueLevar != null) empresa.setOQueLevar(oQueLevar);
        if (recomendacoes != null) empresa.setRecomendacoes(recomendacoes);

        if (logo != null && !logo.isEmpty()) {
            try {
                String url = fileStorageService.salvarImagem(logo, "logos");
                empresa.setLogoUrl(url);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(Map.of("erro", "Falha ao salvar a logo"));
            }
        }

        return ResponseEntity.ok(empresaRepository.save(empresa));
    }

    private Empresa empresaDoUsuario(Authentication auth) {
        Usuario usuario = (Usuario) auth.getPrincipal();
        if (usuario.getEmpresa() == null) {
            return null;
        }
        return empresaRepository.findById(usuario.getEmpresa().getId()).orElse(null);
    }

    public record EmpresaPublicaDTO(Long id, String nomeFantasia, String telefone, String endereco,
                                     String logoUrl, String corPrimaria, String corSecundaria,
                                     String oQueLevar, String recomendacoes) {}
}
