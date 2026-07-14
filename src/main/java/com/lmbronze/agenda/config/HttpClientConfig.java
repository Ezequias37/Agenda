package com.lmbronze.agenda.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Bean explícito de RestClient.Builder — necessário porque este projeto usa
 * o starter "webmvc" e a auto-configuração padrão do Spring Boot para
 * RestClient nem sempre é ativada automaticamente nesse cenário.
 */
@Configuration
public class HttpClientConfig {

    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
}
