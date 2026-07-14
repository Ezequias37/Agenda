package com.lmbronze.agenda.service;

import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.lmbronze.agenda.model.Agendamento;

/**
 * Envia notificações de agendamento via WhatsApp usando a Z-API
 * (https://www.z-api.io). Se as credenciais não estiverem configuradas
 * (app.zapi.enabled=false ou instanceId/token vazios), os métodos apenas
 * registram um aviso e retornam false — nunca lançam exceção para não
 * quebrar o fluxo principal de agendamento.
 */
@Service
public class WhatsAppService {

    private static final DateTimeFormatter FORMATO_DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    private final RestClient restClient;

    @Value("${app.zapi.enabled:false}")
    private boolean enabled;

    @Value("${app.zapi.base-url:https://api.z-api.io}")
    private String baseUrl;

    @Value("${app.zapi.instance-id:}")
    private String instanceId;

    @Value("${app.zapi.token:}")
    private String token;

    @Value("${app.zapi.client-token:}")
    private String clientToken;

    public WhatsAppService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public boolean enviarConfirmacao(Agendamento agendamento) {
        return enviar(agendamento, montarMensagemConfirmacao(agendamento));
    }

    public boolean enviarLembrete(Agendamento agendamento) {
        return enviar(agendamento, montarMensagemLembrete(agendamento));
    }

    public boolean enviarCancelamento(Agendamento agendamento) {
        return enviar(agendamento, montarMensagemCancelamento(agendamento));
    }

    private boolean enviar(Agendamento agendamento, String mensagem) {
        if (!enabled || instanceId.isBlank() || token.isBlank()) {
            return false;
        }
        String telefone = agendamento.getCliente() != null ? agendamento.getCliente().getTelefone() : null;
        if (telefone == null || telefone.isBlank()) {
            return false;
        }

        try {
            String url = "%s/instances/%s/token/%s/send-text".formatted(baseUrl, instanceId, token);
            restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Client-Token", clientToken)
                    .body(Map.of("phone", normalizarTelefone(telefone), "message", mensagem))
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            System.err.println("❌ Erro ao enviar WhatsApp via Z-API: " + e.getMessage());
            return false;
        }
    }

    private String normalizarTelefone(String telefone) {
        String digitos = telefone.replaceAll("\\D", "");
        if (digitos.length() <= 11) {
            digitos = "55" + digitos;
        }
        return digitos;
    }

    private String nomeProcedimento(Agendamento agendamento) {
        return agendamento.getProcedimento() != null ? agendamento.getProcedimento().getNome() : "sua sessão";
    }

    private String nomeEmpresa(Agendamento agendamento) {
        return agendamento.getEmpresa() != null && agendamento.getEmpresa().getNomeFantasia() != null
                ? agendamento.getEmpresa().getNomeFantasia() : "ClickAgenda";
    }

    private String montarMensagemConfirmacao(Agendamento agendamento) {
        return "✅ Olá, %s! Seu agendamento em %s foi confirmado.\n📋 %s\n🗓️ %s\n\nQualquer imprevisto, entre em contato conosco."
                .formatted(
                        nomeCliente(agendamento), nomeEmpresa(agendamento), nomeProcedimento(agendamento),
                        agendamento.getDataHora().format(FORMATO_DATA_HORA)
                );
    }

    private String montarMensagemLembrete(Agendamento agendamento) {
        return "🔔 Olá, %s! Lembrando que você tem uma sessão amanhã em %s.\n📋 %s\n🗓️ %s\n\nAté breve!"
                .formatted(
                        nomeCliente(agendamento), nomeEmpresa(agendamento), nomeProcedimento(agendamento),
                        agendamento.getDataHora().format(FORMATO_DATA_HORA)
                );
    }

    private String montarMensagemCancelamento(Agendamento agendamento) {
        return "❌ Olá, %s! Seu agendamento em %s foi cancelado.\n📋 %s\n🗓️ %s\n\nPara reagendar, acesse nosso sistema."
                .formatted(
                        nomeCliente(agendamento), nomeEmpresa(agendamento), nomeProcedimento(agendamento),
                        agendamento.getDataHora().format(FORMATO_DATA_HORA)
                );
    }

    private String nomeCliente(Agendamento agendamento) {
        return agendamento.getCliente() != null && agendamento.getCliente().getNome() != null
                ? agendamento.getCliente().getNome() : "cliente";
    }
}
