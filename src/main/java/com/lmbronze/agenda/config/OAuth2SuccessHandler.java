package com.lmbronze.agenda.config;

import com.lmbronze.agenda.model.Cliente;
import com.lmbronze.agenda.model.Role;
import com.lmbronze.agenda.model.Usuario;
import com.lmbronze.agenda.repository.ClienteRepository;
import com.lmbronze.agenda.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final JwtService jwtService;

    public OAuth2SuccessHandler(UsuarioRepository usuarioRepository,
                                ClienteRepository clienteRepository,
                                JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String nome = oAuth2User.getAttribute("name");

        if (email == null) {
            getRedirectStrategy().sendRedirect(request, response,
                    frontendUrl + "/login?erro=google_sem_email");
            return;
        }

        Usuario usuario = usuarioRepository.findByEmail(email).orElseGet(() -> {
            Cliente cliente = clienteRepository.findByEmail(email).orElseGet(() -> {
                Cliente novoCliente = new Cliente();
                novoCliente.setNome(nome != null ? nome : email);
                novoCliente.setEmail(email);
                return clienteRepository.save(novoCliente);
            });

            Usuario novoUsuario = new Usuario();
            novoUsuario.setEmail(email);
            novoUsuario.setSenha(null);
            novoUsuario.setRole(Role.CLIENTE);
            novoUsuario.setCliente(cliente);
            return usuarioRepository.save(novoUsuario);
        });

        String token = jwtService.generateToken(email, usuario.getRole().name());
        String nomeUsuario = usuario.getCliente() != null ? usuario.getCliente().getNome() : email;
        Long clienteId = usuario.getCliente() != null ? usuario.getCliente().getId() : 0L;

        String redirectUrl = frontendUrl + "/oauth2/callback"
                + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&role=" + usuario.getRole().name()
                + "&nome=" + URLEncoder.encode(nomeUsuario, StandardCharsets.UTF_8)
                + "&email=" + URLEncoder.encode(email, StandardCharsets.UTF_8)
                + "&clienteId=" + clienteId;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
