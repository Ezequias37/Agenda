import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { agendamentoService } from '../../services/agendamentoService';
import type { Agendamento } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import { AgendamentoForm } from '../../components/AgendamentoForm';

const STATUS_LABEL: Record<string, string> = {
  AGENDADO: 'Agendado',
  CANCELADO: 'Cancelado',
  CONCLUIDO: 'Concluido',
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  AGENDADO:  { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' },
  CANCELADO: { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' },
  CONCLUIDO: { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' },
};

export default function MeusAgendamentosPage() {
  const { usuario } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmacaoHora, setConfirmacaoHora] = useState<string | null>(null);

  const fetchMeus = async () => {
    try { setLoading(true); setError(null); setAgendamentos(await agendamentoService.getMeusAgendamentos()); }
    catch { setError('Erro ao carregar seus agendamentos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMeus(); }, []);

  const handleCancelar = async (id: number) => {
    const ag = agendamentos.find(a => a.id === id);
    if (ag?.dataHora) {
      const limite = new Date(new Date(ag.dataHora).getTime() - 60 * 60 * 1000);
      if (new Date() >= limite) {
        alert('Prazo de cancelamento expirado. Cancele com pelo menos 1 hora de antecedência.');
        return;
      }
    }
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try { await agendamentoService.cancelarAgendamento(id); await fetchMeus(); }
    catch { alert('Erro ao cancelar agendamento'); }
  };

  const formatarData = (dataHora: string) =>
    new Date(dataHora).toLocaleString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const ativos = agendamentos.filter(a => a.status === 'AGENDADO');
  const historico = agendamentos.filter(a => a.status !== 'AGENDADO');
  const nome = usuario?.nome?.split(' ')[0] ?? '';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fef3e2 0%, #f9f7f4 100%)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)', padding: '2rem 1.5rem 3.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'rgba(253,230,138,0.9)', fontSize: '0.9rem', margin: '0 0 4px' }}>Bem-vinda de volta ☀️</p>
              <h1 style={{ color: '#fff', fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, margin: 0 }}>
                Olá, {nome}!
              </h1>
              <p style={{ color: 'rgba(253,230,138,0.75)', fontSize: '0.85rem', marginTop: 6 }}>
                {ativos.length === 0 ? 'Você não tem sessões ativas no momento' : `Você tem ${ativos.length} sessão${ativos.length > 1 ? 'ões' : ''} agendada${ativos.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => setModalAberto(true)}
              style={{ background: '#fbbf24', color: '#78350f', fontWeight: 700, fontSize: '0.9rem', padding: '0.65rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ➕ Nova Sessão
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: 700, margin: '-1.5rem auto 0', padding: '0 1rem 2rem', position: 'relative', zIndex: 2 }}>
        {loading && <div style={{ textAlign: 'center', padding: '3rem' }}><LoadingSpinner /></div>}

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem 1.25rem', color: '#b91c1c', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Proximas sessoes */}
            <section style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#78350f', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                ☀️ Próximas Sessões
              </h2>

              {ativos.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(120,53,15,0.08)', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🌞</div>
                  <p style={{ color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Nenhuma sessão agendada</p>
                  <p style={{ color: '#b45309', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Agende sua próxima sessão de bronzeamento!</p>
                  <button
                    onClick={() => setModalAberto(true)}
                    style={{ background: 'linear-gradient(135deg, #b45309, #78350f)', color: '#fff', fontWeight: 700, padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    ➕ Agendar agora
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {ativos.map(a => (
                    <CardAgendamento key={a.id} agendamento={a} onCancelar={handleCancelar} formatarData={formatarData} />
                  ))}
                </div>
              )}
            </section>

            {/* Historico */}
            {historico.length > 0 && (
              <section>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#78350f', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📋 Histórico
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {historico.map(a => (
                    <CardAgendamento key={a.id} agendamento={a} formatarData={formatarData} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {confirmacaoHora && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
            <h2 style={{ color: '#15803d', fontWeight: 700, marginBottom: '0.5rem' }}>Sessão Agendada!</h2>
            <p style={{ color: '#374151', marginBottom: '0.5rem' }}>Seu horário foi confirmado com sucesso.</p>
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '0.75rem 1rem', margin: '1rem 0', color: '#92400e', fontSize: '0.9rem' }}>
              ⚠️ <strong>Prazo de cancelamento:</strong><br />
              até 1 hora antes do horário agendado.<br />
              <strong>{(() => {
                const d = new Date(confirmacaoHora);
                const limite = new Date(d.getTime() - 60 * 60 * 1000);
                return `Cancele até ${limite.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} de ${limite.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
              })()}</strong>
            </div>
            <button
              onClick={() => setConfirmacaoHora(null)}
              style={{ background: 'linear-gradient(135deg, #b45309, #78350f)', color: '#fff', fontWeight: 700, padding: '0.65rem 2rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              OK, entendido!
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={modalAberto} title="Nova Sessão de Bronzeamento" onClose={() => setModalAberto(false)}>
        <AgendamentoForm
          clienteFixo={usuario?.clienteId}
          onSuccess={async (dataHora) => { setModalAberto(false); await fetchMeus(); if (dataHora) setConfirmacaoHora(dataHora); }}
        />
      </Modal>
    </div>
  );
}

function CardAgendamento({
  agendamento, onCancelar, formatarData,
}: {
  agendamento: Agendamento;
  onCancelar?: (id: number) => void;
  formatarData: (d: string) => string;
}) {
  const ativo = agendamento.status === 'AGENDADO';
  const dentroDoLimite = agendamento.dataHora
    ? new Date() >= new Date(new Date(agendamento.dataHora).getTime() - 60 * 60 * 1000)
    : false;
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '1.1rem 1.25rem', boxShadow: '0 2px 12px rgba(120,53,15,0.08)', border: `1px solid ${ativo ? '#fde68a' : '#f3f4f6'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: '#78350f', fontSize: '0.95rem', marginBottom: 4 }}>
          ☀️ {agendamento.procedimento?.nome ?? 'Sessão de Bronzeamento'}
        </div>
        <div style={{ color: '#92400e', fontSize: '0.82rem', marginBottom: 3 }}>
          📅 {formatarData(agendamento.dataHora)}
        </div>
        {agendamento.procedimento?.preco != null && (
          <div style={{ color: '#b45309', fontSize: '0.82rem', fontWeight: 600 }}>
            💰 R$ {agendamento.procedimento.preco.toFixed(2)}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, ...STATUS_STYLE[agendamento.status] }}>
          {STATUS_LABEL[agendamento.status]}
        </span>
        {ativo && onCancelar && (
          dentroDoLimite ? (
            <span style={{ fontSize: '0.7rem', color: '#e53e3e', fontWeight: 600, padding: '3px 8px', background: '#fee2e2', borderRadius: 6 }}>⏰ Prazo expirado</span>
          ) : (
            <button
              onClick={() => onCancelar(agendamento.id)}
              style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          )
        )}
      </div>
    </div>
  );
}
