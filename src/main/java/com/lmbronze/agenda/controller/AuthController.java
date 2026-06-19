package com.lmbronze.agenda.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lmbronze.agenda.config.JwtService;
import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.model.Role;
import com.lmbronze.agenda.model.Usuario;
import com.lmbronze.agenda.repository.ClienteRepository;
import com.lmbronze.agenda.repository.UsuarioRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository,
                          PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (usuarioRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Email já cadastrado"));
        }

        Cliente cliente = new Cliente();
        cliente.setNome(req.nome());
        cliente.setEmail(req.email());
        cliente.setTelefone(req.telefone());
        Cliente clienteSalvo = clienteRepository.save(cliente);

        Usuario usuario = new Usuario();
        usuario.setEmail(req.email());
        usuario.setSenha(passwordEncoder.encode(req.senha()));
        usuario.setRole(Role.CLIENTE);
        usuario.setCliente(clienteSalvo);
        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(req.email(), Role.CLIENTE.name());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", Role.CLIENTE.name(),
                "nome", req.nome(),
                "email", req.email(),
                "clienteId", clienteSalvo.getId()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return usuarioRepository.findByEmail(req.email())
                .filter(u -> passwordEncoder.matches(req.senha(), u.getSenha()))
                .map(u -> {
                    String token = jwtService.generateToken(u.getEmail(), u.getRole().name());
                    String nome = u.getCliente() != null ? u.getCliente().getNome() : u.getEmail();
                    Long clienteId = u.getCliente() != null ? u.getCliente().getId() : null;
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "role", u.getRole().name(),
                            "nome", nome,
                            "email", u.getEmail(),
                            "clienteId", clienteId != null ? clienteId : 0
                    ));
                })
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/criar-admin")
    public ResponseEntity<?> criarAdmin(@RequestBody CriarAdminRequest req) {
        if (usuarioRepository.existsByRole(Role.ADMIN)) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Admin já existe"));
        }

        Usuario admin = new Usuario();
        admin.setEmail(req.email());
        admin.setSenha(passwordEncoder.encode(req.senha()));
        admin.setRole(Role.ADMIN);
        usuarioRepository.save(admin);

        return ResponseEntity.ok(Map.of("mensagem", "Admin criado com sucesso"));
    }

    public record RegisterRequest(String nome, String email, String telefone, String senha) {}
    public record LoginRequest(String email, String senha) {}
    public record CriarAdminRequest(String email, String senha) {}
}
