import type { Cliente } from '../types';
import { ClientCard } from './ClientCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface ClientListProps {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  onEdit?: (cliente: Cliente) => void;
  onDelete?: (cliente: Cliente) => void;
}

export function ClientList({ clientes, loading, error, onEdit, onDelete }: ClientListProps) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {clientes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <p style={{ fontSize: '1.2rem' }}>📭 Nenhum cliente cadastrado ainda</p>
          <p>Comece criando seu primeiro cliente!</p>
        </div>
      ) : (
        <div className="item-list">
          {clientes.map(cliente => (
            <ClientCard key={cliente.id} cliente={cliente} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
