import type { Agendamento } from '../types';
import { WhatsAppStatusIcon } from './WhatsAppStatusIcon';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  onCancel: (id: number) => Promise<void>;
}

export function AgendamentoCard({ agendamento, onCancel }: AgendamentoCardProps) {
  const dentroDoLimite = agendamento.dataHora
    ? new Date() >= new Date(new Date(agendamento.dataHora).getTime() - 60 * 60 * 1000)
    : false;

  const handleCancel = async () => {
    if (dentroDoLimite) {
      alert('Prazo de cancelamento expirado. Cancele com pelo menos 1 hora de antecedência.');
      return;
    }
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try { await onCancel(agendamento.id); }
      catch { alert('Erro ao cancelar agendamento'); }
    }
  };

  const data = agendamento.dataHora
    ? new Date(agendamento.dataHora).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
  const nomeCliente = agendamento.cliente?.nome ?? '(cliente não informado)';
  const nomeProcedimento = agendamento.procedimento?.nome ?? '(procedimento não informado)';
  const preco = agendamento.procedimento?.preco?.toFixed(2) ?? '—';
  const duracao = agendamento.procedimento?.duracao ?? '—';

  const statusCor: Record<string, string> = {
    AGENDADO: 'var(--success)', CANCELADO: 'var(--danger)', CONCLUIDO: '#3182ce',
  };
  const cor = statusCor[agendamento.status] ?? '#888';

  return (
    <div className="item-card" style={{ borderTopColor: cor, opacity: agendamento.status === 'CANCELADO' ? 0.75 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3>👤 {nomeCliente}</h3>
        <span style={{ backgroundColor: cor, color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
          {agendamento.status}
        </span>
      </div>
      <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'var(--primary)' }}>🩺 {nomeProcedimento}</p>
      <p style={{ marginBottom: '0.5rem', color: '#666' }}>💰 R$ {preco}</p>
      <p style={{ marginBottom: '0.5rem', color: '#999', fontSize: '0.9rem' }}>🕐 {data} | ⏱️ {duracao}</p>
      <p style={{ marginBottom: '1rem' }}><WhatsAppStatusIcon agendamento={agendamento} /></p>
      {agendamento.status === 'AGENDADO' && (
        <div className="item-card-actions">
          {dentroDoLimite ? (
            <span style={{ fontSize: '0.8rem', color: '#e53e3e', fontWeight: 600 }}>⏰ Prazo de cancelamento expirado</span>
          ) : (
            <button onClick={handleCancel} className="btn btn-danger btn-sm">❌ Cancelar</button>
          )}
        </div>
      )}
    </div>
  );
}

