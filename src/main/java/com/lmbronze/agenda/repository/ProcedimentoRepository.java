package com.lmbronze.agenda.repository;

import com.lmbronze.agenda.model.Procedimento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcedimentoRepository extends JpaRepository<Procedimento, String> {
}
