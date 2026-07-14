package com.lmbronze.agenda.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lmbronze.agenda.model.EvolucaoCliente;

public interface EvolucaoClienteRepository extends JpaRepository<EvolucaoCliente, Long> {
    List<EvolucaoCliente> findByClienteIdOrderByDataDesc(Long clienteId);
    List<EvolucaoCliente> findByAgendamentoIdOrderByDataDesc(Long agendamentoId);
}
