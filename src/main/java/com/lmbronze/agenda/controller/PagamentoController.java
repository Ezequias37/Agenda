package com.lmbronze.agenda.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.repository.AgendamentoRepository;

import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/pagamentos")
public class PagamentoController {

    private final AgendamentoRepository agendamentoRepository;

    @Value("${app.asaas.webhook-token:}")
    private String webhookTokenEsperado;

    public PagamentoController(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    /**
     * Webhook público chamado pelo Asaas quando um pagamento é confirmado.
     * Protegido por um token compartilhado (configurado no painel do Asaas
     * e em app.asaas.webhook-token) enviado no header "asaas-access-token".
     */
    @PostMapping("/webhook/asaas")
    public ResponseEntity<?> webhookAsaas(
            @RequestHeader(value = "asaas-access-token", required = false) String tokenRecebido,
            @RequestBody Map<String, Object> payload) {

        if (webhookTokenEsperado.isBlank() || tokenRecebido == null || !webhookTokenEsperado.equals(tokenRecebido)) {
            return ResponseEntity.status(401).body(Map.of("erro", "Token de webhook inválido"));
        }

        String evento = String.valueOf(payload.get("event"));
        if (!"PAYMENT_CONFIRMED".equals(evento) && !"PAYMENT_RECEIVED".equals(evento)) {
            return ResponseEntity.ok().build();
        }

        Object paymentObj = payload.get("payment");
        if (!(paymentObj instanceof Map<?, ?> payment) || payment.get("id") == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Payload de pagamento inválido"));
        }

        String paymentId = payment.get("id").toString();
        agendamentoRepository.findByCodigoPagamento(paymentId).ifPresent(agendamento -> {
            agendamento.setPago(true);
            agendamentoRepository.save(agendamento);
        });

        return ResponseEntity.ok().build();
    }

    /** Resumo financeiro para o dashboard do ADMIN: faturamento e lista de pagamentos. */
    @GetMapping("/resumo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResumoPagamentosDTO resumo() {
        List<Agendamento> pagos = agendamentoRepository.findAll().stream()
                .filter(a -> Boolean.TRUE.equals(a.getPago()))
                .toList();

        LocalDate hoje = LocalDate.now();
        YearMonth mesAtual = YearMonth.now();
        LocalDate inicioJanela = hoje.minusDays(13);

        double faturamentoHoje = pagos.stream()
                .filter(a -> a.getDataHora().toLocalDate().equals(hoje))
                .mapToDouble(this::valorOuZero)
                .sum();

        double faturamentoMes = pagos.stream()
                .filter(a -> YearMonth.from(a.getDataHora()).equals(mesAtual))
                .mapToDouble(this::valorOuZero)
                .sum();

        Map<String, Double> faturamentoPorDia = pagos.stream()
                .filter(a -> !a.getDataHora().toLocalDate().isBefore(inicioJanela))
                .collect(Collectors.groupingBy(
                        a -> a.getDataHora().toLocalDate().toString(),
                        Collectors.summingDouble(this::valorOuZero)
                ));

        List<PagamentoDTO> pagamentos = pagos.stream()
                .sorted(Comparator.comparing(Agendamento::getDataHora).reversed())
                .map(a -> new PagamentoDTO(
                        a.getId(),
                        a.getCliente() != null ? a.getCliente().getNome() : null,
                        a.getProcedimento() != null ? a.getProcedimento().getNome() : null,
                        a.getValor(),
                        a.getDataHora()
                ))
                .toList();

        return new ResumoPagamentosDTO(faturamentoHoje, faturamentoMes, faturamentoPorDia, pagamentos);
    }

    private double valorOuZero(Agendamento a) {
        return a.getValor() != null ? a.getValor() : 0.0;
    }

    public record PagamentoDTO(Long id, String clienteNome, String procedimentoNome, Double valor, LocalDateTime dataHora) {}

    public record ResumoPagamentosDTO(double faturamentoHoje, double faturamentoMes,
                                       Map<String, Double> faturamentoPorDia, List<PagamentoDTO> pagamentos) {}
}
