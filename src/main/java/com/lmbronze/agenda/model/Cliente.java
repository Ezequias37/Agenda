package com.lmbronze.agenda.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import com.lmbronze.agenda.util.SanitizadorUtil;

@Entity
@Table(name = "clientes", uniqueConstraints = @UniqueConstraint(columnNames = {"empresa_id", "email"}))
@FilterDef(name = "empresaFilter", parameters = @ParamDef(name = "empresaId", type = Long.class))
@Filter(name = "empresaFilter", condition = "empresa_id = :empresaId")
@Data
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    @Column(nullable = false)
    private String email;

    private String telefone;

    private String fotoUrl;

    /** CPF (somente dígitos ou formatado) — necessário para gerar cobranças PIX via Asaas. */
    private String cpf;

    /** Id do cliente já cadastrado no Asaas (cache, evita recriar a cada cobrança). */
    private String asaasCustomerId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    private LocalDateTime atualizadoEm;

    @jakarta.persistence.PrePersist
    @jakarta.persistence.PreUpdate
    private void sanitizar() {
        this.nome = SanitizadorUtil.limpar(nome);
    }
}
 