import { useState } from 'react';
import type { Cliente, Procedimento } from '../types';
import { PROCEDIMENTOS } from '../types';
import { ProcedimentoSelect } from './ProcedimentoSelect';
import { ErrorMessage } from './ErrorMessage';
import { agendamentoService } from '../services/agendamentoService';

interface AgendamentoFormProps {
  // Modo admin: passa lista de clientes
  clientes?: Cliente[];
  // Modo cliente: passa o ID fixo
  clienteFixo?: number;
  // Callbacks legados (modo admin com onSubmit externo)
  onSubmit?: (data: any) => Promise<void>;
  onSuccess?: () => void;
}

export function AgendamentoForm({ clientes, clienteFixo, onSubmit, onSuccess }: AgendamentoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcedimento, setSelectedProcedimento] = useState<Procedimento | null>(null);
  const [formData, setFormData] = useState({ clienteId: '', dataHora: '' });

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

    // Modo admin: clientes prop presente → clienteId obrigatório no form
    // Modo cliente: backend usa o JWT para inferir o cliente automaticamente
    const clienteId = (clienteFixo != null && clienteFixo > 0) ? clienteFixo : parseInt(formData.clienteId);
    if (clientes != null && (!clienteId || isNaN(clienteId))) {
      setError('Selecione um cliente');
      return;
    }

    setLoading(true);
    try {
      const data: Record<string, unknown> = {
        ...(clienteId && !isNaN(clienteId) ? { cliente: { id: clienteId } } : {}),
        dataHora: formData.dataHora,
        procedimento: { id: selectedProcedimento.id },
        status: 'AGENDADO',
      };

      if (onSubmit) {
        await onSubmit(data);
      } else {
        await agendamentoService.createAgendamento(data as any);
      }

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

      {!clienteFixo && clientes && (
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
      )}

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
