package com.lmbronze.agenda.util;

import jakarta.servlet.http.HttpServletRequest;

/** Extrai o IP real do cliente, considerando proxies/load balancers comuns. */
public final class IpUtils {

    private IpUtils() {
    }

    public static String extrairIp(HttpServletRequest request) {
        String encaminhadoPor = request.getHeader("X-Forwarded-For");
        if (encaminhadoPor != null && !encaminhadoPor.isBlank()) {
            return encaminhadoPor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
