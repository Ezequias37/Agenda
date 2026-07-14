import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { casoSucessoService } from '../services/casoSucessoService';
import { useTheme } from '../contexts/ThemeContext';
import { resolveUploadUrl } from '../utils/url';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { CasoPublico } from '../types';

export default function VitrinePage() {
  const [searchParams] = useSearchParams();
  const { branding, nomeExibicao } = useTheme();
  const empresaId = Number(searchParams.get('empresaId') ?? branding?.id ?? 0) || null;

  const [casos, setCasos] = useState<CasoPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!empresaId) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setCasos(await casoSucessoService.listarPublicos(empresaId));
      } catch {
        setError('Erro ao carregar a vitrine de resultados');
      } finally {
        setLoading(false);
      }
    })();
  }, [empresaId]);

  return (
    <main>
      <div className="container">
        <h1 className="page-title">🌟 Vitrine de Resultados — {nomeExibicao}</h1>
        <p className="page-subtitle">Resultados reais de quem confia na {nomeExibicao}</p>

        {loading && <LoadingSpinner />}
        {error && <div className="error-box"><strong>❌ Erro</strong><p>{error}</p></div>}

        {!loading && !error && !empresaId && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <p style={{ fontSize: '1.2rem' }}>🔍 Não foi possível identificar a clínica desta vitrine</p>
          </div>
        )}

        {!loading && !error && empresaId && casos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <p style={{ fontSize: '1.2rem' }}>📭 Ainda não há resultados publicados</p>
          </div>
        )}

        {!loading && !error && casos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {casos.map(caso => (
              <div key={caso.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <img
                  src={resolveUploadUrl(caso.imagemUrl) ?? undefined}
                  alt={caso.titulo}
                  style={{ width: '100%', height: 260, objectFit: 'cover' }}
                />
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ marginBottom: 4 }}>{caso.titulo}</h3>
                  {caso.descricao && (
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 4 }}>"{caso.descricao}"</p>
                  )}
                  <p style={{ fontSize: '0.8rem', color: '#999' }}>
                    {caso.clienteNome ? `— ${caso.clienteNome}` : ''} {new Date(caso.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
