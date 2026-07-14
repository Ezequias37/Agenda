package com.lmbronze.agenda.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lmbronze.agenda.config.JwtService;
import com.lmbronze.agenda.config.LoginAttemptService;
import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.model.Empresa;
import com.lmbronze.agenda.model.Role;
import com.lmbronze.agenda.model.Usuario;
import com.lmbronze.agenda.repository.ClienteRepository;
import com.lmbronze.agenda.repository.EmpresaRepository;
import com.lmbronze.agenda.repository.UsuarioRepository;
import com.lmbronze.agenda.util.IpUtils;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;

    public AuthController(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository,
                          EmpresaRepository empresaRepository, PasswordEncoder passwordEncoder,
                          JwtService jwtService, LoginAttemptService loginAttemptService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.empresaRepository = empresaRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.loginAttemptService = loginAttemptService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (usuarioRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Email já cadastrado"));
        }

        Empresa empresa = resolverEmpresaParaCadastro(req.empresaId());
        if (empresa == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Empresa não identificada. Informe o empresaId."));
        }

        Cliente cliente = new Cliente();
        cliente.setNome(req.nome());
        cliente.setEmail(req.email());
        cliente.setTelefone(req.telefone());
        cliente.setEmpresa(empresa);
        Cliente clienteSalvo = clienteRepository.save(cliente);

        Usuario usuario = new Usuario();
        usuario.setEmail(req.email());
        usuario.setSenha(passwordEncoder.encode(req.senha()));
        usuario.setRole(Role.CLIENTE);
        usuario.setCliente(clienteSalvo);
        usuario.setEmpresa(empresa);
        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(req.email(), Role.CLIENTE.name());
        return ResponseEntity.ok(montarRespostaLogin(token, Role.CLIENTE, req.nome(), req.email(),
                clienteSalvo.getId(), empresa));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        String chaveBloqueio = IpUtils.extrairIp(request) + ":" + req.email();
        if (loginAttemptService.estaBloqueado(chaveBloqueio)) {
            long minutos = loginAttemptService.minutosRestantesBloqueio(chaveBloqueio);
            return ResponseEntity.status(429).body(Map.of("erro",
                    "Muitas tentativas de login. Tente novamente em " + minutos + " minuto(s)."));
        }

        return usuarioRepository.findByEmail(req.email())
                .filter(u -> passwordEncoder.matches(req.senha(), u.getSenha()))
                .map(u -> {
                    loginAttemptService.registrarSucesso(chaveBloqueio);
                    String token = jwtService.generateToken(u.getEmail(), u.getRole().name());
                    String nome = u.getCliente() != null ? u.getCliente().getNome() : u.getEmail();
                    Long clienteId = (u.getCliente() != null && u.getCliente().getId() != null)
                            ? u.getCliente().getId() : 0L;
                    return ResponseEntity.ok(montarRespostaLogin(token, u.getRole(), nome, u.getEmail(),
                            clienteId, u.getEmpresa()));
                })
                .orElseGet(() -> {
                    loginAttemptService.registrarFalha(chaveBloqueio);
                    return ResponseEntity.status(401).build();
                });
    }

    @PatchMapping("/senha")
    public ResponseEntity<?> alterarSenha(@RequestBody AlterarSenhaRequest req, Authentication auth) {
        Usuario usuario = (Usuario) auth.getPrincipal();

        if (req.senhaAtual() == null || !passwordEncoder.matches(req.senhaAtual(), usuario.getSenha())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Senha atual incorreta"));
        }
        if (req.novaSenha() == null || req.novaSenha().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("erro", "A nova senha deve ter pelo menos 6 caracteres"));
        }

        usuario.setSenha(passwordEncoder.encode(req.novaSenha()));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok(Map.of("mensagem", "Senha alterada com sucesso"));
    }

    @PostMapping("/criar-admin")
    public ResponseEntity<?> criarAdmin(@RequestBody CriarAdminRequest req) {
        if (usuarioRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Email já cadastrado"));
        }

        Empresa empresa = new Empresa();
        empresa.setNomeFantasia(req.nomeFantasia() != null && !req.nomeFantasia().isBlank()
                ? req.nomeFantasia() : "Minha Empresa");
        empresa = empresaRepository.save(empresa);

        Usuario admin = new Usuario();
        admin.setEmail(req.email());
        admin.setSenha(passwordEncoder.encode(req.senha()));
        admin.setRole(Role.ADMIN);
        admin.setEmpresa(empresa);
        usuarioRepository.save(admin);

        return ResponseEntity.ok(Map.of(
                "mensagem", "Empresa e administrador criados com sucesso",
                "empresaId", empresa.getId()
        ));
    }

    private Empresa resolverEmpresaParaCadastro(Long empresaId) {
        if (empresaId != null) {
            return empresaRepository.findById(empresaId).orElse(null);
        }
        // Fallback para ambientes single-tenant/transição: se só existir uma empresa cadastrada, usa ela.
        List<Empresa> todas = empresaRepository.findAll();
        return todas.size() == 1 ? todas.get(0) : null;
    }

    private Map<String, Object> montarRespostaLogin(String token, Role role, String nome, String email,
                                                      Long clienteId, Empresa empresa) {
        Map<String, Object> body = new HashMap<>();
        body.put("token", token);
        body.put("role", role.name());
        body.put("nome", nome);
        body.put("email", email);
        body.put("clienteId", clienteId != null ? clienteId : 0L);
        if (empresa != null) {
            Map<String, Object> empresaDto = new HashMap<>();
            empresaDto.put("id", empresa.getId());
            empresaDto.put("nomeFantasia", empresa.getNomeFantasia());
            empresaDto.put("logoUrl", empresa.getLogoUrl());
            empresaDto.put("corPrimaria", empresa.getCorPrimaria());
            empresaDto.put("corSecundaria", empresa.getCorSecundaria());
            body.put("empresa", empresaDto);
        }
        return body;
    }

    public record RegisterRequest(String nome, String email, String telefone, String senha, Long empresaId) {}
    public record LoginRequest(String email, String senha) {}
    public record CriarAdminRequest(String nomeFantasia, String email, String senha) {}
    public record AlterarSenhaRequest(String senhaAtual, String novaSenha) {}
}
