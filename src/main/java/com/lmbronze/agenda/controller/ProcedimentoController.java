package com.lmbronze.agenda.controller;

import java.text.Normalizer;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lmbronze.agenda.model.Procedimento;
import com.lmbronze.agenda.repository.ProcedimentoRepository;

import jakarta.validation.Valid;

/**
 * CRUD de procedimentos (serviços oferecidos pela clínica), acessível
 * apenas ao ADMIN. A listagem pública já existe em AgendaController
 * (GET /api/procedimentos).
 */
@RestController
@RequestMapping("/api/procedimentos")
public class ProcedimentoController {

    private final ProcedimentoRepository procedimentoRepository;

    public ProcedimentoController(ProcedimentoRepository procedimentoRepository) {
        this.procedimentoRepository = procedimentoRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> criar(@Valid @RequestBody Procedimento procedimento) {
        String id = procedimento.getId() != null && !procedimento.getId().isBlank()
                ? slugify(procedimento.getId())
                : slugify(procedimento.getNome());
        if (id.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe um nome válido para o procedimento"));
        }
        if (procedimentoRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Já existe um procedimento com esse identificador"));
        }
        procedimento.setId(id);
        return ResponseEntity.ok(procedimentoRepository.save(procedimento));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> atualizar(@PathVariable String id, @Valid @RequestBody Procedimento procedimento) {
        return procedimentoRepository.findById(id)
                .map(existente -> {
                    existente.setNome(procedimento.getNome());
                    existente.setPreco(procedimento.getPreco());
                    existente.setDuracao(procedimento.getDuracao());
                    existente.setDescricao(procedimento.getDescricao());
                    existente.setCategoria(procedimento.getCategoria());
                    return ResponseEntity.ok(procedimentoRepository.save(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable String id) {
        return procedimentoRepository.findById(id)
                .map(existente -> {
                    procedimentoRepository.delete(existente);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String slugify(String texto) {
        if (texto == null) return "";
        String semAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return semAcentos.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
