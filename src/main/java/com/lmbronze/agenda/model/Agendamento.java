package com.lmbronze.agenda.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import com.lmbronze.agenda.util.SanitizadorUtil;

@Entity
@Table(name = "agendamentos")
@FilterDef(name = "empresaFilter", parameters = @ParamDef(name = "empresaId", type = Long.class))
@Filter(name = "empresaFilter", condition = "empresa_id = :empresaId")
@Data
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotNull(message = "Data e hora são obrigatórios")
    @Column(nullable = false)
    private LocalDateTime dataHora;

    private String descricao;

    @ManyToOne
    @JoinColumn(name = "procedimento_id")
    private Procedimento procedimento;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento status = StatusAgendamento.AGENDADO;

    @Column(nullable = false)
    private Boolean whatsappConfirmacaoEnviado = false;

    @Column(nullable = false)
    private Boolean whatsappLembreteEnviado = false;

    @Column(nullable = false)
    private Boolean whatsappCancelamentoEnviado = false;

    /** Valor cobrado pela sessão (herda o preço do procedimento por padrão). */
    private Double valor;

    /**
     * Forma de pagamento escolhida na criação. PIX gera cobrança/QR Code
     * automaticamente; CARTAO_LOCAL apenas marca que o pagamento será feito
     * presencialmente (sem gerar cobrança PIX).
     */
    @Enumerated(EnumType.STRING)
    private FormaPagamento formaPagamento = FormaPagamento.PIX;

    @Column(nullable = false)
    private Boolean pago = false;

    /** Id da cobrança PIX no gateway de pagamento (Asaas). */
    private String codigoPagamento;

    @Column(columnDefinition = "TEXT")
    private String qrCodePix;

    @Column(columnDefinition = "TEXT")
    private String pixCopiaECola;

    private String linkPagamento;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    private LocalDateTime atualizadoEm;

    @jakarta.persistence.PrePersist
    @jakarta.persistence.PreUpdate
    private void sanitizar() {
        this.descricao = SanitizadorUtil.limpar(descricao);
    }
}
