package com.lmbronze.agenda.config;

import java.time.Duration;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

import org.springframework.stereotype.Component;

/**
 * Rate limiter simples em memória (sliding window log), sem dependências
 * externas. Adequado para uma única instância; em um deploy com múltiplas
 * instâncias, seria necessário um backend compartilhado (ex: Redis).
 */
@Component
public class RateLimiterService {

    private final Map<String, Deque<Long>> historicoPorChave = new ConcurrentHashMap<>();

    /**
     * @return true se a requisição é permitida (dentro do limite); false se
     *         o limite já foi atingido na janela de tempo informada.
     */
    public boolean permitir(String chave, int limite, Duration janela) {
        long agora = System.currentTimeMillis();
        long corteInferior = agora - janela.toMillis();

        Deque<Long> timestamps = historicoPorChave.computeIfAbsent(chave, k -> new ConcurrentLinkedDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst() < corteInferior) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= limite) {
                return false;
            }
            timestamps.addLast(agora);
            return true;
        }
    }
}
