package com.lmbronze.agenda.util;

import java.util.regex.Pattern;

/**
 * Sanitização simples de entradas de texto livre para reduzir o risco de
 * XSS armazenado: remove qualquer tag HTML/script antes de persistir.
 * Não faz HTML-escape (o React já escapa texto na renderização por
 * padrão); aqui o objetivo é impedir que marcações maliciosas (ex:
 * "&lt;script&gt;") cheguem a ser gravadas no banco.
 */
public final class SanitizadorUtil {

    private static final Pattern TAGS_HTML = Pattern.compile("<[^>]*>");

    private SanitizadorUtil() {
    }

    public static String limpar(String texto) {
        if (texto == null) {
            return null;
        }
        return TAGS_HTML.matcher(texto).replaceAll("").trim();
    }
}
