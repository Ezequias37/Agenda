import { useEffect, useState } from 'react';
import { casoSucessoService } from '../services/casoSucessoService';
import { CasoSucessoCard } from '../components/CasoSucessoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { CasoSucesso } from '../types';

export default function CasosPendentesPage() {
  const [casos, setCasos] = useState<CasoSucesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendentes = async () => {
    try {
      setLoading(true);
      setError(null);
      setCasos(await casoSucessoService.listarPendentes());
    } catch {
      setError('Erro ao carregar os cases pendentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendentes(); }, []);

  const handleAprovar = async (id: number) => {
    try {
      await casoSucessoService.aprovar(id);
      setCasos(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Erro ao aprovar o case. Tente novamente.');
    }
  };

  const handleRejeitar = async (id: number) => {
    try {
      await casoSucessoService.rejeitar(id);
      setCasos(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Erro ao rejeitar o case. Tente novamente.');
    }
  };

  return (
    <main>
      <div className="container">
        <h1 className="page-title">📸 Cases Pendentes</h1>
        <p className="page-subtitle">Aprove os resultados enviados pelos clientes para gerar a imagem e a legenda prontas</p>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          casos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              <p style={{ fontSize: '1.2rem' }}>📭 Nenhum case pendente no momento</p>
            </div>
          ) : (
            <div className="item-list">
              {casos.map(caso => (
                <CasoSucessoCard key={caso.id} caso={caso} onAprovar={handleAprovar} onRejeitar={handleRejeitar} />
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
