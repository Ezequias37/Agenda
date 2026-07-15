package com.lmbronze.agenda.model;

/**
 * Forma de pagamento escolhida pelo cliente ao agendar. Por enquanto,
 * CARTAO_LOCAL significa apenas "vai pagar no local, sem cobrança PIX
 * gerada automaticamente" — não há integração real com maquininha/cartão
 * ainda (melhoria futura).
 */
public enum FormaPagamento {
    PIX,
    CARTAO_LOCAL
}
