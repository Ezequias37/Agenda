import { useState } from 'react';
import { useClientes } from '../hooks/useClientes';
import { useAgendamentos } from '../hooks/useAgendamentos';
import { AgendamentoForm } from '../components/AgendamentoForm';
import { AgendamentoList } from '../components/AgendamentoList';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function AgendamentosPage() {
  const { clientes, loading: clientesLoading } = useClientes();
  const { agendamentos, loading: agendamentosLoading, createAgendamento, deleteAgendamento } = useAgendamentos();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (clientesLoading) return <LoadingSpinner />;

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <main>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">☀️ Agendamentos de Sessões</h1>
            <p className="page-subtitle">Marque e gerencie as sessões de bronzeamento</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={clientes.length === 0}
            className="btn btn-primary"
            style={{ height: 'fit-content', opacity: clientes.length === 0 ? 0.5 : 1, cursor: clientes.length === 0 ? 'not-allowed' : 'pointer' }}
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

        <AgendamentoList
          agendamentos={agendamentos}
          loading={agendamentosLoading}
          error={null}
          onCancel={deleteAgendamento}
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
