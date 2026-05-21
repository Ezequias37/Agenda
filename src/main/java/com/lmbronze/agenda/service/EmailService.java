package com.lmbronze.agenda.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.lmbronze.agenda.model.Agendamento;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarConfirmacaoAgendamento(Agendamento agendamento) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom("noreply@agenda.com");
        message.setTo(agendamento.getCliente().getEmail());
        message.setSubject("Confirmação de Agendamento");
        
        String texto = String.format(
            "Olá %s,\n\n" +
            "Seu agendamento foi confirmado!\n\n" +
            "Detalhes:\n" +
            "Data e Hora: %s\n" +
            "Descrição: %s\n" +
            "Status: %s\n\n" +
            "Obrigado!",
            agendamento.getCliente().getNome(),
            agendamento.getDataHora(),
            agendamento.getDescricao(),
            agendamento.getStatus()
        );
        
        message.setText(texto);
        
        try {
            mailSender.send(message);
            System.out.println("Email enviado para: " + agendamento.getCliente().getEmail());
        } catch (Exception e) {
            System.err.println("Erro ao enviar email: " + e.getMessage());
        }
    }

    public void enviarCancelamentoAgendamento(Agendamento agendamento) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom("noreply@agenda.com");
        message.setTo(agendamento.getCliente().getEmail());
        message.setSubject("Cancelamento de Agendamento");
        
        String texto = String.format(
            "Olá %s,\n\n" +
            "Seu agendamento foi cancelado.\n\n" +
            "Detalhes:\n" +
            "Data e Hora: %s\n" +
            "Descrição: %s\n\n" +
            "Obrigado!",
            agendamento.getCliente().getNome(),
            agendamento.getDataHora(),
            agendamento.getDescricao()
        );
        
        message.setText(texto);
        
        try {
            mailSender.send(message);
            System.out.println("Email de cancelamento enviado para: " + agendamento.getCliente().getEmail());
        } catch (Exception e) {
            System.err.println("Erro ao enviar email: " + e.getMessage());
        }
    }
}
