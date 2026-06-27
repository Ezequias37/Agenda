import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
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
    } catch {
      setErro('Email ou senha invalidos');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError?: string): React.CSSProperties => ({
    width: '100%', border: `2px solid ${hasError ? '#e53e3e' : '#e8c99a'}`, borderRadius: 10,
    padding: '0.75rem 2.5rem 0.75rem 0.75rem', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s',
  });

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem 1rem', background:'linear-gradient(160deg, #3d1c02 0%, #7c3f0a 35%, #b86a1a 65%, #d4935a 100%)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'60vw', height:'60vw', maxWidth:500, borderRadius:'50%', background:'rgba(255,180,60,0.08)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:'50vw', height:'50vw', maxWidth:400, borderRadius:'50%', background:'rgba(255,140,20,0.07)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
            <div style={{ width:100, height:100, borderRadius:'50%', border:'3px solid rgba(255,200,80,0.8)', overflow:'hidden', boxShadow:'0 0 30px rgba(212,165,116,0.5), 0 4px 20px rgba(0,0,0,0.4)', background:'#5c2d0a', flexShrink:0 }}>
              <img src="/logo-lm.png" alt="LM Bronzeamentos" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          </div>
          <h1 style={{ fontFamily:'Playfair Display, Georgia, serif', fontSize:'1.9rem', fontWeight:700, color:'#fff', textShadow:'0 2px 12px rgba(0,0,0,0.5)', margin:0 }}>LM Bronzeamentos</h1>
          <p style={{ color:'rgba(255,210,120,0.9)', fontSize:'0.9rem', marginTop:6 }}>Seu brilho comeca aqui ☀️</p>
        </div>

        <div style={{ background:'#fff', borderRadius:20, padding:'1.75rem 1.5rem', boxShadow:'0 20px 60px rgba(0,0,0,0.35)' }}>
          <h2 style={{ color:'#7c3f0a', fontWeight:700, fontSize:'1.1rem', textAlign:'center', marginBottom:'1.25rem', marginTop:0 }}>Entre na sua conta</h2>

          {avisoSessao && (
            <div style={{ background:'#fffbeb', borderLeft:'4px solid #f59e0b', padding:'0.75rem', borderRadius:6, color:'#92400e', fontSize:'0.875rem', marginBottom:'1rem' }}>
              ⚠️ Sua sessão expirou. Por favor, faça login novamente.
            </div>
          )}

          {erro && <div style={{ background:'#fff5f5', borderLeft:'4px solid #e53e3e', padding:'0.75rem', borderRadius:6, color:'#c53030', fontSize:'0.875rem', marginBottom:'1rem' }}>{erro}</div>}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'#7c3f0a', marginBottom:4 }}>Login</label>
              <input
                type="text" value={email} onChange={handleEmail} required
                style={inputStyle(erros.email)}
                placeholder="seu@email.com ou admin" autoComplete="username"
              />
              {erros.email && <span style={{ fontSize:'0.78rem', color:'#e53e3e', marginTop:3, display:'block' }}>⚠️ {erros.email}</span>}
            </div>

            {/* Senha */}
            <div>
              <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'#7c3f0a', marginBottom:4 }}>Senha</label>
              <div style={{ position:'relative' }}>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha} onChange={e => setSenha(e.target.value)}
                  onKeyDown={handleCapsLock} onKeyUp={handleCapsLock}
                  required style={inputStyle()} placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" onClick={() => setMostrarSenha(p => !p)}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9a6030', fontSize:'1.1rem', padding:4 }}>
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
              {capsLock && <span style={{ fontSize:'0.78rem', color:'#d97706', marginTop:3, display:'block' }}>⚠️ Caps Lock ativado</span>}
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', background:loading?'#c4956a':'linear-gradient(135deg, #b86a1a 0%, #7c3f0a 100%)', color:'#fff', fontWeight:700, fontSize:'1rem', padding:'0.85rem', borderRadius:10, border:'none', cursor:loading?'not-allowed':'pointer', boxShadow:'0 4px 15px rgba(120,63,10,0.3)', fontFamily:'inherit' }}>
              {loading ? '⏳ Entrando...' : '☀️ Entrar'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'1rem 0' }}>
            <div style={{ flex:1, height:1, background:'#e8c99a' }} />
            <span style={{ fontSize:'0.8rem', color:'#9a6030', whiteSpace:'nowrap' }}>ou continue com</span>
            <div style={{ flex:1, height:1, background:'#e8c99a' }} />
          </div>

          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', width:'100%', padding:'0.75rem', borderRadius:10, border:'2px solid #e8c99a', background:'#fff', color:'#3c3c3c', fontWeight:600, fontSize:'0.95rem', textDecoration:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', cursor:'pointer', fontFamily:'inherit', boxSizing:'border-box' as const }}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Entrar com Google
          </a>

          <p style={{ textAlign:'center', fontSize:'0.875rem', color:'#9a6030', marginTop:'1rem', marginBottom:0 }}>
            Nao tem conta?{' '}
            <Link to="/cadastro" style={{ fontWeight:700, color:'#7c3f0a', textDecoration:'underline' }}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
