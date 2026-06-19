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

  const validarEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

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

          <p style={{ textAlign:'center', fontSize:'0.875rem', color:'#9a6030', marginTop:'1rem', marginBottom:0 }}>
            Nao tem conta?{' '}
            <Link to="/cadastro" style={{ fontWeight:700, color:'#7c3f0a', textDecoration:'underline' }}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
