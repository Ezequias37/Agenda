package com.lmbronze.agenda.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Responsável por salvar arquivos enviados (uploads) em disco, de forma
 * segura: nunca usa o nome original do arquivo (evita path traversal) e
 * valida o tipo de conteúdo.
 */
@Service
public class FileStorageService {

    private static final List<String> TIPOS_IMAGEM_PERMITIDOS = List.of(
            "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String salvarImagem(MultipartFile arquivo, String subpasta) throws IOException {
        if (arquivo == null || arquivo.isEmpty()) {
            return null;
        }

        String contentType = arquivo.getContentType();
        if (contentType == null || !TIPOS_IMAGEM_PERMITIDOS.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido. Envie uma imagem (png, jpg, webp ou gif).");
        }

        String extensao = switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };

        String nomeArquivo = UUID.randomUUID() + extensao;
        Path pastaDestino = Paths.get(uploadDir, subpasta).normalize();
        Files.createDirectories(pastaDestino);
        Path destino = pastaDestino.resolve(nomeArquivo).normalize();

        Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + subpasta + "/" + nomeArquivo;
    }
}
