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

  const agendadosEms = agendamentos.filter(a => a.status === 'AGENDADO');

  return (
    <div>
      {agendadosEms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <p style={{ fontSize: '1.2rem' }}>📭 Nenhum agendamento ativo</p>
          <p>Comece criando um novo agendamento!</p>
        </div>
      ) : (
        <div className="item-list">
          {agendadosEms.map(agendamento => (
            <AgendamentoCard
              key={agendamento.id}
              agendamento={agendamento}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
