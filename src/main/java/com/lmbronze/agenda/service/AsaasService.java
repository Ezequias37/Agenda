package com.lmbronze.agenda.service;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import javax.imageio.ImageIO;

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
 * (app.asaas.enabled=false ou api-key vazia), gera uma cobrança PIX
 * *simulada* (QR ilustrativo + payload de exemplo, claramente identificados
 * como simulação), para que o fluxo completo do frontend possa ser testado
 * sem depender de uma conta real no Asaas. A estrutura de integração real
 * já está pronta — basta configurar as credenciais para ativá-la.
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
     * Se a integração real estiver desativada/mal configurada, retorna uma
     * cobrança simulada (nunca null), para que o QR Code sempre apareça no
     * frontend durante os testes. Se a integração estiver ativada mas a
     * chamada real ao Asaas falhar, retorna null (não mascara falhas de uma
     * configuração que deveria estar funcionando).
     */
    public CobrancaPix gerarCobrancaPix(Agendamento agendamento) {
        Double valor = resolverValor(agendamento);
        if (valor == null || valor <= 0) {
            return null;
        }

        if (!enabled || apiKey.isBlank()) {
            return gerarCobrancaSimulada(valor);
        }

        Cliente cliente = agendamento.getCliente();
        if (cliente == null) {
            return gerarCobrancaSimulada(valor);
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

    private Double resolverValor(Agendamento agendamento) {
        Double valor = agendamento.getValor();
        if (valor == null && agendamento.getProcedimento() != null) {
            valor = agendamento.getProcedimento().getPreco();
        }
        return valor;
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

    /**
     * Gera uma cobrança PIX simulada (QR ilustrativo + payload de exemplo)
     * para uso quando a integração real com o Asaas não está configurada.
     * Deixa claro (no id e no payload) que se trata de uma simulação.
     */
    private CobrancaPix gerarCobrancaSimulada(Double valor) {
        String id = "SIMULADO-" + UUID.randomUUID();
        String qrCodeBase64 = gerarImagemQrSimulada(valor);
        String copiaECola = montarPayloadSimulado(valor);
        return new CobrancaPix(id, qrCodeBase64, copiaECola, null);
    }

    private String gerarImagemQrSimulada(Double valor) {
        try {
            int tamanho = 280;
            BufferedImage imagem = new BufferedImage(tamanho, tamanho, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = imagem.createGraphics();
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, tamanho, tamanho);

            // Padrão pseudo-aleatório só para parecer visualmente um QR Code (NÃO é um QR real/escaneável).
            Random random = new Random(valor != null ? Double.doubleToLongBits(valor) : 42L);
            int celula = 14;
            g.setColor(new Color(74, 20, 140));
            for (int y = 50; y < tamanho - 40; y += celula) {
                for (int x = 50; x < tamanho - 50; x += celula) {
                    if (random.nextBoolean()) {
                        g.fillRect(x, y, celula - 2, celula - 2);
                    }
                }
            }
            desenharMarcadorCanto(g, 8, 8);
            desenharMarcadorCanto(g, tamanho - 50, 8);
            desenharMarcadorCanto(g, 8, tamanho - 90);

            g.setColor(new Color(0, 137, 123));
            g.fillRect(0, tamanho - 34, tamanho, 34);
            g.setColor(Color.WHITE);
            g.setFont(new Font("SansSerif", Font.BOLD, 13));
            String valorTexto = String.format("PIX SIMULADO — R$ %.2f", valor != null ? valor : 0.0);
            g.drawString(valorTexto, 12, tamanho - 12);

            g.dispose();

            ByteArrayOutputStream saida = new ByteArrayOutputStream();
            ImageIO.write(imagem, "png", saida);
            return Base64.getEncoder().encodeToString(saida.toByteArray());
        } catch (IOException e) {
            return null;
        }
    }

    private void desenharMarcadorCanto(Graphics2D g, int x, int y) {
        g.setColor(new Color(74, 20, 140));
        g.fillRect(x, y, 42, 42);
        g.setColor(Color.WHITE);
        g.fillRect(x + 8, y + 8, 26, 26);
        g.setColor(new Color(74, 20, 140));
        g.fillRect(x + 14, y + 14, 14, 14);
    }

    private String montarPayloadSimulado(Double valor) {
        String valorFormatado = String.format("%.2f", valor != null ? valor : 0.0);
        return "00020126580014BR.GOV.BCB.PIX0136SIMULADO-CLICKAGENDA-" + UUID.randomUUID()
                + "520400005303986540" + valorFormatado.length() + valorFormatado
                + "5802BR5913CLICKAGENDA-SIM6009SAO PAULO62070503***6304SIMU";
    }

    public record CobrancaPix(String id, String qrCodeBase64, String copiaECola, String linkPagamento) {}
}
