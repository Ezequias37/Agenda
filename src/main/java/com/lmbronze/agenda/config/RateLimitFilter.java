package com.lmbronze.agenda.config;

import java.io.IOException;
import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.lmbronze.agenda.util.IpUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro de rate limiting por IP para as rotas mais sensíveis a abuso:
 * login (força bruta), criação de agendamento (spam) e upload de fotos
 * (consumo de disco/CPU pela geração de imagens).
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;

    public RateLimitFilter(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        RegraLimite regra = resolverRegra(request.getMethod(), request.getRequestURI());
        if (regra != null) {
            String chave = regra.nome() + ":" + IpUtils.extrairIp(request);
            if (!rateLimiterService.permitir(chave, regra.limite(), regra.janela())) {
                response.setStatus(429);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"erro\":\"Muitas requisições. Tente novamente em instantes.\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private RegraLimite resolverRegra(String metodo, String path) {
        if (!"POST".equals(metodo)) {
            return null;
        }
        if ("/auth/login".equals(path)) {
            return new RegraLimite("login", 5, Duration.ofMinutes(1));
        }
        if ("/api/agendamentos".equals(path)) {
            return new RegraLimite("agendamento", 10, Duration.ofMinutes(1));
        }
        if (isUploadDeFoto(path)) {
            return new RegraLimite("upload-foto", 5, Duration.ofMinutes(1));
        }
        return null;
    }

    private boolean isUploadDeFoto(String path) {
        return path.endsWith("/foto")
                || "/api/evolucao".equals(path)
                || "/api/casos".equals(path)
                || "/api/empresa/config".equals(path);
    }

    private record RegraLimite(String nome, int limite, Duration janela) {}
}
