import { useState } from 'react';
import { useClientes } from '../hooks/useClientes';
import { ClientForm } from '../components/ClientForm';
import { ClientList } from '../components/ClientList';
import { Modal } from '../components/Modal';
import type { Cliente } from '../types';

export function ClientsPage() {
  const { clientes, loading, error, createCliente, updateCliente, deleteCliente, uploadFotoCliente } = useClientes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | null>(null);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setClienteEmEdicao(null);
  };

  const handleEditar = (cliente: Cliente) => {
    setClienteEmEdicao(cliente);
    setIsModalOpen(true);
  };

  const handleExcluir = async (cliente: Cliente) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await deleteCliente(cliente.id);
    } catch {
      alert('Erro ao excluir cliente.');
    }
  };

  return (
    <main>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">👥 Gerenciar Clientes</h1>
            <p className="page-subtitle">Adicione e gerencie os dados dos seus clientes</p>
          </div>
          <button
            onClick={() => { setClienteEmEdicao(null); setIsModalOpen(true); }}
            className="btn btn-primary"
            style={{ flexShrink: 0 }}
          >
            ➕ Novo Cliente
          </button>
        </div>

        <ClientList clientes={clientes} loading={loading} error={error} onEdit={handleEditar} onDelete={handleExcluir} />

        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setClienteEmEdicao(null); }}
          title={clienteEmEdicao ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
        >
          <ClientForm
            clienteInicial={clienteEmEdicao}
            onSubmit={data => clienteEmEdicao ? updateCliente(clienteEmEdicao.id, data) : createCliente(data)}
            onUploadFoto={clienteEmEdicao ? (foto => uploadFotoCliente(clienteEmEdicao.id, foto)) : undefined}
            onSuccess={handleSuccess}
          />
        </Modal>
      </div>
    </main>
  );
}
