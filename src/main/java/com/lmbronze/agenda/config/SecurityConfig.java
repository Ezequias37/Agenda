package com.lmbronze.agenda.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          CorsConfigurationSource corsConfigurationSource,
                          OAuth2SuccessHandler oAuth2SuccessHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/procedimentos").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/clientes").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/clientes").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/clientes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/clientes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/agendamentos").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/agendamentos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/agendamentos/meus").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/agendamentos/horarios-disponiveis").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/agendamentos").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/agendamentos/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/agendamentos/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
