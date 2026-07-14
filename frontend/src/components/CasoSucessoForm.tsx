import { useState } from 'react';
import { casoSucessoService } from '../services/casoSucessoService';
import { ErrorMessage } from './ErrorMessage';

interface CasoSucessoFormProps {
  agendamentoId: number;
  onSuccess: () => void;
}

export function CasoSucessoForm({ agendamentoId, onSuccess }: CasoSucessoFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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
    if (!titulo.trim()) { setError('Dê um título para o seu resultado'); return; }
    if (!foto) { setError('Selecione uma foto'); return; }

    setLoading(true);
    try {
      await casoSucessoService.criar(agendamentoId, titulo, descricao, foto);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.erro || 'Erro ao enviar seu case de sucesso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
        Seu resultado será enviado para aprovação da clínica antes de aparecer na vitrine pública. 🌟
      </p>

      <div className="form-group">
        <label htmlFor="titulo">✨ Título</label>
        <input
          id="titulo"
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Ex: Adorei o resultado!"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="foto-caso">📸 Foto</label>
        <input id="foto-caso" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFotoChange} required />
        {preview && (
          <img
            src={preview}
            alt="Pré-visualização"
            style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 12, marginTop: '0.75rem' }}
          />
        )}
      </div>

      <div className="form-group">
        <label htmlFor="descricao-caso">💬 Seu depoimento</label>
        <textarea
          id="descricao-caso"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          placeholder="Conte como foi sua experiência..."
          rows={3}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? '⏳ Enviando...' : '🌟 Postar meu Resultado'}
      </button>
    </form>
  );
}
