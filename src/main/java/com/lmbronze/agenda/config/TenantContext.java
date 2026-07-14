package com.lmbronze.agenda.config;

/**
 * Contexto (ThreadLocal) com o id da empresa (tenant) do usuário autenticado
 * na requisição atual. Preenchido pelo {@link TenantInterceptor} e usado
 * pelos controllers/serviços que precisam saber "de qual empresa" é o
 * usuário logado.
 */
public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_EMPRESA_ID = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setEmpresaId(Long empresaId) {
        CURRENT_EMPRESA_ID.set(empresaId);
    }

    public static Long getEmpresaId() {
        return CURRENT_EMPRESA_ID.get();
    }

    public static void clear() {
        CURRENT_EMPRESA_ID.remove();
    }
}
