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
@Table(name = "casos_sucesso")
@FilterDef(name = "empresaFilter", parameters = @ParamDef(name = "empresaId", type = Long.class))
@Filter(name = "empresaFilter", condition = "empresa_id = :empresaId")
@Data
public class CasoSucesso {

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
    private String titulo;

    @Column(length = 2000)
    private String descricao;

    @Column(nullable = false)
    private String fotoUrl;

    @Column(nullable = false)
    private Boolean aprovado = false;

    /** Caminho da imagem 1080x1080 gerada com overlay (preenchido ao aprovar). */
    private String imagemProntaUrl;

    /** Legenda pronta para redes sociais (preenchida ao aprovar). */
    @Column(length = 2500)
    private String legendaPronta;

    @CreationTimestamp
    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    private LocalDateTime atualizadoEm;

    @jakarta.persistence.PrePersist
    @jakarta.persistence.PreUpdate
    private void sanitizar() {
        this.titulo = SanitizadorUtil.limpar(titulo);
        this.descricao = SanitizadorUtil.limpar(descricao);
    }
}
