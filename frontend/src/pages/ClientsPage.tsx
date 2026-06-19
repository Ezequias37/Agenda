import { useState } from 'react';
import { useClientes } from '../hooks/useClientes';
import { ClientForm } from '../components/ClientForm';
import { ClientList } from '../components/ClientList';
import { Modal } from '../components/Modal';

export function ClientsPage() {
  const { clientes, loading, error, createCliente } = useClientes();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <main>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">👥 Gerenciar Clientes</h1>
            <p className="page-subtitle">Adicione e gerencie os dados dos seus clientes</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ height: 'fit-content' }}
          >
            ➕ Novo Cliente
          </button>
        </div>

        <ClientList clientes={clientes} loading={loading} error={error} />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Cadastrar Novo Cliente"
        >
          <ClientForm onSubmit={createCliente} onSuccess={handleSuccess} />
        </Modal>
      </div>
    </main>
  );
}
