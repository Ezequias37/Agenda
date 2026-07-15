import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { nomeExibicao, logoExibicao } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [erros, setErros] = useState<{ email?: string }>({});
  const [avisoSessao, setAvisoSessao] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('sessaoExpirada')) {
      setAvisoSessao(true);
      localStorage.removeItem('sessaoExpirada');
    }
  }, []);

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toLowerCase();
    setEmail(v);
    if (v.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      setErros(p => ({ ...p, email: 'Email invalido' }));
    else setErros(p => ({ ...p, email: undefined }));
  };

  const handleCapsLock = useCallback((e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState('CapsLock'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setErro('Digite seu login'); return; }
    setErro('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err: any) {
      const mensagem = err?.response?.data?.erro;
      setErro(mensagem || 'Email ou senha invalidos');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="auth-tagline">Agende com poucos cliques ✨</div>
        </div>

        <div className="auth-card">
          <div className="auth-head">
            <div className="auth-title">Acesse sua conta</div>
            <div className="auth-sub">Entre para gerenciar sua clínica</div>
          </div>

          {avisoSessao && (
            <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '0.75rem', borderRadius: 6, color: '#92400e', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ Sua sessão expirou. Por favor, faça login novamente.
            </div>
          )}

          {erro && (
            <div style={{ background: 'var(--red-50)', borderLeft: '4px solid var(--red-600)', padding: '0.75rem', borderRadius: 6, color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Login</label>
              <div className="auth-input-wrap">
                <span className="leading-icon">📧</span>
                <input
                  id="email" type="text" value={email} onChange={handleEmail} required
                  placeholder="seu@email.com ou admin" autoComplete="username"
                />
              </div>
              {erros.email && <span style={{ fontSize: '0.78rem', color: 'var(--red-600)', marginTop: 3, display: 'block' }}>⚠️ {erros.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="senha">Senha</label>
              <div className="auth-input-wrap">
                <span className="leading-icon">🔒</span>
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha} onChange={e => setSenha(e.target.value)}
                  onKeyDown={handleCapsLock} onKeyUp={handleCapsLock}
                  required placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" className="auth-toggle-visibility" onClick={() => setMostrarSenha(p => !p)} aria-label="Mostrar senha">
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
              {capsLock && <span style={{ fontSize: '0.78rem', color: '#d97706', marginTop: 3, display: 'block' }}>⚠️ Caps Lock ativado</span>}
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? '⏳ Entrando...' : (
                <>
                  Entrar
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-signup-row">
            Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
          </div>
        </div>

        <div className="auth-trust-strip">
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
          </svg>
          Seus dados protegidos com criptografia
        </div>

        <p className="auth-footer-link">© 2026 CLICKAGENDA — Tecnologia CLICKAGENDA</p>
      </div>
    </div>
  );
}
