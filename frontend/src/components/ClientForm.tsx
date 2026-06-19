import { useState } from 'react';
import type { CreateClienteDTO } from '../types';
import { ErrorMessage } from './ErrorMessage';

interface ClientFormProps {
  onSubmit: (data: CreateClienteDTO) => Promise<void>;
  onSuccess?: () => void;
}

export function ClientForm({ onSubmit, onSuccess }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
      setFormData({ nome: '', email: '', telefone: '' });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <div className="form-group">
        <label htmlFor="nome">👤 Nome do Cliente</label>
        <input
          id="nome"
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          placeholder="Ex: João Silva"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">📧 Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="joao@exemplo.com"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="telefone">📱 Telefone</label>
        <input
          id="telefone"
          type="tel"
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          placeholder="(11) 99999-9999"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? '⏳ Criando...' : '✅ Criar Cliente'}
      </button>
    </form>
  );
}
