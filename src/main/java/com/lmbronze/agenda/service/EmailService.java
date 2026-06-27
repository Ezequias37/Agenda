package com.lmbronze.agenda.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.lmbronze.agenda.model.Agendamento;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@lmbronzeamentos.com.br}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarConfirmacaoAgendamento(Agendamento agendamento) {
        if (agendamento.getCliente() == null || agendamento.getCliente().getEmail() == null) return;

        String nomeCliente = agendamento.getCliente().getNome();
        String procedimento = agendamento.getProcedimento() != null
                ? agendamento.getProcedimento().getNome() : "Sessão de bronzeamento";
        String dataHora = agendamento.getDataHora().toString().replace("T", " às ").substring(0, 19);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(agendamento.getCliente().getEmail());
        message.setSubject("☀️ Agendamento Confirmado – LM Bronzeamentos");
        message.setText(String.format(
                "Olá %s,\n\n" +
                "Seu agendamento foi confirmado com sucesso!\n\n" +
                "📋 Detalhes:\n" +
                "   Serviço: %s\n" +
                "   Data e Hora: %s\n\n" +
                "⚠️  IMPORTANTE – Prazo de Cancelamento:\n" +
                "   O cancelamento deve ser solicitado com pelo menos 1 hora de antecedência.\n" +
                "   Após esse prazo o sistema não permite mais cancelamentos.\n\n" +
                "Qualquer dúvida, entre em contato conosco.\n\n" +
                "Até breve! ☀️\n" +
                "Equipe LM Bronzeamentos",
                nomeCliente, procedimento, dataHora
        ));

        try {
            mailSender.send(message);
            System.out.println("✅ Email de confirmação enviado para: " + agendamento.getCliente().getEmail());
        } catch (Exception e) {
            System.err.println("❌ Erro ao enviar email de confirmação: " + e.getMessage());
        }
    }

    public void enviarCancelamentoAgendamento(Agendamento agendamento) {
        if (agendamento.getCliente() == null || agendamento.getCliente().getEmail() == null) return;

        String nomeCliente = agendamento.getCliente().getNome();
        String procedimento = agendamento.getProcedimento() != null
                ? agendamento.getProcedimento().getNome() : "Sessão de bronzeamento";
        String dataHora = agendamento.getDataHora().toString().replace("T", " às ").substring(0, 19);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(agendamento.getCliente().getEmail());
        message.setSubject("❌ Agendamento Cancelado – LM Bronzeamentos");
        message.setText(String.format(
                "Olá %s,\n\n" +
                "Seu agendamento foi cancelado.\n\n" +
                "📋 Detalhes do agendamento cancelado:\n" +
                "   Serviço: %s\n" +
                "   Data e Hora: %s\n\n" +
                "Para reagendar, acesse nosso sistema e escolha um novo horário.\n\n" +
                "Equipe LM Bronzeamentos",
                nomeCliente, procedimento, dataHora
        ));

        try {
            mailSender.send(message);
            System.out.println("✅ Email de cancelamento enviado para: " + agendamento.getCliente().getEmail());
        } catch (Exception e) {
            System.err.println("❌ Erro ao enviar email de cancelamento: " + e.getMessage());
        }
    }
}
