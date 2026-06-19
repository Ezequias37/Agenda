package com.lmbronze.agenda.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
import com.lmbronze.agenda.model.Procedimento;
import com.lmbronze.agenda.model.Usuario;
import com.lmbronze.agenda.repository.AgendamentoRepository;
import com.lmbronze.agenda.repository.ClienteRepository;
import com.lmbronze.agenda.repository.ProcedimentoRepository;
import com.lmbronze.agenda.service.EmailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AgendaController {

    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final ProcedimentoRepository procedimentoRepository;
    private final EmailService emailService;

    public AgendaController(ClienteRepository clienteRepository, AgendamentoRepository agendamentoRepository,
                            ProcedimentoRepository procedimentoRepository, EmailService emailService) {
        this.clienteRepository = clienteRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.procedimentoRepository = procedimentoRepository;
        this.emailService = emailService;
    }

    // --- Procedimentos (público) ---

    @GetMapping("/procedimentos")
    public List<Procedimento> listarProcedimentos() {
        return procedimentoRepository.findAll();
    }

    // --- Clientes (admin) ---

    @GetMapping("/clientes")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    @GetMapping("/clientes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Cliente> buscarCliente(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/clientes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Cliente> criarCliente(@Valid @RequestBody Cliente cliente) {
        Cliente salvo = clienteRepository.save(cliente);
        return ResponseEntity.created(URI.create("/api/clientes/" + salvo.getId())).body(salvo);
    }

    @PutMapping("/clientes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Cliente> atualizarCliente(@PathVariable Long id, @Valid @RequestBody Cliente cliente) {
        return clienteRepository.findById(id)
                .map(existente -> {
                    existente.setNome(cliente.getNome());
                    existente.setEmail(cliente.getEmail());
                    existente.setTelefone(cliente.getTelefone());
                    return ResponseEntity.ok(clienteRepository.save(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/clientes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletarCliente(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(existente -> {
                    clienteRepository.delete(existente);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- Agendamentos (admin: todos; cliente: os seus) ---

    @GetMapping("/agendamentos")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Agendamento> listarAgendamentos() {
        return agendamentoRepository.findAll();
    }

    @GetMapping("/agendamentos/meus")
    public ResponseEntity<List<Agendamento>> meusAgendamentos(Authentication auth) {
        Usuario usuario = (Usuario) auth.getPrincipal();
        if (usuario.getCliente() == null) {
            return ResponseEntity.ok(List.of());
        }
        List<Agendamento> meus = agendamentoRepository.findAll().stream()
                .filter(a -> a.getCliente().getId().equals(usuario.getCliente().getId()))
                .toList();
        return ResponseEntity.ok(meus);
    }

    @GetMapping("/agendamentos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Agendamento> buscarAgendamento(@PathVariable Long id) {
        return agendamentoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/agendamentos")
    public ResponseEntity<Agendamento> criarAgendamento(@Valid @RequestBody Agendamento agendamento, Authentication auth) {
        Usuario usuario = (Usuario) auth.getPrincipal();

        // Se for CLIENTE, força o cliente logado
        if (usuario.getCliente() != null) {
            agendamento.setCliente(usuario.getCliente());
        }

        // Resolve o procedimento pelo ID se vier apenas com ID
        if (agendamento.getProcedimento() != null && agendamento.getProcedimento().getId() != null) {
            Procedimento proc = procedimentoRepository.findById(agendamento.getProcedimento().getId()).orElse(null);
            agendamento.setProcedimento(proc);
        }

        Agendamento salvo = agendamentoRepository.save(agendamento);
        emailService.enviarConfirmacaoAgendamento(salvo);
        return ResponseEntity.created(URI.create("/api/agendamentos/" + salvo.getId())).body(salvo);
    }

    @PutMapping("/agendamentos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Agendamento> atualizarAgendamento(@PathVariable Long id, @Valid @RequestBody Agendamento agendamento) {
        return agendamentoRepository.findById(id)
                .map(existente -> {
                    existente.setCliente(agendamento.getCliente());
                    existente.setDataHora(agendamento.getDataHora());
                    existente.setDescricao(agendamento.getDescricao());
                    existente.setStatus(agendamento.getStatus());
                    if (agendamento.getProcedimento() != null) {
                        existente.setProcedimento(agendamento.getProcedimento());
                    }
                    return ResponseEntity.ok(agendamentoRepository.save(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/agendamentos/{id}")
    public ResponseEntity<Void> deletarAgendamento(@PathVariable Long id, Authentication auth) {
        Usuario usuario = (Usuario) auth.getPrincipal();
        return agendamentoRepository.findById(id)
                .map(existente -> {
                    // CLIENTE só pode cancelar o próprio
                    if (usuario.getCliente() != null &&
                            !existente.getCliente().getId().equals(usuario.getCliente().getId())) {
                        return ResponseEntity.status(403).<Void>build();
                    }
                    emailService.enviarCancelamentoAgendamento(existente);
                    agendamentoRepository.delete(existente);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
