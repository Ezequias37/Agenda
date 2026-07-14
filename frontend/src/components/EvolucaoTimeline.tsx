import type { EvolucaoCliente } from '../types';
import { resolveUploadUrl } from '../utils/url';

interface EvolucaoTimelineProps {
  evolucoes: EvolucaoCliente[];
  loading?: boolean;
}

export function EvolucaoTimeline({ evolucoes, loading }: EvolucaoTimelineProps) {
  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  if (evolucoes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
        <p style={{ fontSize: '1.2rem' }}>📸 Nenhuma evolução registrada ainda</p>
        <p style={{ fontSize: '0.9rem' }}>Adicione fotos após suas sessões concluídas para acompanhar seu progresso!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {evolucoes.map(ev => (
        <div
          key={ev.id}
          style={{
            display: 'flex', gap: '1rem', background: '#fff', borderRadius: 14,
            padding: '0.85rem', boxShadow: '0 2px 12px rgba(74,20,140,0.08)', border: '1px solid var(--border)',
          }}
        >
          <img
            src={resolveUploadUrl(ev.fotoUrl) ?? undefined}
            alt="Evolução"
            style={{ width: 84, height: 84, borderRadius: 10, objectFit: 'cover', flexShrink: 0, background: 'var(--light)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--ca-primary-light)', marginBottom: 4 }}>
              🗓️ {new Date(ev.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            {ev.descricao && (
              <p style={{ fontSize: '0.9rem', color: '#333', margin: 0 }}>{ev.descricao}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
