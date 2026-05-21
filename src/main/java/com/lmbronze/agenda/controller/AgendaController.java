package com.lmbronze.agenda.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.repository.AgendamentoRepository;
import com.lmbronze.agenda.repository.ClienteRepository;
import com.lmbronze.agenda.service.EmailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AgendaController {

    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final EmailService emailService;

    public AgendaController(ClienteRepository clienteRepository, AgendamentoRepository agendamentoRepository, EmailService emailService) {
        this.clienteRepository = clienteRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.emailService = emailService;
    }

    @GetMapping("/clientes")
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    @GetMapping("/clientes/{id}")
    public ResponseEntity<Cliente> buscarCliente(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/clientes")
    public ResponseEntity<Cliente> criarCliente(@Valid @RequestBody Cliente cliente) {
        Cliente salvo = clienteRepository.save(cliente);
        return ResponseEntity.created(URI.create("/api/clientes/" + salvo.getId())).body(salvo);
    }

    @PutMapping("/clientes/{id}")
    public ResponseEntity<Cliente> atualizarCliente(@PathVariable Long id, @Valid @RequestBody Cliente cliente) {
        return clienteRepository.findById(id)
                .map(existente -> {
                    existente.setNome(cliente.getNome());
                    existente.setEmail(cliente.getEmail());
                    existente.setTelefone(cliente.getTelefone());
                    Cliente atualizado = clienteRepository.save(existente);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/clientes/{id}")
    public ResponseEntity<Void> deletarCliente(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(existente -> {
                    clienteRepository.delete(existente);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/agendamentos")
    public List<Agendamento> listarAgendamentos() {
        return agendamentoRepository.findAll();
    }

    @GetMapping("/agendamentos/{id}")
    public ResponseEntity<Agendamento> buscarAgendamento(@PathVariable Long id) {
        return agendamentoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/agendamentos")
    public ResponseEntity<Agendamento> criarAgendamento(@Valid @RequestBody Agendamento agendamento) {
        Agendamento salvo = agendamentoRepository.save(agendamento);
        emailService.enviarConfirmacaoAgendamento(salvo);
        return ResponseEntity.created(URI.create("/api/agendamentos/" + salvo.getId())).body(salvo);
    }

    @PutMapping("/agendamentos/{id}")
    public ResponseEntity<Agendamento> atualizarAgendamento(@PathVariable Long id, @Valid @RequestBody Agendamento agendamento) {
        return agendamentoRepository.findById(id)
                .map(existente -> {
                    existente.setCliente(agendamento.getCliente());
                    existente.setDataHora(agendamento.getDataHora());
                    existente.setDescricao(agendamento.getDescricao());
                    existente.setStatus(agendamento.getStatus());
                    Agendamento atualizado = agendamentoRepository.save(existente);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/agendamentos/{id}")
    public ResponseEntity<Void> deletarAgendamento(@PathVariable Long id) {
        return agendamentoRepository.findById(id)
                .map(existente -> {
                    emailService.enviarCancelamentoAgendamento(existente);
                    agendamentoRepository.delete(existente);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
