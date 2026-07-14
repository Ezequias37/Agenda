package com.lmbronze.agenda.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import com.lmbronze.agenda.util.SanitizadorUtil;

@Entity
@Table(name = "procedimentos")
@Data
public class Procedimento {

    @Id
    private String id;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotNull(message = "Preço é obrigatório")
    @Positive(message = "Preço deve ser maior que zero")
    @Column(nullable = false)
    private Double preco;

    @NotBlank(message = "Duração é obrigatória")
    @Column(nullable = false)
    private String duracao;

    private String descricao;

    @NotBlank(message = "Categoria é obrigatória")
    @Column(nullable = false)
    private String categoria;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    private LocalDateTime atualizadoEm;

    @PrePersist
    @PreUpdate
    private void sanitizar() {
        this.nome = SanitizadorUtil.limpar(nome);
        this.descricao = SanitizadorUtil.limpar(descricao);
    }
}
