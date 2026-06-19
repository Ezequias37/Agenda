import { INFORMACOES_SERVICO, PROCEDIMENTOS } from '../types';

export function InformacoesPage() {
  return (
    <main>
      <div className="container">
        <h1 className="page-title">📋 Informações do Serviço</h1>
        <p className="page-subtitle">Tudo que você precisa saber sobre nossos procedimentos</p>

        {/* Localização */}
        <div className="form-section">
          <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1rem', fontSize: '1.5rem' }}>📍 Localização</h2>
          <p style={{ fontSize: '1.1rem', color: '#333', lineHeight: '1.8' }}>
            <strong>{INFORMACOES_SERVICO.endereco}</strong>
          </p>
        </div>

        {/* Informações Gerais */}
        <div className="form-section">
          <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>⏱️ Duração</h2>
          <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '1rem' }}>
            As sessões de bronzeamento têm duração de <strong>{INFORMACOES_SERVICO.duracao}</strong>
          </p>
        </div>

        {/* O que levar */}
        <div className="form-section">
          <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>🎒 O que Levar</h2>
          <p style={{ marginBottom: '1rem', color: '#666' }}>Para sua sessão, leve os seguintes itens:</p>
          <div style={{ background: 'rgba(212, 165, 116, 0.1)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
            <ul style={{ listStylePosition: 'inside', lineHeight: '2', color: '#333' }}>
              {INFORMACOES_SERVICO.oQueLevr.map((item, idx) => (
                <li key={idx}>✅ {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recomendações */}
        <div className="form-section">
          <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>💡 Recomendações</h2>
          <p style={{ marginBottom: '1rem', color: '#666' }}>Seguindo essas dicas, você terá uma sessão mais efetiva:</p>
          <div style={{ background: '#FFF3CD', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
            <ul style={{ listStylePosition: 'inside', lineHeight: '2', color: '#333' }}>
              {INFORMACOES_SERVICO.recomendacoes.map((item, idx) => (
                <li key={idx}>⭐ {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Procedimentos */}
        <div className="form-section">
          <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>☀️ Nossos Procedimentos</h2>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>🌞 Bronzeamentos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {PROCEDIMENTOS.filter(p => p.categoria === 'bronzeamento').map(proc => (
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

          <div>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.2rem' }}>✨ Procedimentos Complementares</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {PROCEDIMENTOS.filter(p => p.categoria === 'complementar').map(proc => (
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
        </div>
      </div>
    </main>
  );
}
