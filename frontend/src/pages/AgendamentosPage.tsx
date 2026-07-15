import { useState } from 'react';
import { useClientes } from '../hooks/useClientes';
import { useAgendamentos } from '../hooks/useAgendamentos';
import { AgendamentoForm } from '../components/AgendamentoForm';
import { AgendamentoList } from '../components/AgendamentoList';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PagamentoPixInfo } from '../components/PagamentoPixInfo';
import type { Agendamento } from '../types';

export function AgendamentosPage() {
  const { clientes, loading: clientesLoading } = useClientes();
  const { agendamentos, loading: agendamentosLoading, error: agendamentosError, createAgendamento, deleteAgendamento, concluirAgendamento } = useAgendamentos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState<Agendamento | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO'>('TODOS');
  const [filtroData, setFiltroData] = useState('');

  if (clientesLoading) return <LoadingSpinner />;

  const agendamentosFiltrados = agendamentos.filter(a => {
    if (filtroStatus !== 'TODOS' && a.status !== filtroStatus) return false;
    if (filtroData && !a.dataHora.startsWith(filtroData)) return false;
    return true;
  });

  const handleSuccess = (agendamento?: Agendamento) => {
    setIsModalOpen(false);
    if (agendamento) setAgendamentoConfirmado(agendamento);
  };

  return (
    <main>
      <div className="container">
        {agendamentoConfirmado && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
              <h2 style={{ color: '#15803d', fontWeight: 700, marginBottom: '0.5rem' }}>Sessão Agendada!</h2>
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '0.75rem 1rem', margin: '1rem 0', color: '#92400e', fontSize: '0.9rem' }}>
                ⚠️ <strong>Prazo de cancelamento:</strong><br />
                até 1 hora antes do horário.<br />
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
                OK
              </button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">📅 Agendamentos de Sessões</h1>
            <p className="page-subtitle">Marque e gerencie os agendamentos</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={clientes.length === 0}
            className="btn btn-primary"
            style={{ flexShrink: 0, opacity: clientes.length === 0 ? 0.5 : 1, cursor: clientes.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            ➕ Nova Sessão
          </button>
        </div>

        {clientes.length === 0 && (
          <div style={{
            background: '#FFF3CD',
            border: '2px solid var(--warning)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            color: '#856404'
          }}>
            <strong>⚠️ Aviso:</strong> Você precisa cadastrar pelo menos um cliente antes de criar agendamentos.
          </div>
        )}

        <div className="form-section" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', padding: '1rem 1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label htmlFor="filtroStatus">Status</label>
            <select id="filtroStatus" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as typeof filtroStatus)}>
              <option value="TODOS">Todos</option>
              <option value="AGENDADO">Agendado</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label htmlFor="filtroData">Data</label>
            <input id="filtroData" type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} />
          </div>
          {(filtroStatus !== 'TODOS' || filtroData) && (
            <button
              onClick={() => { setFiltroStatus('TODOS'); setFiltroData(''); }}
              className="btn btn-secondary"
              style={{ marginBottom: '1.25rem' }}
            >
              ✖️ Limpar filtros
            </button>
          )}
        </div>

        <AgendamentoList
          agendamentos={agendamentosFiltrados}
          loading={agendamentosLoading}
          error={agendamentosError}
          onCancel={deleteAgendamento}
          onConcluir={concluirAgendamento}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Agendar Nova Sessão"
        >
          <AgendamentoForm
            clientes={clientes}
            onSubmit={createAgendamento}
            onSuccess={handleSuccess}
          />
        </Modal>
      </div>
    </main>
  );
}
