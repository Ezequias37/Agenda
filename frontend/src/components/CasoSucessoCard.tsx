import { useState } from 'react';
import type { CasoSucesso } from '../types';
import { resolveUploadUrl } from '../utils/url';

interface CasoSucessoCardProps {
  caso: CasoSucesso;
  onAprovar?: (id: number) => Promise<void>;
  onRejeitar?: (id: number) => Promise<void>;
}

export function CasoSucessoCard({ caso, onAprovar, onRejeitar }: CasoSucessoCardProps) {
  const [processando, setProcessando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const fotoOriginal = resolveUploadUrl(caso.fotoUrl);
  const imagemPronta = resolveUploadUrl(caso.imagemProntaUrl);

  const handleAprovar = async () => {
    if (!onAprovar) return;
    setProcessando(true);
    try { await onAprovar(caso.id); }
    finally { setProcessando(false); }
  };

  const handleRejeitar = async () => {
    if (!onRejeitar) return;
    if (!confirm('Tem certeza que deseja rejeitar (remover) este case?')) return;
    setProcessando(true);
    try { await onRejeitar(caso.id); }
    finally { setProcessando(false); }
  };

  const handleCopiarLegenda = async () => {
    if (!caso.legendaPronta) return;
    try {
      await navigator.clipboard.writeText(caso.legendaPronta);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert('Não foi possível copiar a legenda. Copie manualmente:\n\n' + caso.legendaPronta);
    }
  };

  return (
    <div className="item-card">
      <img
        src={imagemPronta || fotoOriginal || undefined}
        alt={caso.titulo}
        style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10, marginBottom: '0.75rem' }}
      />
      <h3 style={{ marginBottom: 4 }}>{caso.titulo}</h3>
      {caso.cliente?.nome && (
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 4 }}>👤 {caso.cliente.nome}</p>
      )}
      {caso.descricao && (
        <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: '0.75rem' }}>"{caso.descricao}"</p>
      )}

      {!caso.aprovado ? (
        <div className="item-card-actions">
          <button onClick={handleAprovar} disabled={processando} className="btn btn-primary btn-sm">
            {processando ? '⏳' : '✅ Aprovar'}
          </button>
          <button onClick={handleRejeitar} disabled={processando} className="btn btn-danger btn-sm">
            ❌ Rejeitar
          </button>
        </div>
      ) : (
        <>
          <span style={{
            display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#15803d',
            background: '#dcfce7', border: '1px solid #86efac', borderRadius: 20, padding: '3px 10px', marginBottom: '0.75rem',
          }}>
            ✅ Pronto para postar
          </span>
          <div className="item-card-actions">
            {imagemPronta && (
              <a href={imagemPronta} target="_blank" rel="noreferrer" download className="btn btn-secondary btn-sm">
                📥 Baixar Imagem
              </a>
            )}
            <button onClick={handleCopiarLegenda} className="btn btn-secondary btn-sm">
              {copiado ? '✅ Copiado!' : '📋 Copiar Legenda'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
