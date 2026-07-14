import { useEffect, useState } from 'react';
import { obterConfigEmpresa, atualizarConfigEmpresa } from '../services/empresaService';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { EmpresaBranding } from '../types';

export default function ConfiguracaoPage() {
  const { setBranding, logoExibicao } = useTheme();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const [nomeFantasia, setNomeFantasia] = useState('');
  const [telefone, setTelefone] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#4A148C');
  const [corSecundaria, setCorSecundaria] = useState('#00897B');
  const [logo, setLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await obterConfigEmpresa();
        setNomeFantasia(data.nomeFantasia ?? '');
        setTelefone(data.telefone ?? '');
        setCorPrimaria(data.corPrimaria || '#4A148C');
        setCorSecundaria(data.corSecundaria || '#00897B');
      } catch {
        setErro('Não foi possível carregar as configurações da empresa.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0] ?? null;
    setLogo(arquivo);
    if (arquivo) setPreviewLogo(URL.createObjectURL(arquivo));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setSalvando(true);
    try {
      const atualizada = await atualizarConfigEmpresa({
        nomeFantasia,
        telefone,
        corPrimaria,
        corSecundaria,
        logo,
      });
      setLogo(null);
      setPreviewLogo(null);
      const branding: EmpresaBranding = {
        id: atualizada.id,
        nomeFantasia: atualizada.nomeFantasia,
        logoUrl: atualizada.logoUrl,
        corPrimaria: atualizada.corPrimaria,
        corSecundaria: atualizada.corSecundaria,
      };
      setBranding(branding);
      setSucesso(true);
    } catch {
      setErro('Erro ao salvar as configurações. Verifique os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <main>
      <div className="container">
        <h1 className="page-title">⚙️ Configurações da Empresa</h1>
        <p className="page-subtitle">Personalize a marca da sua clínica: nome, cores e logo</p>

        {erro && <div className="error-box"><strong>Erro</strong>{erro}</div>}
        {sucesso && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            ✅ Configurações salvas com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label>Logo da empresa</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <img
                src={previewLogo || logoExibicao}
                alt="Logo"
                style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'contain', background: 'var(--light)', border: '2px solid var(--border)' }}
              />
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleLogoChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Nome fantasia</label>
            <input
              type="text"
              value={nomeFantasia}
              onChange={e => setNomeFantasia(e.target.value)}
              placeholder="Nome da sua clínica"
              required
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              placeholder="(31) 99999-9999"
            />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
              <label>Cor primária</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="color" value={corPrimaria} onChange={e => setCorPrimaria(e.target.value)} style={{ width: 48, height: 44, padding: 2, minHeight: 44 }} />
                <input type="text" value={corPrimaria} onChange={e => setCorPrimaria(e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>

            <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
              <label>Cor secundária</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="color" value={corSecundaria} onChange={e => setCorSecundaria(e.target.value)} style={{ width: 48, height: 44, padding: 2, minHeight: 44 }} />
                <input type="text" value={corSecundaria} onChange={e => setCorSecundaria(e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? '⏳ Salvando...' : '💾 Salvar configurações'}
          </button>
        </form>
      </div>
    </main>
  );
}
