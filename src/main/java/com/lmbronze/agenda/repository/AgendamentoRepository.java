package com.lmbronze.agenda.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.model.StatusAgendamento;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    List<Agendamento> findByStatusAndWhatsappLembreteEnviadoFalseAndDataHoraBetween(
            StatusAgendamento status, LocalDateTime inicio, LocalDateTime fim);

    Optional<Agendamento> findByCodigoPagamento(String codigoPagamento);
}
