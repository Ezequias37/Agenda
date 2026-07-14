package com.lmbronze.agenda.config;

import org.hibernate.Session;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.lmbronze.agenda.model.Usuario;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Habilita o filtro Hibernate "empresaFilter" (multi-tenant) para a
 * sessão/EntityManager da requisição atual, com base na empresa do usuário
 * autenticado. Como é um HandlerInterceptor (executado pelo DispatcherServlet),
 * ele roda depois que o EntityManager já foi aberto (Open Session In View),
 * garantindo que o filtro habilitado aqui valha para toda a requisição.
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Usuario usuario && usuario.getEmpresa() != null) {
            Long empresaId = usuario.getEmpresa().getId();
            TenantContext.setEmpresaId(empresaId);
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("empresaFilter").setParameter("empresaId", empresaId);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.clear();
    }
}
