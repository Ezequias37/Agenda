import { useEffect, useState } from 'react';
import { obterConfigEmpresa, atualizarConfigEmpresa } from '../services/empresaService';
import { procedimentoService } from '../services/procedimentoService';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { EmpresaBranding, Procedimento } from '../types';

const PROCEDIMENTO_VAZIO = {
  nome: '',
  preco: '',
  duracao: '',
  descricao: '',
  categoria: 'bronzeamento' as 'bronzeamento' | 'complementar',
};

export default function ConfiguracaoPage() {
  const { setBranding, logoExibicao } = useTheme();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const [nomeFantasia, setNomeFantasia] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [oQueLevar, setOQueLevar] = useState('');
  const [recomendacoes, setRecomendacoes] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#4A148C');
  const [corSecundaria, setCorSecundaria] = useState('#00897B');
  const [logo, setLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [loadingProcedimentos, setLoadingProcedimentos] = useState(true);
  const [erroProcedimentos, setErroProcedimentos] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formProcedimento, setFormProcedimento] = useState(PROCEDIMENTO_VAZIO);
  const [salvandoProcedimento, setSalvandoProcedimento] = useState(false);

  const carregarProcedimentos = async () => {
    try {
      setLoadingProcedimentos(true);
      setProcedimentos(await procedimentoService.listar());
    } catch {
      setErroProcedimentos('Não foi possível carregar os procedimentos.');
    } finally {
      setLoadingProcedimentos(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await obterConfigEmpresa();
        setNomeFantasia(data.nomeFantasia ?? '');
        setTelefone(data.telefone ?? '');
        setEndereco(data.endereco ?? '');
        setOQueLevar(data.oQueLevar ?? '');
        setRecomendacoes(data.recomendacoes ?? '');
        setCorPrimaria(data.corPrimaria || '#4A148C');
        setCorSecundaria(data.corSecundaria || '#00897B');
      } catch {
        setErro('Não foi possível carregar as configurações da empresa.');
      } finally {
        setLoading(false);
      }
    })();
    carregarProcedimentos();
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
        endereco,
        oQueLevar,
        recomendacoes,
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

  const iniciarEdicaoProcedimento = (proc: Procedimento) => {
    setEditandoId(proc.id);
    setFormProcedimento({
      nome: proc.nome,
      preco: String(proc.preco),
      duracao: proc.duracao,
      descricao: proc.descricao,
      categoria: proc.categoria,
    });
  };

  const cancelarEdicaoProcedimento = () => {
    setEditandoId(null);
    setFormProcedimento(PROCEDIMENTO_VAZIO);
  };

  const handleSubmitProcedimento = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroProcedimentos('');
    setSalvandoProcedimento(true);
    try {
      const payload = {
        nome: formProcedimento.nome,
        preco: parseFloat(formProcedimento.preco) || 0,
        duracao: formProcedimento.duracao,
        descricao: formProcedimento.descricao,
        categoria: formProcedimento.categoria,
      };
      if (editandoId) {
        await procedimentoService.atualizar(editandoId, payload);
      } else {
        await procedimentoService.criar(payload);
      }
      cancelarEdicaoProcedimento();
      await carregarProcedimentos();
    } catch {
      setErroProcedimentos('Erro ao salvar o procedimento. Verifique os dados e tente novamente.');
    } finally {
      setSalvandoProcedimento(false);
    }
  };

  const handleRemoverProcedimento = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este procedimento?')) return;
    try {
      await procedimentoService.remover(id);
      await carregarProcedimentos();
    } catch {
      setErroProcedimentos('Erro ao remover o procedimento.');
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
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>🎨 Identidade Visual</h2>
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

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>📍 Contato e Localização</h2>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              placeholder="(31) 99999-9999"
            />
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input
              type="text"
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
              placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>📋 Informações do Serviço</h2>

          <div className="form-group">
            <label>O que levar (um item por linha)</label>
            <textarea
              value={oQueLevar}
              onChange={e => setOQueLevar(e.target.value)}
              rows={4}
              placeholder={'2 toalhas\n1 protetor solar\nGarrafinha de água'}
            />
          </div>

          <div className="form-group">
            <label>Recomendações (uma por linha)</label>
            <textarea
              value={recomendacoes}
              onChange={e => setRecomendacoes(e.target.value)}
              rows={4}
              placeholder={'Ir bem alimentado(a)\nEvitar banhos quentes no dia do procedimento'}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? '⏳ Salvando...' : '💾 Salvar configurações'}
          </button>
        </form>

        {/* Gestão de Procedimentos */}
        <div className="form-section">
          <h2 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>🩺 Procedimentos</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Cadastre e gerencie os procedimentos oferecidos.</p>

          {erroProcedimentos && <div className="error-box"><strong>Erro</strong>{erroProcedimentos}</div>}

          <form onSubmit={handleSubmitProcedimento} style={{ marginBottom: '1.5rem', background: 'var(--light)', padding: '1.25rem', borderRadius: 8 }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
                <label>Nome</label>
                <input
                  type="text"
                  value={formProcedimento.nome}
                  onChange={e => setFormProcedimento(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Nome do procedimento"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
                <label>Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formProcedimento.preco}
                  onChange={e => setFormProcedimento(f => ({ ...f, preco: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
                <label>Duração</label>
                <input
                  type="text"
                  value={formProcedimento.duracao}
                  onChange={e => setFormProcedimento(f => ({ ...f, duracao: e.target.value }))}
                  placeholder="ex: 1h30min"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
                <label>Categoria</label>
                <select
                  value={formProcedimento.categoria}
                  onChange={e => setFormProcedimento(f => ({ ...f, categoria: e.target.value as 'bronzeamento' | 'complementar' }))}
                >
                  <option value="bronzeamento">Principal</option>
                  <option value="complementar">Complementar</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <input
                type="text"
                value={formProcedimento.descricao}
                onChange={e => setFormProcedimento(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Breve descrição do procedimento"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={salvandoProcedimento}>
                {salvandoProcedimento ? '⏳ Salvando...' : editandoId ? '💾 Salvar edição' : '➕ Adicionar procedimento'}
              </button>
              {editandoId && (
                <button type="button" className="btn btn-secondary" onClick={cancelarEdicaoProcedimento}>Cancelar</button>
              )}
            </div>
          </form>

          {loadingProcedimentos ? (
            <LoadingSpinner />
          ) : procedimentos.length === 0 ? (
            <p style={{ color: '#999' }}>Nenhum procedimento cadastrado ainda.</p>
          ) : (
            <div className="item-list">
              {procedimentos.map(proc => (
                <div key={proc.id} className="item-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <strong>{proc.nome}</strong>
                    <p style={{ margin: '0.2rem 0 0', color: '#666', fontSize: '0.9rem' }}>{proc.descricao}</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#999' }}>
                      R$ {proc.preco.toFixed(2)} · ⏱️ {proc.duracao} · {proc.categoria === 'bronzeamento' ? 'Principal' : 'Complementar'}
                    </p>
                  </div>
                  <div className="item-card-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => iniciarEdicaoProcedimento(proc)}>✏️ Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoverProcedimento(proc.id)}>🗑️ Remover</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
