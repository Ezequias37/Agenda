package com.lmbronze.agenda.service;

import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.lmbronze.agenda.model.CasoSucesso;

/**
 * Gera a legenda pronta (texto) para o admin copiar e postar nas redes
 * sociais junto com a imagem gerada por {@link GeradorImagemService}.
 */
@Service
public class GeradorLegendaService {

    private static final int LIMITE_INSTAGRAM = 2200;

    private static final String HASHTAGS =
            "#ClickAgenda #ResultadosReais #Estetica #BemEstar #Transformação #AntesEDepois #ClienteSatisfeita";

    public String gerarLegenda(CasoSucesso caso) {
        String nome = caso.getCliente() != null && caso.getCliente().getNome() != null
                ? caso.getCliente().getNome() : "Cliente";
        String nomeEmpresa = caso.getEmpresa() != null && caso.getEmpresa().getNomeFantasia() != null
                ? caso.getEmpresa().getNomeFantasia() : "CLICKAGENDA";
        String data = caso.getDataCriacao() != null
                ? caso.getDataCriacao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "";
        String depoimento = caso.getDescricao() != null ? caso.getDescricao().trim() : "";

        StringBuilder legenda = new StringBuilder();
        if (!depoimento.isEmpty()) {
            legenda.append("\"").append(depoimento).append("\"\n\n");
        }
        legenda.append("— ").append(nome);
        if (!data.isEmpty()) {
            legenda.append(" em ").append(data);
        }
        legenda.append("\n\n");
        legenda.append("Mais um resultado real de ").append(nomeEmpresa).append("! ✨\n\n");
        legenda.append(HASHTAGS);

        String resultado = legenda.toString();
        return resultado.length() > LIMITE_INSTAGRAM ? resultado.substring(0, LIMITE_INSTAGRAM) : resultado;
    }
}
