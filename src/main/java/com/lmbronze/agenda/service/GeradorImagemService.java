package com.lmbronze.agenda.service;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.lmbronze.agenda.model.CasoSucesso;
import com.lmbronze.agenda.model.Empresa;

/**
 * Gera a imagem final (1080x1080) de um caso de sucesso aprovado: foto da
 * cliente + overlay com depoimento, nome, data e logo da empresa, pronta
 * para ser baixada e postada em redes sociais.
 */
@Service
public class GeradorImagemService {

    private static final int TAMANHO = 1080;
    private static final int ALTURA_OVERLAY = 320;
    private static final int PADDING_X = 48;
    private static final int MAX_CARACTERES_DEPOIMENTO = 60;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String gerarImagemCaso(CasoSucesso caso) throws IOException {
        BufferedImage fotoOriginal = carregarImagemLocal(caso.getFotoUrl());
        BufferedImage base = redimensionarCobrindo(fotoOriginal, TAMANHO, TAMANHO);

        Graphics2D g = base.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        desenharOverlayInferior(g);
        desenharTextos(g, caso);
        desenharLogoEmpresa(g, caso.getEmpresa());
        desenharSeloClickAgenda(g);

        g.dispose();

        return salvarComoJpg(base, caso.getId());
    }

    private void desenharOverlayInferior(Graphics2D g) {
        g.setColor(new Color(0, 0, 0, 160));
        g.fillRect(0, TAMANHO - ALTURA_OVERLAY, TAMANHO, ALTURA_OVERLAY);
    }

    private void desenharTextos(Graphics2D g, CasoSucesso caso) {
        int y = TAMANHO - ALTURA_OVERLAY + 56;

        String nome = caso.getCliente() != null && caso.getCliente().getNome() != null
                ? caso.getCliente().getNome() : "Cliente";
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 42));
        g.drawString(nome, PADDING_X, y);

        y += 50;
        g.setFont(new Font("SansSerif", Font.PLAIN, 30));
        g.drawString("\"" + truncar(caso.getDescricao(), MAX_CARACTERES_DEPOIMENTO) + "\"", PADDING_X, y);

        y += 46;
        g.setFont(new Font("SansSerif", Font.ITALIC, 24));
        g.setColor(new Color(230, 230, 230));
        String dataTexto = caso.getDataCriacao() != null
                ? caso.getDataCriacao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "";
        g.drawString(dataTexto, PADDING_X, y);
    }

    private void desenharLogoEmpresa(Graphics2D g, Empresa empresa) {
        if (empresa == null || empresa.getLogoUrl() == null || empresa.getLogoUrl().isBlank()) {
            return;
        }
        try {
            BufferedImage logo = carregarImagemLocal(empresa.getLogoUrl());
            BufferedImage logoRedim = redimensionarContendo(logo, 120, 120);
            g.drawImage(logoRedim, TAMANHO - logoRedim.getWidth() - 32, 32, null);
        } catch (Exception e) {
            // Logo é um detalhe estético opcional; se não puder ser carregada, seguimos sem ela.
        }
    }

    private void desenharSeloClickAgenda(Graphics2D g) {
        g.setFont(new Font("SansSerif", Font.PLAIN, 16));
        g.setColor(new Color(255, 255, 255, 180));
        g.drawString("Tecnologia ClickAgenda", PADDING_X, TAMANHO - 16);
    }

    private String salvarComoJpg(BufferedImage imagemComAlfa, Long casoId) throws IOException {
        Path pastaDestino = Paths.get(uploadDir, "casos");
        Files.createDirectories(pastaDestino);

        String nomeArquivo = "case_" + casoId + "_" + System.currentTimeMillis() + ".jpg";
        Path destino = pastaDestino.resolve(nomeArquivo);

        // JPEG não suporta canal alfa: "achata" a imagem sobre um fundo branco antes de salvar.
        BufferedImage semAlfa = new BufferedImage(imagemComAlfa.getWidth(), imagemComAlfa.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = semAlfa.createGraphics();
        g.drawImage(imagemComAlfa, 0, 0, Color.WHITE, null);
        g.dispose();

        ImageIO.write(semAlfa, "jpg", destino.toFile());

        return "/uploads/casos/" + nomeArquivo;
    }

    /**
     * Carrega uma imagem já armazenada localmente pelo próprio sistema (via
     * FileStorageService). Por segurança (SSRF), URLs externas não são
     * suportadas aqui — apenas caminhos locais gerados pelos uploads do
     * próprio ClickAgenda.
     */
    private BufferedImage carregarImagemLocal(String url) throws IOException {
        if (url == null || url.isBlank()) {
            throw new IOException("URL de imagem vazia");
        }
        if (url.startsWith("http://") || url.startsWith("https://")) {
            throw new IOException("URLs externas não são suportadas por segurança; envie a foto pelo upload do sistema.");
        }

        String caminhoRelativo = url.startsWith("/uploads/") ? url.substring("/uploads/".length()) : url;
        Path base = Paths.get(uploadDir).normalize().toAbsolutePath();
        Path caminho = base.resolve(caminhoRelativo).normalize();

        if (!caminho.startsWith(base)) {
            throw new IOException("Caminho de imagem inválido");
        }

        BufferedImage imagem = ImageIO.read(caminho.toFile());
        if (imagem == null) {
            throw new IOException("Não foi possível ler a imagem: " + caminho);
        }
        return imagem;
    }

    /** Redimensiona cobrindo todo o quadro (crop central), tipo "object-fit: cover". */
    private BufferedImage redimensionarCobrindo(BufferedImage origem, int largura, int altura) {
        double escala = Math.max((double) largura / origem.getWidth(), (double) altura / origem.getHeight());
        int novaLargura = (int) Math.ceil(origem.getWidth() * escala);
        int novaAltura = (int) Math.ceil(origem.getHeight() * escala);
        Image escalada = origem.getScaledInstance(novaLargura, novaAltura, Image.SCALE_SMOOTH);

        BufferedImage resultado = new BufferedImage(largura, altura, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = resultado.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        int x = (largura - novaLargura) / 2;
        int y = (altura - novaAltura) / 2;
        g.drawImage(escalada, x, y, null);
        g.dispose();
        return resultado;
    }

    /** Redimensiona mantendo a proporção dentro de uma caixa máxima, tipo "object-fit: contain". */
    private BufferedImage redimensionarContendo(BufferedImage origem, int largura, int altura) {
        double escala = Math.min((double) largura / origem.getWidth(), (double) altura / origem.getHeight());
        int novaLargura = (int) Math.round(origem.getWidth() * escala);
        int novaAltura = (int) Math.round(origem.getHeight() * escala);
        Image escalada = origem.getScaledInstance(novaLargura, novaAltura, Image.SCALE_SMOOTH);

        BufferedImage resultado = new BufferedImage(novaLargura, novaAltura, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = resultado.createGraphics();
        g.drawImage(escalada, 0, 0, null);
        g.dispose();
        return resultado;
    }

    private String truncar(String texto, int max) {
        if (texto == null) return "";
        String limpo = texto.trim();
        return limpo.length() > max ? limpo.substring(0, max).trim() + "..." : limpo;
    }
}
