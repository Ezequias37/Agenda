import { useState } from 'react';
import type { Agendamento } from '../types';

interface PagamentoPixInfoProps {
  agendamento: Agendamento;
}

/** Bloco de pagamento PIX exibido na confirmação de um agendamento (quando o Asaas está configurado). */
export function PagamentoPixInfo({ agendamento }: PagamentoPixInfoProps) {
  const [copiado, setCopiado] = useState(false);

  if (!agendamento.qrCodePix && !agendamento.pixCopiaECola && !agendamento.linkPagamento) {
    return null;
  }

  const handleCopiar = async () => {
    if (!agendamento.pixCopiaECola) return;
    try {
      await navigator.clipboard.writeText(agendamento.pixCopiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert('Não foi possível copiar automaticamente. Copie o código abaixo:\n\n' + agendamento.pixCopiaECola);
    }
  };

  return (
    <div style={{ background: 'var(--light)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', margin: '1rem 0', textAlign: 'center' }}>
      <p style={{ fontWeight: 700, color: 'var(--ca-primary)', marginBottom: '0.75rem' }}>
        💳 Pague com PIX{agendamento.valor != null ? ` — R$ ${agendamento.valor.toFixed(2)}` : ''}
      </p>
      {agendamento.qrCodePix && (
        <img
          src={`data:image/png;base64,${agendamento.qrCodePix}`}
          alt="QR Code para pagamento PIX"
          style={{ width: 200, height: 200, margin: '0 auto 0.75rem', display: 'block', borderRadius: 8 }}
        />
      )}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {agendamento.pixCopiaECola && (
          <button type="button" onClick={handleCopiar} className="btn btn-secondary btn-sm">
            {copiado ? '✅ Copiado!' : '📋 Copiar código PIX'}
          </button>
        )}
        {agendamento.linkPagamento && (
          <a href={agendamento.linkPagamento} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
            🔗 Abrir pagamento
          </a>
        )}
      </div>
    </div>
  );
}
