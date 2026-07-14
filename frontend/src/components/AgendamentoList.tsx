import type { Agendamento } from '../types';
import { AgendamentoCard } from './AgendamentoCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface AgendamentoListProps {
  agendamentos: Agendamento[];
  loading: boolean;
  error: string | null;
  onCancel: (id: number) => Promise<void>;
}

export function AgendamentoList({ agendamentos, loading, error, onCancel }: AgendamentoListProps) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const ativos = agendamentos.filter(a => a.status === 'AGENDADO');
  const outros = agendamentos.filter(a => a.status !== 'AGENDADO');

  if (agendamentos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        <p style={{ fontSize: '1.2rem' }}>📭 Nenhum agendamento registrado</p>
        <p>Crie um novo agendamento para começar!</p>
      </div>
    );
  }

  return (
    <div>
      {ativos.length > 0 && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', margin: '0 0 0.75rem' }}>📅 Agendados ({ativos.length})</h2>
          <div className="item-list" style={{ marginBottom: '1.5rem' }}>
            {ativos.map(a => <AgendamentoCard key={a.id} agendamento={a} onCancel={onCancel} />)}
          </div>
        </>
      )}
      {outros.length > 0 && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#718096', margin: '0 0 0.75rem' }}>📋 Histórico ({outros.length})</h2>
          <div className="item-list">
            {outros.map(a => <AgendamentoCard key={a.id} agendamento={a} onCancel={onCancel} />)}
          </div>
        </>
      )}
    </div>
  );
}
