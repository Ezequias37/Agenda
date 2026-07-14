import { useState } from 'react';
import type { Cliente, CreateClienteDTO } from '../types';
import { ErrorMessage } from './ErrorMessage';
import { resolveUploadUrl } from '../utils/url';

interface ClientFormProps {
  clienteInicial?: Cliente | null;
  onSubmit: (data: CreateClienteDTO) => Promise<void>;
  onSuccess?: () => void;
  onUploadFoto?: (foto: File) => Promise<void>;
}

export function ClientForm({ clienteInicial, onSubmit, onSuccess, onUploadFoto }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: clienteInicial?.nome ?? '',
    email: clienteInicial?.email ?? '',
    telefone: clienteInicial?.telefone ?? '',
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0] ?? null;
    setFoto(arquivo);
    if (arquivo) setPreviewFoto(URL.createObjectURL(arquivo));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
      if (foto && onUploadFoto) {
        setEnviandoFoto(true);
        await onUploadFoto(foto);
        setEnviandoFoto(false);
      }
      if (!clienteInicial) setFormData({ nome: '', email: '', telefone: '' });
      setFoto(null);
      setPreviewFoto(null);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const fotoAtual = previewFoto || resolveUploadUrl(clienteInicial?.fotoUrl);

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      {onUploadFoto && (
        <div className="form-group">
          <label>📷 Foto do cliente</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {fotoAtual ? (
              <img src={fotoAtual} alt="Prévia" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ca-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.3rem' }}>
                {formData.nome?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFotoChange} />
          </div>
        </div>
      )}

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
        {loading ? (enviandoFoto ? '⏳ Enviando foto...' : '⏳ Salvando...') : clienteInicial ? '💾 Salvar alterações' : '✅ Criar Cliente'}
      </button>
    </form>
  );
}
