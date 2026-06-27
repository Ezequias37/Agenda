package com.lmbronze.agenda.config;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.lmbronze.agenda.model.Procedimento;
import com.lmbronze.agenda.model.Role;
import com.lmbronze.agenda.model.Usuario;
import com.lmbronze.agenda.repository.ProcedimentoRepository;
import com.lmbronze.agenda.repository.UsuarioRepository;

import jakarta.annotation.PostConstruct;

@Component
public class DataInitializer {

    private final ProcedimentoRepository procedimentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(ProcedimentoRepository procedimentoRepository,
                           UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder) {
        this.procedimentoRepository = procedimentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seed() {
        seedAdmin();
        seedProcedimentos();
    }

    private void seedAdmin() {
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
                if (atualizar) usuarioRepository.save(admin);
            }, () -> {
                Usuario admin = new Usuario();
                admin.setEmail("admin");
                admin.setSenha(passwordEncoder.encode("Rdcdutra1!"));
                admin.setRole(Role.ADMIN);
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
