package com.lmbronze.agenda.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.repository.ClienteRepository;

/**
 * Gera cobranças PIX via Asaas (https://www.asaas.com) para os
 * agendamentos. Se as credenciais não estiverem configuradas
 * (app.asaas.enabled=false ou api-key vazia), retorna null silenciosamente
 * — nunca lança exceção nem impede a criação do agendamento.
 */
@Service
public class AsaasService {

    private final RestClient restClient;
    private final ClienteRepository clienteRepository;

    @Value("${app.asaas.enabled:false}")
    private boolean enabled;

    @Value("${app.asaas.base-url:https://sandbox.asaas.com/api/v3}")
    private String baseUrl;

    @Value("${app.asaas.api-key:}")
    private String apiKey;

    public AsaasService(RestClient.Builder restClientBuilder, ClienteRepository clienteRepository) {
        this.restClient = restClientBuilder.build();
        this.clienteRepository = clienteRepository;
    }

    /**
     * Gera (ou tenta gerar) a cobrança PIX referente ao agendamento.
     * Retorna null se a integração estiver desativada, mal configurada, ou
     * se qualquer chamada à API do Asaas falhar — o agendamento continua
     * sendo criado normalmente, apenas sem QR Code.
     */
    public CobrancaPix gerarCobrancaPix(Agendamento agendamento) {
        if (!enabled || apiKey.isBlank()) {
            return null;
        }
        Cliente cliente = agendamento.getCliente();
        if (cliente == null) {
            return null;
        }

        Double valor = agendamento.getValor();
        if (valor == null && agendamento.getProcedimento() != null) {
            valor = agendamento.getProcedimento().getPreco();
        }
        if (valor == null || valor <= 0) {
            return null;
        }

        try {
            String customerId = garantirCliente(cliente);
            if (customerId == null) {
                return null;
            }

            LocalDate vencimento = agendamento.getDataHora().minusHours(1).toLocalDate();
            String descricao = "Agendamento" + (agendamento.getProcedimento() != null
                    ? " - " + agendamento.getProcedimento().getNome() : "");

            Map<String, Object> corpoPagamento = new HashMap<>();
            corpoPagamento.put("customer", customerId);
            corpoPagamento.put("billingType", "PIX");
            corpoPagamento.put("value", valor);
            corpoPagamento.put("dueDate", vencimento.toString());
            corpoPagamento.put("description", descricao);

            Map<?, ?> pagamento = restClient.post()
                    .uri(baseUrl + "/payments")
                    .header("access_token", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(corpoPagamento)
                    .retrieve()
                    .body(Map.class);

            if (pagamento == null || pagamento.get("id") == null) {
                return null;
            }
            String paymentId = pagamento.get("id").toString();
            String linkPagamento = pagamento.get("invoiceUrl") != null ? pagamento.get("invoiceUrl").toString() : null;

            Map<?, ?> qrCode = restClient.get()
                    .uri(baseUrl + "/payments/" + paymentId + "/pixQrCode")
                    .header("access_token", apiKey)
                    .retrieve()
                    .body(Map.class);

            String encodedImage = qrCode != null && qrCode.get("encodedImage") != null
                    ? qrCode.get("encodedImage").toString() : null;
            String payload = qrCode != null && qrCode.get("payload") != null
                    ? qrCode.get("payload").toString() : null;

            return new CobrancaPix(paymentId, encodedImage, payload, linkPagamento);
        } catch (Exception e) {
            System.err.println("❌ Erro ao gerar cobrança PIX via Asaas: " + e.getMessage());
            return null;
        }
    }

    /** Cria (ou reaproveita) o cliente correspondente no Asaas. */
    private String garantirCliente(Cliente cliente) {
        if (cliente.getAsaasCustomerId() != null && !cliente.getAsaasCustomerId().isBlank()) {
            return cliente.getAsaasCustomerId();
        }
        try {
            Map<String, Object> corpo = new HashMap<>();
            corpo.put("name", cliente.getNome());
            corpo.put("email", cliente.getEmail());
            if (cliente.getCpf() != null && !cliente.getCpf().isBlank()) {
                corpo.put("cpfCnpj", cliente.getCpf().replaceAll("\\D", ""));
            }

            Map<?, ?> resposta = restClient.post()
                    .uri(baseUrl + "/customers")
                    .header("access_token", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(corpo)
                    .retrieve()
                    .body(Map.class);

            if (resposta == null || resposta.get("id") == null) {
                return null;
            }
            String customerId = resposta.get("id").toString();
            cliente.setAsaasCustomerId(customerId);
            clienteRepository.save(cliente);
            return customerId;
        } catch (Exception e) {
            System.err.println("❌ Erro ao criar cliente no Asaas: " + e.getMessage());
            return null;
        }
    }

    public record CobrancaPix(String id, String qrCodeBase64, String copiaECola, String linkPagamento) {}
}
