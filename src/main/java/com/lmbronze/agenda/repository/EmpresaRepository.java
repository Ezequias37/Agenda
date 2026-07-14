package com.lmbronze.agenda.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lmbronze.agenda.model.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
}
