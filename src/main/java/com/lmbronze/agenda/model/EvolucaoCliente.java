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
import lombok.Data;

import com.lmbronze.agenda.util.SanitizadorUtil;

@Entity
@Table(name = "evolucoes_cliente")
@FilterDef(name = "empresaFilter", parameters = @ParamDef(name = "empresaId", type = Long.class))
@Filter(name = "empresaFilter", condition = "empresa_id = :empresaId")
@Data
public class EvolucaoCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "agendamento_id")
    private Agendamento agendamento;

    @Column(nullable = false)
    private String fotoUrl;

    private String descricao;

    @CreationTimestamp
    @Column(name = "data", updatable = false)
    private LocalDateTime data;

    @UpdateTimestamp
    private LocalDateTime atualizadoEm;

    @jakarta.persistence.PrePersist
    @jakarta.persistence.PreUpdate
    private void sanitizar() {
        this.descricao = SanitizadorUtil.limpar(descricao);
    }
}
