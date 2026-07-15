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

  const oQueLevarLinhas = oQueLevar.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <main>
      <div className="container">
        <div className="page-head" style={{ marginBottom: '1.5rem' }}>
          <div className="dash-eyebrow">Empresa</div>
          <h1 className="page-title">Configurações da empresa</h1>
          <p className="page-subtitle">Personalize a identidade visual que seus clientes veem na vitrine e nos agendamentos.</p>
        </div>

        {erro && <div className="error-box"><strong>Erro</strong>{erro}</div>}
        {sucesso && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            ✅ Configurações salvas com sucesso!
          </div>
        )}

        <div className="settings-grid">
          {/* FORM COLUMN */}
          <form onSubmit={handleSubmit} className="settings-form">

            {/* IDENTIDADE VISUAL */}
            <div className="panel">
              <div className="panel-head-icon">
                <div className="panel-icon-box">🎨</div>
                <div>
                  <div className="panel-title">Identidade visual</div>
                  <div className="panel-desc">Logo e nome que aparecem para os clientes</div>
                </div>
              </div>

              <div className="field">
                <label>Logo da empresa</label>
                <div className="logo-uploader">
                  <div className="logo-preview-box">
                    <img src={previewLogo || logoExibicao} alt="Logo" />
                  </div>
                  <div>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleLogoChange} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: 6, marginBottom: 0 }}>PNG ou JPG, recomendado 400×400px</p>
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Nome fantasia</label>
                <input
                  type="text"
                  value={nomeFantasia}
                  onChange={e => setNomeFantasia(e.target.value)}
                  placeholder="Nome da sua clínica"
                  required
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Cor primária</label>
                  <div className="color-field">
                    <div className="color-swatch-wrap">
                      <input type="color" value={corPrimaria} onChange={e => setCorPrimaria(e.target.value)} />
                    </div>
                    <div>
                      <div className="color-hex">{corPrimaria.toUpperCase()}</div>
                      <div className="color-name">Botões e destaques</div>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label>Cor secundária</label>
                  <div className="color-field">
                    <div className="color-swatch-wrap">
                      <input type="color" value={corSecundaria} onChange={e => setCorSecundaria(e.target.value)} />
                    </div>
                    <div>
                      <div className="color-hex">{corSecundaria.toUpperCase()}</div>
                      <div className="color-name">Ícones e indicadores</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTATO */}
            <div className="panel">
              <div className="panel-head-icon">
                <div className="panel-icon-box">📍</div>
                <div>
                  <div className="panel-title">Contato e localização</div>
                  <div className="panel-desc">Como os clientes encontram e falam com você</div>
                </div>
              </div>

              <div className="field">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  placeholder="(31) 99999-9999"
                />
              </div>

              <div className="field">
                <label>Endereço</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={e => setEndereco(e.target.value)}
                  placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                />
              </div>
            </div>

            {/* INFORMAÇÕES PARA O CLIENTE */}
            <div className="panel">
              <div className="panel-head-icon">
                <div className="panel-icon-box">📋</div>
                <div>
                  <div className="panel-title">Informações para o cliente</div>
                  <div className="panel-desc">Aparecem no lembrete de agendamento e na vitrine</div>
                </div>
              </div>

              <div className="field">
                <label>O que levar <span style={{ fontWeight: 500, color: 'var(--ink-faint)', fontSize: '0.8rem' }}>um item por linha</span></label>
                <textarea
                  value={oQueLevar}
                  onChange={e => setOQueLevar(e.target.value)}
                  rows={4}
                  placeholder={'2 toalhas\n1 protetor solar\nGarrafinha de água'}
                />
              </div>

              <div className="field">
                <label>Recomendações</label>
                <textarea
                  value={recomendacoes}
                  onChange={e => setRecomendacoes(e.target.value)}
                  rows={4}
                  placeholder={'Ir bem alimentado(a)\nEvitar banhos quentes no dia do procedimento'}
                />
              </div>
            </div>

            <div className="actions-bar" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? '⏳ Salvando...' : '💾 Salvar alterações'}
              </button>
            </div>
          </form>

          {/* PREVIEW COLUMN */}
          <div className="preview-col">
            <div className="preview-label-row">
              <span className="dot" />
              <span className="preview-label">Pré-visualização em tempo real</span>
            </div>

            <div className="preview-card">
              <div className="preview-hero" style={{ background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})` }}>
                <div className="preview-hero-top">
                  <div className="preview-logo">
                    <img src={previewLogo || logoExibicao} alt="Logo" />
                  </div>
                  <div>
                    <div className="preview-clinic-name">{nomeFantasia || 'Nome da sua clínica'}</div>
                    <div className="preview-clinic-phone">📞 {telefone || '(00) 00000-0000'}</div>
                  </div>
                </div>
                <div className="preview-book-btn">📅 Agendar horário</div>
              </div>

              <div className="preview-body">
                <div>
                  <div className="preview-block-title">Endereço</div>
                  <div className="preview-address">📍 {endereco || 'Endereço não informado'}</div>
                </div>

                <div>
                  <div className="preview-block-title">O que levar</div>
                  {oQueLevarLinhas.length === 0 ? (
                    <p className="preview-empty">Nenhum item adicionado ainda.</p>
                  ) : (
                    <ul className="preview-checklist">
                      {oQueLevarLinhas.map((item, idx) => (
                        <li key={idx}><span className="tag">✓</span><span>{item}</span></li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="preview-block-title">Recomendações</div>
                  <div className="preview-note">{recomendacoes || 'Nenhuma recomendação adicionada ainda.'}</div>
                </div>
              </div>
            </div>

            <div className="preview-swatches">
              <div className="swatch-chip" style={{ background: corPrimaria }}>
                <div className="swatch-label">Primária</div>
                <div className="swatch-hex">{corPrimaria.toUpperCase()}</div>
              </div>
              <div className="swatch-chip" style={{ background: corSecundaria }}>
                <div className="swatch-label">Secundária</div>
                <div className="swatch-hex">{corSecundaria.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gestão de Procedimentos */}
        <div className="panel" style={{ marginTop: '1.5rem' }}>
          <div className="panel-head-icon">
            <div className="panel-icon-box">🩺</div>
            <div>
              <div className="panel-title">Procedimentos</div>
              <div className="panel-desc">Cadastre e gerencie os procedimentos oferecidos</div>
            </div>
          </div>

          {erroProcedimentos && <div className="error-box"><strong>Erro</strong>{erroProcedimentos}</div>}

          <form onSubmit={handleSubmitProcedimento} style={{ marginBottom: '1.5rem', background: 'var(--purple-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="field" style={{ flex: 2, minWidth: 200 }}>
                <label>Nome</label>
                <input
                  type="text"
                  value={formProcedimento.nome}
                  onChange={e => setFormProcedimento(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Nome do procedimento"
                  required
                />
              </div>
              <div className="field" style={{ flex: 1, minWidth: 120 }}>
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
              <div className="field" style={{ flex: 1, minWidth: 120 }}>
                <label>Duração</label>
                <input
                  type="text"
                  value={formProcedimento.duracao}
                  onChange={e => setFormProcedimento(f => ({ ...f, duracao: e.target.value }))}
                  placeholder="ex: 1h30min"
                  required
                />
              </div>
              <div className="field" style={{ flex: 1, minWidth: 160 }}>
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
            <div className="field">
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
            <p style={{ color: 'var(--ink-faint)' }}>Nenhum procedimento cadastrado ainda.</p>
          ) : (
            <div className="item-list">
              {procedimentos.map(proc => (
                <div key={proc.id} className="item-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <strong>{proc.nome}</strong>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>{proc.descricao}</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
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
