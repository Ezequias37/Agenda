package com.lmbronze.agenda.config;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Controla o bloqueio de login por força bruta: após 5 falhas consecutivas
 * para a mesma chave (IP + email), bloqueia novas tentativas por 15
 * minutos. Estado mantido em memória (por instância da aplicação).
 */
@Component
public class LoginAttemptService {

    private static final int MAX_TENTATIVAS = 5;
    private static final Duration DURACAO_BLOQUEIO = Duration.ofMinutes(15);

    private final Map<String, Tentativas> tentativasPorChave = new ConcurrentHashMap<>();

    public boolean estaBloqueado(String chave) {
        Tentativas tentativas = tentativasPorChave.get(chave);
        if (tentativas == null || tentativas.bloqueadoAte == null) {
            return false;
        }
        if (Instant.now().isBefore(tentativas.bloqueadoAte)) {
            return true;
        }
        // Bloqueio expirado: limpa o histórico para essa chave.
        tentativasPorChave.remove(chave);
        return false;
    }

    public void registrarFalha(String chave) {
        Tentativas tentativas = tentativasPorChave.computeIfAbsent(chave, k -> new Tentativas());
        synchronized (tentativas) {
            tentativas.falhas++;
            if (tentativas.falhas >= MAX_TENTATIVAS) {
                tentativas.bloqueadoAte = Instant.now().plus(DURACAO_BLOQUEIO);
            }
        }
    }

    public void registrarSucesso(String chave) {
        tentativasPorChave.remove(chave);
    }

    public long minutosRestantesBloqueio(String chave) {
        Tentativas tentativas = tentativasPorChave.get(chave);
        if (tentativas == null || tentativas.bloqueadoAte == null) {
            return 0;
        }
        long minutos = Duration.between(Instant.now(), tentativas.bloqueadoAte).toMinutes();
        return Math.max(minutos, 1);
    }

    private static final class Tentativas {
        int falhas = 0;
        Instant bloqueadoAte;
    }
}
