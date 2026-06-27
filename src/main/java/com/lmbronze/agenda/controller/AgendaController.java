package com.lmbronze.agenda.controller;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.model.Procedimento;
import com.lmbronze.agenda.model.StatusAgendamento;
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletarAgendamento(@PathVariable Long id) {
        return agendamentoRepository.findById(id)
                .map(existente -> {
                    agendamentoRepository.delete(existente);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- Cancelar agendamento (cliente: próprio + regra 1h; admin: qualquer) ---

    @PatchMapping("/agendamentos/{id}/cancelar")
    public ResponseEntity<?> cancelarAgendamento(@PathVariable Long id, Authentication auth) {
        Usuario usuario = (Usuario) auth.getPrincipal();
        return agendamentoRepository.findById(id)
                .map(existente -> {
                    // Cliente só pode cancelar o próprio
                    if (usuario.getCliente() != null) {
                        if (existente.getCliente() == null ||
                                !existente.getCliente().getId().equals(usuario.getCliente().getId())) {
                            return ResponseEntity.status(403).<Object>body(
                                    Map.of("erro", "Sem permissão para cancelar este agendamento"));
                        }
                        // Regra de 1h: clientes não podem cancelar com < 1h de antecedência
                        if (LocalDateTime.now().isAfter(existente.getDataHora().minusHours(1))) {
                            return ResponseEntity.badRequest().<Object>body(
                                    Map.of("erro", "Prazo de cancelamento expirado. Cancelamentos devem ser feitos com pelo menos 1 hora de antecedência."));
                        }
                    }
                    if (existente.getStatus() == StatusAgendamento.CANCELADO) {
                        return ResponseEntity.badRequest().<Object>body(
                                Map.of("erro", "Agendamento já está cancelado"));
                    }
                    existente.setStatus(StatusAgendamento.CANCELADO);
                    Agendamento salvo = agendamentoRepository.save(existente);
                    emailService.enviarCancelamentoAgendamento(salvo);
                    return ResponseEntity.ok().<Object>body(salvo);
                })
                .orElse(ResponseEntity.notFound().<Object>build());
    }

    // --- Horários disponíveis por data e procedimento ---

    @GetMapping("/agendamentos/horarios-disponiveis")
    public ResponseEntity<List<SlotDTO>> horariosDisponiveis(
            @RequestParam String data,
            @RequestParam String procedimentoId) {

        LocalDate date = LocalDate.parse(data);
        LocalDateTime inicio = date.atStartOfDay();
        LocalDateTime fimDia = date.plusDays(1).atStartOfDay();
        LocalDateTime encerramento = date.atTime(17, 0);

        boolean isMaquina = procedimentoId.contains("maquina");
        boolean isSol = procedimentoId.contains("natural");

        // Gerar slots do dia conforme tipo de procedimento
        List<LocalDateTime> horarios = new ArrayList<>();
        LocalDateTime cursor = date.atTime(7, 0);
        int intervaloMin = isSol ? 30 : 90; // sol: 30min entre slots; máquina/complementar: 90min
        while (!cursor.plusMinutes(90).isAfter(encerramento)) {
            horarios.add(cursor);
            cursor = cursor.plusMinutes(intervaloMin);
        }

        // Buscar agendamentos ativos do dia para a mesma categoria
        List<Agendamento> existentes = agendamentoRepository.findAll().stream()
                .filter(a -> !a.getDataHora().isBefore(inicio) && a.getDataHora().isBefore(fimDia))
                .filter(a -> a.getStatus() == StatusAgendamento.AGENDADO)
                .filter(a -> a.getProcedimento() != null)
                .filter(a -> {
                    String pid = a.getProcedimento().getId();
                    if (isMaquina) return pid.contains("maquina");
                    if (isSol) return pid.contains("natural");
                    return !pid.contains("maquina") && !pid.contains("natural");
                })
                .toList();

        // Calcular vagas por slot
        List<SlotDTO> resultado = horarios.stream().map(h -> {
            // Sol: primeiro horário (7h) aceita 5; demais aceitam 2. Máquina/complementar: 1
            int capacidade = isSol ? (h.getHour() == 7 && h.getMinute() == 0 ? 5 : 2) : 1;
            long ocupados = existentes.stream().filter(a -> a.getDataHora().isEqual(h)).count();
            int vagas = (int) Math.max(0, capacidade - ocupados);
            return new SlotDTO(h.toString(), capacidade, vagas, vagas > 0);
        }).toList();

        return ResponseEntity.ok(resultado);
    }

    public record SlotDTO(String dataHora, int capacidade, int vagas, boolean disponivel) {}
}
