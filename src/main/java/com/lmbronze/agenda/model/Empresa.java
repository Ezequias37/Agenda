package com.lmbronze.agenda.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import com.lmbronze.agenda.util.SanitizadorUtil;

@Entity
@Table(name = "empresas")
@Data
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome fantasia é obrigatório")
    @Column(nullable = false)
    private String nomeFantasia;

    private String razaoSocial;

    @Column(unique = true)
    private String cnpj;

    private String telefone;

    private String endereco;

    private String logoUrl;

    @Column(nullable = false)
    private String corPrimaria = "#b86a1a";

    @Column(nullable = false)
    private String corSecundaria = "#1a1a2e";

    /** Itens que o cliente deve levar para a sessão, um por linha. */
    @Column(columnDefinition = "TEXT")
    private String oQueLevar;

    /** Recomendações para os clientes, uma por linha. */
    @Column(columnDefinition = "TEXT")
    private String recomendacoes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @jakarta.persistence.PrePersist
    @jakarta.persistence.PreUpdate
    private void sanitizar() {
        this.nomeFantasia = SanitizadorUtil.limpar(nomeFantasia);
        this.razaoSocial = SanitizadorUtil.limpar(razaoSocial);
        this.endereco = SanitizadorUtil.limpar(endereco);
        this.oQueLevar = SanitizadorUtil.limpar(oQueLevar);
        this.recomendacoes = SanitizadorUtil.limpar(recomendacoes);
    }
}
