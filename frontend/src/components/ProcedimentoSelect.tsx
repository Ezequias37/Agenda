import type { Procedimento } from '../types';

interface ProcedimentoSelectProps {
  procedimentos: Procedimento[];
  selected: Procedimento | null;
  onChange: (proc: Procedimento) => void;
}

export function ProcedimentoSelect({ procedimentos, selected, onChange }: ProcedimentoSelectProps) {
  const bronzeamentos = procedimentos.filter(p => p.categoria === 'bronzeamento');
  const complementares = procedimentos.filter(p => p.categoria === 'complementar');

  return (
    <div className="form-group">
      <label>🩺 Selecione o Procedimento</label>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--primary-dark)', marginBottom: '1rem', fontSize: '1rem' }}>🌞 Bronzeamentos</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {bronzeamentos.map(proc => (
            <label key={proc.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              border: selected?.id === proc.id ? '2px solid var(--primary)' : '2px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: selected?.id === proc.id ? 'rgba(74, 20, 140, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
            }}>
              <input
                type="radio"
                name="procedimento"
                value={proc.id}
                checked={selected?.id === proc.id}
                onChange={() => onChange(proc)}
                style={{ marginRight: '1rem', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--dark)', marginBottom: '0.25rem' }}>
                  {proc.nome}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  ⏱️ {proc.duracao}
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                R$ {proc.preco.toFixed(2)}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ color: 'var(--primary-dark)', marginBottom: '1rem', fontSize: '1rem' }}>✨ Procedimentos Complementares</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {complementares.map(proc => (
            <label key={proc.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              border: selected?.id === proc.id ? '2px solid var(--primary)' : '2px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: selected?.id === proc.id ? 'rgba(74, 20, 140, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
            }}>
              <input
                type="radio"
                name="procedimento"
                value={proc.id}
                checked={selected?.id === proc.id}
                onChange={() => onChange(proc)}
                style={{ marginRight: '1rem', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--dark)', marginBottom: '0.25rem' }}>
                  {proc.nome}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  ⏱️ {proc.duracao}
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                R$ {proc.preco.toFixed(2)}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
