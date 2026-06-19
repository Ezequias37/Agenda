package com.lmbronze.agenda.repository;

import com.lmbronze.agenda.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByRole(com.lmbronze.agenda.model.Role role);
}
