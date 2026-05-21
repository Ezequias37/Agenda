package com.lmbronze.agenda.repository;

import com.lmbronze.agenda.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
}
