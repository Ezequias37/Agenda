import type { Cliente } from '../types';
import { resolveUploadUrl } from '../utils/url';

interface ClientCardProps {
  cliente: Cliente;
  onEdit?: (cliente: Cliente) => void;
  onDelete?: (cliente: Cliente) => void;
}

export function ClientCard({ cliente, onEdit, onDelete }: ClientCardProps) {
  const foto = resolveUploadUrl(cliente.fotoUrl);
  return (
    <div className="item-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        {foto ? (
          <img src={foto} alt={cliente.nome} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--ca-primary)', color: '#fff', fontWeight: 700,
          }}>
            {cliente.nome?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <h3 style={{ margin: 0 }}>{cliente.nome}</h3>
      </div>
      <p>📧 <strong>{cliente.email}</strong></p>
      <p>📱 {cliente.telefone}</p>
      {(onEdit || onDelete) && (
        <div className="item-card-actions">
          {onEdit && <button onClick={() => onEdit(cliente)} className="btn btn-secondary btn-sm">✏️ Editar</button>}
          {onDelete && <button onClick={() => onDelete(cliente)} className="btn btn-danger btn-sm">🗑️ Excluir</button>}
        </div>
      )}
    </div>
  );
}
