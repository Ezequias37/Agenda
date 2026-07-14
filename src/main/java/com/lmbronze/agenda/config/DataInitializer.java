package com.lmbronze.agenda.config;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.lmbronze.agenda.model.Agendamento;
import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.model.Empresa;
import com.lmbronze.agenda.model.Procedimento;
import com.lmbronze.agenda.model.Role;
import com.lmbronze.agenda.model.Usuario;
import com.lmbronze.agenda.repository.AgendamentoRepository;
import com.lmbronze.agenda.repository.ClienteRepository;
import com.lmbronze.agenda.repository.EmpresaRepository;
import com.lmbronze.agenda.repository.ProcedimentoRepository;
import com.lmbronze.agenda.repository.UsuarioRepository;

import jakarta.annotation.PostConstruct;

@Component
public class DataInitializer {

    private final ProcedimentoRepository procedimentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(ProcedimentoRepository procedimentoRepository,
                           UsuarioRepository usuarioRepository,
                           ClienteRepository clienteRepository,
                           AgendamentoRepository agendamentoRepository,
                           EmpresaRepository empresaRepository,
                           PasswordEncoder passwordEncoder) {
        this.procedimentoRepository = procedimentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.empresaRepository = empresaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seed() {
        Empresa empresaPadrao = seedEmpresaPadrao();
        seedAdmin(empresaPadrao);
        seedProcedimentos();
        backfillEmpresaEmDadosExistentes(empresaPadrao);
    }

    private Empresa seedEmpresaPadrao() {
        return empresaRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    Empresa empresa = new Empresa();
                    empresa.setNomeFantasia("LM Bronzeamentos");
                    return empresaRepository.save(empresa);
                });
    }

    private void seedAdmin(Empresa empresaPadrao) {
        usuarioRepository.findAll().stream()
            .filter(u -> u.getRole() == Role.ADMIN)
            .findFirst()
            .ifPresentOrElse(admin -> {
                // Garante email e senha corretos mesmo se o DB foi criado com dados diferentes
                boolean atualizar = false;
                if (!"admin".equals(admin.getEmail())) {
                    admin.setEmail("admin");
                    atualizar = true;
                }
                if (!passwordEncoder.matches("Rdcdutra1!", admin.getSenha())) {
                    admin.setSenha(passwordEncoder.encode("Rdcdutra1!"));
                    atualizar = true;
                }
                if (admin.getEmpresa() == null) {
                    admin.setEmpresa(empresaPadrao);
                    atualizar = true;
                }
                if (atualizar) usuarioRepository.save(admin);
            }, () -> {
                Usuario admin = new Usuario();
                admin.setEmail("admin");
                admin.setSenha(passwordEncoder.encode("Rdcdutra1!"));
                admin.setRole(Role.ADMIN);
                admin.setEmpresa(empresaPadrao);
                usuarioRepository.save(admin);
            });
    }

    private void seedProcedimentos() {
        if (procedimentoRepository.count() > 0) return;

        List<Procedimento> procedimentos = List.of(
            proc("bronzeamento-maquina", "Bronzeamento Artificial (Máquina)", 100.0, "1h30min",
                    "Bronzeamento com equipamento profissional de UV", "bronzeamento"),
            proc("bronzeamento-maquina-banho-lua", "Bronzeamento Artificial + Banho de Lua", 110.0, "1h30min",
                    "Bronzeamento com máquina + descoloração suave", "bronzeamento"),
            proc("bronzeamento-natural", "Bronzeamento Natural (Sol)", 80.0, "1h30min",
                    "Bronzeamento ao sol com acompanhamento profissional", "bronzeamento"),
            proc("bronzeamento-natural-banho-lua", "Bronzeamento Natural + Banho de Lua", 90.0, "1h30min",
                    "Bronzeamento ao sol + descoloração suave", "bronzeamento"),
            proc("esfoliacao", "Esfoliação Corporal", 40.0, "45min",
                    "Esfoliação para preparar a pele para o bronzeamento", "complementar"),
            proc("banho-lua", "Banho de Lua (Descoloração)", 40.0, "30min",
                    "Descoloração suave dos pelos do corpo", "complementar")
        );

        procedimentoRepository.saveAll(procedimentos);
    }

    /**
     * Migração de dados pré-multi-tenant: qualquer Cliente/Agendamento que ainda
     * não tenha empresa_id (banco criado antes da Etapa 1) é vinculado à empresa
     * padrão, para não perder dados nem quebrar o filtro global por empresa.
     */
    private void backfillEmpresaEmDadosExistentes(Empresa empresaPadrao) {
        List<Cliente> clientesSemEmpresa = clienteRepository.findAll().stream()
                .filter(c -> c.getEmpresa() == null)
                .toList();
        clientesSemEmpresa.forEach(c -> c.setEmpresa(empresaPadrao));
        if (!clientesSemEmpresa.isEmpty()) clienteRepository.saveAll(clientesSemEmpresa);

        List<Agendamento> agendamentosSemEmpresa = agendamentoRepository.findAll().stream()
                .filter(a -> a.getEmpresa() == null)
                .toList();
        agendamentosSemEmpresa.forEach(a -> a.setEmpresa(empresaPadrao));
        if (!agendamentosSemEmpresa.isEmpty()) agendamentoRepository.saveAll(agendamentosSemEmpresa);

        List<Usuario> usuariosSemEmpresa = usuarioRepository.findAll().stream()
                .filter(u -> u.getEmpresa() == null)
                .toList();
        usuariosSemEmpresa.forEach(u -> u.setEmpresa(empresaPadrao));
        if (!usuariosSemEmpresa.isEmpty()) usuarioRepository.saveAll(usuariosSemEmpresa);
    }

    private Procedimento proc(String id, String nome, Double preco, String duracao, String descricao, String categoria) {
        Procedimento p = new Procedimento();
        p.setId(id);
        p.setNome(nome);
        p.setPreco(preco);
        p.setDuracao(duracao);
        p.setDescricao(descricao);
        p.setCategoria(categoria);
        return p;
    }
}
