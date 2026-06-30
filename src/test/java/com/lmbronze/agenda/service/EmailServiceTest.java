package com.lmbronze.agenda.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.model.StatusAgendamento;

class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@agenda.com");
    }

    @Test
    void deveEnviarEmailConfirmacaoDeAgendamento() {
        Cliente cliente = new Cliente();
        cliente.setNome("João");
        cliente.setEmail("joao@example.com");

        Agendamento agendamento = new Agendamento();
        agendamento.setCliente(cliente);
        agendamento.setDataHora(LocalDateTime.of(2026, 5, 20, 14, 30));
        agendamento.setDescricao("Consulta de rotina");
        agendamento.setStatus(StatusAgendamento.AGENDADO);

        emailService.enviarConfirmacaoAgendamento(agendamento);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        org.mockito.Mockito.verify(mailSender).send(captor.capture());

        SimpleMailMessage message = captor.getValue();
        assertEquals("noreply@agenda.com", message.getFrom());
        assertArrayEquals(new String[] {"joao@example.com"}, message.getTo());
        assertEquals("☀️ Agendamento Confirmado – LM Bronzeamentos", message.getSubject());
        assertEquals(
            "Olá João,\n\n" +
            "Seu agendamento foi confirmado com sucesso!\n\n" +
            "📋 Detalhes:\n" +
            "   Serviço: Sessão de bronzeamento\n" +
            "   Data e Hora: 2026-05-20 às 14:30\n\n" +
            "⚠️  IMPORTANTE – Prazo de Cancelamento:\n" +
            "   O cancelamento deve ser solicitado com pelo menos 1 hora de antecedência.\n" +
            "   Após esse prazo o sistema não permite mais cancelamentos.\n\n" +
            "Qualquer dúvida, entre em contato conosco.\n\n" +
            "Até breve! ☀️\n" +
            "Equipe LM Bronzeamentos",
            message.getText()
        );
    }

    @Test
    void deveEnviarEmailCancelamentoDeAgendamento() {
        Cliente cliente = new Cliente();
        cliente.setNome("Maria");
        cliente.setEmail("maria@example.com");

        Agendamento agendamento = new Agendamento();
        agendamento.setCliente(cliente);
        agendamento.setDataHora(LocalDateTime.of(2026, 5, 22, 9, 0));
        agendamento.setDescricao("Retirada de documento");
        agendamento.setStatus(StatusAgendamento.CANCELADO);

        emailService.enviarCancelamentoAgendamento(agendamento);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        org.mockito.Mockito.verify(mailSender).send(captor.capture());

        SimpleMailMessage message = captor.getValue();
        assertEquals("noreply@agenda.com", message.getFrom());
        assertArrayEquals(new String[] {"maria@example.com"}, message.getTo());
        assertEquals("❌ Agendamento Cancelado – LM Bronzeamentos", message.getSubject());
        assertEquals(
            "Olá Maria,\n\n" +
            "Seu agendamento foi cancelado.\n\n" +
            "📋 Detalhes do agendamento cancelado:\n" +
            "   Serviço: Sessão de bronzeamento\n" +
            "   Data e Hora: 2026-05-22 às 09:00\n\n" +
            "Para reagendar, acesse nosso sistema e escolha um novo horário.\n\n" +
            "Equipe LM Bronzeamentos",
            message.getText()
        );
    }
}

