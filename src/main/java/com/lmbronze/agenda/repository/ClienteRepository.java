package com.lmbronze.agenda.repository;

import com.lmbronze.agenda.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
