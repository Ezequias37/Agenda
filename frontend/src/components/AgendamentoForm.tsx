import { useState } from 'react';
import type { CreateAgendamentoDTO, Cliente } from '../types';
import { ErrorMessage } from './ErrorMessage';

interface AgendamentoFormProps {
  clientes: Cliente[];
  onSubmit: (data: CreateAgendamentoDTO) => Promise<void>;
  onSuccess?: () => void;
}

export function AgendamentoForm({ clientes, onSubmit, onSuccess }: AgendamentoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    dataHora: '',
    descricao: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        cliente: { id: parseInt(formData.clienteId) },
        dataHora: formData.dataHora,
        descricao: formData.descricao,
        status: 'AGENDADO',
      });
      setFormData({ clienteId: '', dataHora: '', descricao: '' });
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

      <div className="form-group">
        <label htmlFor="descricao">📝 Descrição/Tipo de Bronzeamento</label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Ex: Bronzeamento tradicional 20 minutos"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? '⏳ Agendando...' : '☀️ Agendar Sessão'}
      </button>
    </form>
  );
}
