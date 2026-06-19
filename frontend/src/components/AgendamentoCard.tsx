import type { Agendamento } from '../types';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  onCancel: (id: number) => Promise<void>;
}

export function AgendamentoCard({ agendamento, onCancel }: AgendamentoCardProps) {
  const handleCancel = async () => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await onCancel(agendamento.id);
      } catch (error) {
        alert('Erro ao cancelar agendamento');
      }
    }
  };

  const data = new Date(agendamento.dataHora).toLocaleString('pt-BR');

  return (
    <div className="item-card" style={{ borderTopColor: agendamento.status === 'AGENDADO' ? 'var(--success)' : 'var(--danger)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3>☀️ {agendamento.cliente.nome}</h3>
        <span style={{
          backgroundColor: agendamento.status === 'AGENDADO' ? 'var(--success)' : 'var(--danger)',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 'bold'
        }}>
          {agendamento.status}
        </span>
      </div>
      <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'var(--primary)' }}>
        🌞 {agendamento.procedimento.nome}
      </p>
      <p style={{ marginBottom: '0.5rem', color: '#666' }}>
        💰 R$ {agendamento.procedimento.preco.toFixed(2)}
      </p>
      <p style={{ marginBottom: '1rem', color: '#999', fontSize: '0.9rem' }}>
        🕐 {data} | ⏱️ {agendamento.procedimento.duracao}
      </p>
      {agendamento.status === 'AGENDADO' && (
        <div className="item-card-actions">
          <button onClick={handleCancel} className="btn btn-danger btn-sm">
            ❌ Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

