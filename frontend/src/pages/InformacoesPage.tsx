import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { obterEmpresaPublica } from '../services/empresaService';
import { procedimentoService } from '../services/procedimentoService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { EmpresaPublica, Procedimento } from '../types';

export function InformacoesPage() {
  const { branding, nomeExibicao } = useTheme();
  const empresaId = branding?.id ?? null;

  const [empresa, setEmpresa] = useState<EmpresaPublica | null>(null);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [proc, emp] = await Promise.all([
          procedimentoService.listar(),
          empresaId ? obterEmpresaPublica(empresaId) : Promise.resolve(null),
        ]);
        setProcedimentos(proc);
        setEmpresa(emp);
      } catch {
        setProcedimentos([]);
        setEmpresa(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [empresaId]);

  if (loading) return <main><div className="container"><LoadingSpinner /></div></main>;

  const oQueLevar = (empresa?.oQueLevar ?? '').split('\n').map(s => s.trim()).filter(Boolean);
  const recomendacoes = (empresa?.recomendacoes ?? '').split('\n').map(s => s.trim()).filter(Boolean);
  const principais = procedimentos.filter(p => p.categoria === 'bronzeamento');
  const complementares = procedimentos.filter(p => p.categoria === 'complementar');

  return (
    <main>
      <div className="container">
        <h1 className="page-title">📋 Informações do Serviço</h1>
        <p className="page-subtitle">Tudo que você precisa saber sobre a {nomeExibicao}</p>

        {/* Localização */}
        {empresa?.endereco && (
          <div className="form-section">
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1rem', fontSize: '1.5rem' }}>📍 Localização</h2>
            <p style={{ fontSize: '1.1rem', color: '#333', lineHeight: '1.8' }}>
              <strong>{empresa.endereco}</strong>
            </p>
          </div>
        )}

        {/* Contato */}
        {empresa?.telefone && (
          <div className="form-section">
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1rem', fontSize: '1.5rem' }}>📞 Contato</h2>
            <p style={{ fontSize: '1.1rem', color: '#333' }}>
              <strong>{empresa.telefone}</strong>
            </p>
          </div>
        )}

        {/* O que levar */}
        {oQueLevar.length > 0 && (
          <div className="form-section">
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>🎒 O que Levar</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Para sua sessão, leve os seguintes itens:</p>
            <div style={{ background: 'rgba(74, 20, 140, 0.06)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
              <ul style={{ listStylePosition: 'inside', lineHeight: '2', color: '#333' }}>
                {oQueLevar.map((item, idx) => (
                  <li key={idx}>✅ {item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recomendações */}
        {recomendacoes.length > 0 && (
          <div className="form-section">
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>💡 Recomendações</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Seguindo essas dicas, você terá uma sessão mais efetiva:</p>
            <div style={{ background: '#FFF3CD', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
              <ul style={{ listStylePosition: 'inside', lineHeight: '2', color: '#333' }}>
                {recomendacoes.map((item, idx) => (
                  <li key={idx}>⭐ {item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Procedimentos */}
        {procedimentos.length > 0 && (
          <div className="form-section">
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>🩺 Nossos Procedimentos</h2>

            {principais.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>⭐ Procedimentos Principais</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {principais.map(proc => (
                    <div key={proc.id} className="card">
                      <h3 style={{ marginBottom: '0.5rem' }}>{proc.nome}</h3>
                      <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>{proc.descricao}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>R$ {proc.preco.toFixed(2)}</span>
                        <span style={{ fontSize: '0.9rem', color: '#999' }}>⏱️ {proc.duracao}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complementares.length > 0 && (
              <div>
                <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.2rem' }}>✨ Procedimentos Complementares</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {complementares.map(proc => (
                    <div key={proc.id} className="card">
                      <h3 style={{ marginBottom: '0.5rem' }}>{proc.nome}</h3>
                      <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>{proc.descricao}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>R$ {proc.preco.toFixed(2)}</span>
                        <span style={{ fontSize: '0.9rem', color: '#999' }}>⏱️ {proc.duracao}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
