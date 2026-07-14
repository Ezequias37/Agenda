import { useState } from 'react';
import { evolucaoService } from '../services/evolucaoService';
import { ErrorMessage } from './ErrorMessage';

interface EvolucaoFormProps {
  agendamentoId: number;
  onSuccess: () => void;
}

export function EvolucaoForm({ agendamentoId, onSuccess }: EvolucaoFormProps) {
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0] ?? null;
    setFoto(arquivo);
    setPreview(arquivo ? URL.createObjectURL(arquivo) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!foto) {
      setError('Selecione uma foto');
      return;
    }
    setLoading(true);
    try {
      await evolucaoService.adicionar(agendamentoId, descricao, foto);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.erro || 'Erro ao enviar sua evolução');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <div className="form-group">
        <label htmlFor="foto">📸 Foto</label>
        <input id="foto" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFotoChange} required />
        {preview && (
          <img
            src={preview}
            alt="Pré-visualização"
            style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 12, marginTop: '0.75rem' }}
          />
        )}
      </div>

      <div className="form-group">
        <label htmlFor="descricao">📝 Descrição (opcional)</label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          placeholder="Como você está se sentindo com o resultado?"
          rows={3}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? '⏳ Enviando...' : '✅ Salvar evolução'}
      </button>
    </form>
  );
}
