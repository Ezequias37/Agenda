import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { agendamentoService } from '../../services/agendamentoService';
import { evolucaoService } from '../../services/evolucaoService';
import type { Agendamento, EvolucaoCliente } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import { AgendamentoForm } from '../../components/AgendamentoForm';
import { EvolucaoForm } from '../../components/EvolucaoForm';
import { EvolucaoTimeline } from '../../components/EvolucaoTimeline';
import { CasoSucessoForm } from '../../components/CasoSucessoForm';
import { WhatsAppStatusIcon } from '../../components/WhatsAppStatusIcon';
import { PagamentoPixInfo } from '../../components/PagamentoPixInfo';

const STATUS_LABEL: Record<string, string> = {
  AGENDADO: 'Agendado',
  CANCELADO: 'Cancelado',
  CONCLUIDO: 'Concluido',
};

const STATUS_CLASSE: Record<string, string> = {
  AGENDADO: 'status-agendado',
  CANCELADO: 'status-cancelado',
  CONCLUIDO: 'status-concluido',
};

export default function MeusAgendamentosPage() {
  const { usuario } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState<Agendamento | null>(null);
  const [evolucoes, setEvolucoes] = useState<EvolucaoCliente[]>([]);
  const [evolucoesLoading, setEvolucoesLoading] = useState(true);
  const [agendamentoEvolucaoId, setAgendamentoEvolucaoId] = useState<number | null>(null);
  const [escolhaEvolucaoAberta, setEscolhaEvolucaoAberta] = useState(false);
  const [agendamentoCasoId, setAgendamentoCasoId] = useState<number | null>(null);
  const [casoEnviado, setCasoEnviado] = useState(false);

  const fetchMeus = async () => {
    try { setLoading(true); setError(null); setAgendamentos(await agendamentoService.getMeusAgendamentos()); }
    catch { setError('Erro ao carregar seus agendamentos'); }
    finally { setLoading(false); }
  };

  const fetchEvolucoes = async () => {
    if (!usuario?.clienteId) { setEvolucoesLoading(false); return; }
    try { setEvolucoesLoading(true); setEvolucoes(await evolucaoService.listarPorCliente(usuario.clienteId)); }
    catch { /* silencioso: a timeline é um extra, não bloqueia a página */ }
    finally { setEvolucoesLoading(false); }
  };

  useEffect(() => { fetchMeus(); fetchEvolucoes(); }, []);

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F3E9FB 0%, #F8F6FB 100%)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--ca-primary) 0%, var(--ca-primary-light) 100%)', padding: '2rem 1.5rem 3.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: '0 0 4px' }}>Bem-vinda de volta 👋</p>
              <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, margin: 0 }}>
                Olá, {nome}!
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: 6 }}>
                {ativos.length === 0 ? 'Você não tem sessões ativas no momento' : `Você tem ${ativos.length} sessão${ativos.length > 1 ? 'ões' : ''} agendada${ativos.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => setModalAberto(true)}
              style={{ background: 'var(--ca-secondary)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '0.65rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
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
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ca-primary)', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                📅 Próximas Sessões
              </h2>

              {ativos.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(74,20,140,0.08)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗓️</div>
                  <p style={{ color: 'var(--ca-primary)', fontWeight: 600, marginBottom: 4 }}>Nenhuma sessão agendada</p>
                  <p style={{ color: 'var(--ca-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Agende sua próxima sessão!</p>
                  <button
                    onClick={() => setModalAberto(true)}
                    style={{ background: 'linear-gradient(135deg, var(--ca-secondary), var(--ca-primary))', color: '#fff', fontWeight: 700, padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
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
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ca-primary)', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📋 Histórico
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {historico.map(a => (
                    <CardAgendamento
                      key={a.id}
                      agendamento={a}
                      formatarData={formatarData}
                      onAdicionarEvolucao={setAgendamentoEvolucaoId}
                      onPostarResultado={setAgendamentoCasoId}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Evolução */}
            <section style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ca-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📸 Minha Evolução
                </h2>
                <button
                  onClick={() => {
                    const concluidos = agendamentos.filter(a => a.status === 'CONCLUIDO');
                    if (concluidos.length === 0) {
                      alert('Você ainda não tem nenhuma sessão concluída. Assim que concluir uma sessão, você poderá adicionar fotos aqui.');
                      return;
                    }
                    setEscolhaEvolucaoAberta(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  ➕ Adicionar Foto
                </button>
              </div>
              <EvolucaoTimeline evolucoes={evolucoes} loading={evolucoesLoading} />
            </section>
          </>
        )}
      </div>

      {agendamentoConfirmado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
            <h2 style={{ color: '#15803d', fontWeight: 700, marginBottom: '0.5rem' }}>Sessão Agendada!</h2>
            <p style={{ color: '#374151', marginBottom: '0.5rem' }}>Seu horário foi confirmado com sucesso.</p>
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '0.75rem 1rem', margin: '1rem 0', color: '#92400e', fontSize: '0.9rem' }}>
              ⚠️ <strong>Prazo de cancelamento:</strong><br />
              até 1 hora antes do horário agendado.<br />
              <strong>{(() => {
                const d = new Date(agendamentoConfirmado.dataHora);
                const limite = new Date(d.getTime() - 60 * 60 * 1000);
                return `Cancele até ${limite.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} de ${limite.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
              })()}</strong>
            </div>
            <PagamentoPixInfo agendamento={agendamentoConfirmado} />
            {agendamentoConfirmado.formaPagamento === 'CARTAO_LOCAL' && (
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '0.75rem 1rem', margin: '1rem 0', color: '#3730a3', fontSize: '0.9rem' }}>
                💳 Pagamento combinado: <strong>cartão de crédito no local</strong>.
              </div>
            )}
            <button
              onClick={() => setAgendamentoConfirmado(null)}
              style={{ background: 'linear-gradient(135deg, var(--ca-secondary), var(--ca-primary))', color: '#fff', fontWeight: 700, padding: '0.65rem 2rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              OK, entendido!
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={modalAberto} title="Nova Sessão" onClose={() => setModalAberto(false)}>
        <AgendamentoForm
          clienteFixo={usuario?.clienteId}
          onSuccess={async (agendamento) => { setModalAberto(false); await fetchMeus(); if (agendamento) setAgendamentoConfirmado(agendamento); }}
        />
      </Modal>

      <Modal
        isOpen={agendamentoEvolucaoId !== null}
        title="📸 Adicionar Evolução"
        onClose={() => setAgendamentoEvolucaoId(null)}
      >
        {agendamentoEvolucaoId !== null && (
          <EvolucaoForm
            agendamentoId={agendamentoEvolucaoId}
            onSuccess={async () => { setAgendamentoEvolucaoId(null); await fetchEvolucoes(); }}
          />
        )}
      </Modal>

      <Modal
        isOpen={escolhaEvolucaoAberta}
        title="📸 Escolha a sessão"
        onClose={() => setEscolhaEvolucaoAberta(false)}
      >
        <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Selecione a sessão concluída à qual esta foto pertence:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {agendamentos.filter(a => a.status === 'CONCLUIDO').map(a => (
            <button
              key={a.id}
              onClick={() => { setEscolhaEvolucaoAberta(false); setAgendamentoEvolucaoId(a.id); }}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              📅 {a.procedimento?.nome ?? 'Sessão'} — {formatarData(a.dataHora)}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={agendamentoCasoId !== null}
        title="🌟 Postar meu Resultado"
        onClose={() => setAgendamentoCasoId(null)}
      >
        {agendamentoCasoId !== null && (
          <CasoSucessoForm
            agendamentoId={agendamentoCasoId}
            onSuccess={() => { setAgendamentoCasoId(null); setCasoEnviado(true); setTimeout(() => setCasoEnviado(false), 4000); }}
          />
        )}
      </Modal>

      {casoEnviado && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--ca-primary)', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 1200, fontSize: '0.9rem' }}>
          ✅ Resultado enviado! Aguarde a aprovação da clínica.
        </div>
      )}
    </div>
  );
}

function CardAgendamento({
  agendamento, onCancelar, formatarData, onAdicionarEvolucao, onPostarResultado,
}: {
  agendamento: Agendamento;
  onCancelar?: (id: number) => void;
  formatarData: (d: string) => string;
  onAdicionarEvolucao?: (id: number) => void;
  onPostarResultado?: (id: number) => void;
}) {
  const ativo = agendamento.status === 'AGENDADO';
  const dentroDoLimite = agendamento.dataHora
    ? new Date() >= new Date(new Date(agendamento.dataHora).getTime() - 60 * 60 * 1000)
    : false;
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '1.1rem 1.25rem', boxShadow: '0 2px 12px rgba(74,20,140,0.08)', border: `1px solid ${ativo ? 'var(--border)' : '#f3f4f6'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: 'var(--ca-primary)', fontSize: '0.95rem', marginBottom: 4 }}>
          📅 {agendamento.procedimento?.nome ?? 'Sessão'}
        </div>
        <div style={{ color: 'var(--ca-primary-light)', fontSize: '0.82rem', marginBottom: 3 }}>
          📅 {formatarData(agendamento.dataHora)}
        </div>
        {agendamento.procedimento?.preco != null && (
          <div style={{ color: 'var(--ca-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
            💰 R$ {agendamento.procedimento.preco.toFixed(2)}
          </div>
        )}
        <div style={{ marginTop: 4 }}>
          <WhatsAppStatusIcon agendamento={agendamento} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <span className={`status-badge ${STATUS_CLASSE[agendamento.status] ?? ''}`}>
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
        {agendamento.status === 'CONCLUIDO' && onAdicionarEvolucao && (
          <button
            onClick={() => onAdicionarEvolucao(agendamento.id)}
            style={{ fontSize: '0.75rem', color: 'var(--ca-primary)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            📸 Adicionar Evolução
          </button>
        )}
        {agendamento.status === 'CONCLUIDO' && onPostarResultado && (
          <button
            onClick={() => onPostarResultado(agendamento.id)}
            style={{ fontSize: '0.75rem', color: 'var(--ca-secondary)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            🌟 Postar meu Resultado
          </button>
        )}
      </div>
    </div>
  );
}
