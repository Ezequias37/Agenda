import { useState } from 'react';
import type { CreateAgendamentoDTO, Cliente, Procedimento, PROCEDIMENTOS as ProcedimentosType } from '../types';
import { PROCEDIMENTOS } from '../types';
import { ProcedimentoSelect } from './ProcedimentoSelect';
import { ErrorMessage } from './ErrorMessage';

interface AgendamentoFormProps {
  clientes: Cliente[];
  onSubmit: (data: CreateAgendamentoDTO) => Promise<void>;
  onSuccess?: () => void;
}

export function AgendamentoForm({ clientes, onSubmit, onSuccess }: AgendamentoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcedimento, setSelectedProcedimento] = useState<Procedimento | null>(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    dataHora: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProcedimento) {
      setError('Selecione um procedimento');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        cliente: { id: parseInt(formData.clienteId) },
        dataHora: formData.dataHora,
        procedimento: selectedProcedimento,
        status: 'AGENDADO',
      });
      setFormData({ clienteId: '', dataHora: '' });
      setSelectedProcedimento(null);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <div className="form-group">
        <label htmlFor="clienteId">👤 Selecione o Cliente</label>
        <select
          id="clienteId"
          name="clienteId"
          value={formData.clienteId}
          onChange={handleChange}
          required
        >
          <option value="">-- Escolha um cliente --</option>
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="dataHora">📅 Data e Hora da Sessão</label>
        <input
          id="dataHora"
          type="datetime-local"
          name="dataHora"
          value={formData.dataHora}
          onChange={handleChange}
          required
        />
      </div>

      <ProcedimentoSelect
        procedimentos={PROCEDIMENTOS}
        selected={selectedProcedimento}
        onChange={setSelectedProcedimento}
      />

      {selectedProcedimento && (
        <div style={{
          background: 'rgba(212, 165, 116, 0.1)',
          border: '2px solid var(--primary)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
            💰 Total: R$ {selectedProcedimento.preco.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            ⏱️ Duração: {selectedProcedimento.duracao}
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading || !selectedProcedimento}>
        {loading ? '⏳ Agendando...' : '☀️ Confirmar Agendamento'}
      </button>
    </form>
  );
}

