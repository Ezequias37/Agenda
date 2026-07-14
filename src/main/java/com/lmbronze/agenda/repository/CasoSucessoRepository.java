package com.lmbronze.agenda.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lmbronze.agenda.model.CasoSucesso;

public interface CasoSucessoRepository extends JpaRepository<CasoSucesso, Long> {
    List<CasoSucesso> findByAprovadoFalseOrderByDataCriacaoDesc();
    List<CasoSucesso> findByClienteIdOrderByDataCriacaoDesc(Long clienteId);
    List<CasoSucesso> findByAprovadoTrueAndEmpresaIdOrderByDataCriacaoDesc(Long empresaId);
}
