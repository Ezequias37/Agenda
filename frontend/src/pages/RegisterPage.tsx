import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface Erros {
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
  confirmarSenha?: string;
}

function mascaraTelefone(v: string): string {
  const n = v.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 2) return n.length ? `(${n}` : '';
  if (n.length <= 6) return `(${n.slice(0,2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
}

function forca(senha: string): { nivel: number; texto: string; cor: string } {
  let pts = 0;
  if (senha.length >= 6) pts++;
  if (senha.length >= 10) pts++;
  if (/[A-Z]/.test(senha)) pts++;
  if (/[0-9]/.test(senha)) pts++;
  if (/[^A-Za-z0-9]/.test(senha)) pts++;
  if (pts <= 1) return { nivel: pts, texto: 'Fraca', cor: '#e53e3e' };
  if (pts <= 3) return { nivel: pts, texto: 'Media', cor: '#d97706' };
  return { nivel: pts, texto: 'Forte', cor: '#16a34a' };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const { nomeExibicao, logoExibicao } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmarSenha: '' });
  const [erro, setErro] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleCapsLock = useCallback((e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState('CapsLock'));
  }, []);

  const validar = (name: string, value: string): string | undefined => {
    if (name === 'nome') {
      if (!value.trim()) return 'Nome e obrigatorio';
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) return 'Nome deve conter apenas letras';
      if (value.trim().split(' ').length < 2) return 'Informe nome e sobrenome';
    }
    if (name === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email invalido';
    }
    if (name === 'telefone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10) return 'Telefone incompleto';
    }
    if (name === 'senha') {
      if (value.length < 6) return 'Minimo 6 caracteres';
    }
    if (name === 'confirmarSenha') {
      if (value !== form.senha) return 'As senhas nao coincidem';
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'nome') {
      value = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
      value = value.replace(/\b\w/g, c => c.toUpperCase());
    }
    if (name === 'email') value = value.toLowerCase();
    if (name === 'telefone') value = mascaraTelefone(value);
    setForm(prev => ({ ...prev, [name]: value }));
    const err = validar(name, value);
    setErros(prev => ({ ...prev, [name]: err }));
    if (name === 'senha') {
      const confirmErr = form.confirmarSenha ? (form.confirmarSenha !== value ? 'As senhas nao coincidem' : undefined) : undefined;
      setErros(prev => ({ ...prev, senha: err, confirmarSenha: confirmErr }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const novosErros: Erros = {};
    (Object.keys(form) as (keyof typeof form)[]).forEach(k => {
      const err = validar(k, form[k]);
      if (err) novosErros[k] = err;
    });
    if (Object.keys(novosErros).length > 0) { setErros(novosErros); setErro('Corrija os campos em vermelho'); return; }
    setLoading(true);
    try {
      await register(form.nome, form.email, form.telefone, form.senha);
      navigate('/meus-agendamentos');
    } catch (err: any) {
      const msg = err?.response?.data?.erro;
      setErro(msg || 'Erro ao criar conta. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const senhaForca = forca(form.senha);

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-stage">
        <div className="auth-logo-block">
          <div className="auth-logo-mark">
            <img src={logoExibicao} alt={nomeExibicao} />
          </div>
          <div className="auth-wordmark">{nomeExibicao}</div>
        </div>

        <div className="auth-card">
          <div className="auth-head">
            <div className="auth-title">Criar conta</div>
            <div className="auth-sub">Cadastre-se para agendar sua sessão</div>
          </div>

          {erro && (
            <div style={{ background: 'var(--red-50)', borderLeft: '4px solid var(--red-600)', padding: '0.75rem', borderRadius: 6, color: '#b91c1c', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="nome">Nome completo</label>
              <div className="auth-input-wrap">
                <span className="leading-icon">👤</span>
                <input type="text" id="nome" name="nome" value={form.nome} onChange={handleChange} required autoComplete="name" placeholder="Seu nome completo" />
              </div>
              {erros.nome && <span style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: 2, display: 'block' }}>⚠️ {erros.nome}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrap">
                <span className="leading-icon">📧</span>
                <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="seu@email.com" />
              </div>
              {erros.email && <span style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: 2, display: 'block' }}>⚠️ {erros.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="telefone">Telefone</label>
              <div className="auth-input-wrap">
                <span className="leading-icon">📱</span>
                <input type="tel" id="telefone" name="telefone" value={form.telefone} onChange={handleChange} required autoComplete="tel" placeholder="(31) 99999-9999" maxLength={16} />
              </div>
              {erros.telefone && <span style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: 2, display: 'block' }}>⚠️ {erros.telefone}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="senha">Senha</label>
              <div className="auth-input-wrap">
                <span className="leading-icon">🔒</span>
                <input
                  type={mostrarSenha ? 'text' : 'password'} id="senha" name="senha" value={form.senha}
                  onChange={handleChange} onKeyDown={handleCapsLock} onKeyUp={handleCapsLock}
                  required autoComplete="new-password" placeholder="Mínimo 6 caracteres"
                />
                <button type="button" className="auth-toggle-visibility" onClick={() => setMostrarSenha(p => !p)} aria-label="Mostrar senha">
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
              {form.senha && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 2 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= senhaForca.nivel ? senhaForca.cor : 'var(--line)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: senhaForca.cor }}>Força: {senhaForca.texto}</span>
                </div>
              )}
              {capsLock && <span style={{ fontSize: '0.75rem', color: '#d97706', marginTop: 2, display: 'block' }}>⚠️ Caps Lock ativado</span>}
              {erros.senha && <span style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: 2, display: 'block' }}>⚠️ {erros.senha}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmarSenha">Confirmar senha</label>
              <div className="auth-input-wrap">
                <span className="leading-icon">🔒</span>
                <input
                  type={mostrarConfirmar ? 'text' : 'password'} id="confirmarSenha" name="confirmarSenha" value={form.confirmarSenha}
                  onChange={handleChange} onKeyDown={handleCapsLock} onKeyUp={handleCapsLock}
                  required autoComplete="new-password" placeholder="Repita a senha"
                />
                <button type="button" className="auth-toggle-visibility" onClick={() => setMostrarConfirmar(p => !p)} aria-label="Mostrar confirmação de senha">
                  {mostrarConfirmar ? '🙈' : '👁️'}
                </button>
              </div>
              {form.confirmarSenha && !erros.confirmarSenha && (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 2, display: 'block' }}>✅ Senhas coincidem</span>
              )}
              {erros.confirmarSenha && <span style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: 2, display: 'block' }}>⚠️ {erros.confirmarSenha}</span>}
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? '⏳ Criando conta...' : '✅ Criar conta'}
            </button>
          </form>

          <div className="auth-signup-row">
            Já tem conta? <Link to="/login">Entrar</Link>
          </div>
        </div>

        <p className="auth-footer-link">© 2026 CLICKAGENDA — Tecnologia CLICKAGENDA</p>
      </div>
    </div>
  );
}
