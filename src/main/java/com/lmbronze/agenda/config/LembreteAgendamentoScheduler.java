package com.lmbronze.agenda.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.model.StatusAgendamento;
import com.lmbronze.agenda.repository.AgendamentoRepository;
import com.lmbronze.agenda.service.WhatsAppService;

/**
 * Tarefa agendada que dispara o lembrete de WhatsApp 24h antes de cada
 * sessão. Roda a cada 15 minutos e busca agendamentos cuja dataHora caia
 * na janela [agora + 24h, agora + 24h15min), evitando duplicidade com a
 * flag whatsappLembreteEnviado.
 *
 * Roda fora de qualquer requisição HTTP, então o filtro multi-tenant do
 * Hibernate não está habilitado aqui — de propósito, pois o lembrete deve
 * ser verificado para os agendamentos de TODAS as empresas.
 */
@Component
public class LembreteAgendamentoScheduler {

    private final AgendamentoRepository agendamentoRepository;
    private final WhatsAppService whatsAppService;

    public LembreteAgendamentoScheduler(AgendamentoRepository agendamentoRepository, WhatsAppService whatsAppService) {
        this.agendamentoRepository = agendamentoRepository;
        this.whatsAppService = whatsAppService;
    }

    @Scheduled(cron = "0 0/15 * * * *")
    public void enviarLembretes() {
        LocalDateTime inicioJanela = LocalDateTime.now().plusHours(24);
        LocalDateTime fimJanela = inicioJanela.plusMinutes(15);

        List<Agendamento> proximos = agendamentoRepository
                .findByStatusAndWhatsappLembreteEnviadoFalseAndDataHoraBetween(
                        StatusAgendamento.AGENDADO, inicioJanela, fimJanela);

        for (Agendamento agendamento : proximos) {
            boolean enviado = whatsAppService.enviarLembrete(agendamento);
            if (enviado) {
                agendamento.setWhatsappLembreteEnviado(true);
                agendamentoRepository.save(agendamento);
            }
        }
    }
}
