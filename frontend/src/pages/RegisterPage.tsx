import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

  const inp = (hasError?: string): React.CSSProperties => ({
    width:'100%', border:`2px solid ${hasError ? '#e53e3e' : '#e8c99a'}`, borderRadius:10,
    padding:'0.7rem 2.5rem 0.7rem 0.7rem', fontSize:'1rem', outline:'none',
    boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s',
  });

  const senhaForca = forca(form.senha);

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem 1rem', background:'linear-gradient(160deg, #3d1c02 0%, #7c3f0a 35%, #b86a1a 65%, #d4935a 100%)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'60vw', height:'60vw', maxWidth:500, borderRadius:'50%', background:'rgba(255,180,60,0.08)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:'50vw', height:'50vw', maxWidth:400, borderRadius:'50%', background:'rgba(255,140,20,0.07)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'0.75rem' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', border:'3px solid rgba(255,200,80,0.8)', overflow:'hidden', boxShadow:'0 0 25px rgba(212,165,116,0.5), 0 4px 15px rgba(0,0,0,0.4)', background:'#5c2d0a', flexShrink:0 }}>
              <img src="/logo-lm.png" alt="LM Bronzeamentos" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          </div>
          <h1 style={{ fontFamily:'Playfair Display, Georgia, serif', fontSize:'1.6rem', fontWeight:700, color:'#fff', textShadow:'0 2px 12px rgba(0,0,0,0.5)', margin:0 }}>LM Bronzeamentos</h1>
        </div>

        <div style={{ background:'#fff', borderRadius:20, padding:'1.5rem', boxShadow:'0 20px 60px rgba(0,0,0,0.35)' }}>
          <h2 style={{ color:'#7c3f0a', fontWeight:700, fontSize:'1.05rem', textAlign:'center', marginBottom:4, marginTop:0 }}>Criar conta</h2>
          <p style={{ color:'#9a6030', fontSize:'0.82rem', textAlign:'center', marginBottom:'1rem', marginTop:0 }}>Cadastre-se para agendar sua sessao</p>

          {erro && <div style={{ background:'#fff5f5', borderLeft:'4px solid #e53e3e', padding:'0.75rem', borderRadius:6, color:'#c53030', fontSize:'0.875rem', marginBottom:'0.75rem' }}>{erro}</div>}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
            {/* Nome */}
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#7c3f0a', marginBottom:3 }}>Nome completo</label>
              <input type="text" name="nome" value={form.nome} onChange={handleChange} required autoComplete="name" style={inp(erros.nome)} placeholder="Seu nome completo" />
              {erros.nome && <span style={{ fontSize:'0.75rem', color:'#e53e3e', marginTop:2, display:'block' }}>⚠️ {erros.nome}</span>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#7c3f0a', marginBottom:3 }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" style={inp(erros.email)} placeholder="seu@email.com" />
              {erros.email && <span style={{ fontSize:'0.75rem', color:'#e53e3e', marginTop:2, display:'block' }}>⚠️ {erros.email}</span>}
            </div>

            {/* Telefone */}
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#7c3f0a', marginBottom:3 }}>Telefone</label>
              <input type="tel" name="telefone" value={form.telefone} onChange={handleChange} required autoComplete="tel" style={inp(erros.telefone)} placeholder="(31) 99999-9999" maxLength={16} />
              {erros.telefone && <span style={{ fontSize:'0.75rem', color:'#e53e3e', marginTop:2, display:'block' }}>⚠️ {erros.telefone}</span>}
            </div>

            {/* Senha */}
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#7c3f0a', marginBottom:3 }}>Senha</label>
              <div style={{ position:'relative' }}>
                <input
                  type={mostrarSenha ? 'text' : 'password'} name="senha" value={form.senha}
                  onChange={handleChange} onKeyDown={handleCapsLock} onKeyUp={handleCapsLock}
                  required autoComplete="new-password" style={inp(erros.senha)} placeholder="Minimo 6 caracteres"
                />
                <button type="button" onClick={() => setMostrarSenha(p => !p)}
                  style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9a6030', fontSize:'1rem', padding:4 }}>
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
              {form.senha && (
                <div style={{ marginTop:4 }}>
                  <div style={{ display:'flex', gap:3, marginBottom:2 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= senhaForca.nivel ? senhaForca.cor : '#e8c99a', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:'0.72rem', color: senhaForca.cor }}>Forca: {senhaForca.texto}</span>
                </div>
              )}
              {capsLock && <span style={{ fontSize:'0.75rem', color:'#d97706', marginTop:2, display:'block' }}>⚠️ Caps Lock ativado</span>}
              {erros.senha && <span style={{ fontSize:'0.75rem', color:'#e53e3e', marginTop:2, display:'block' }}>⚠️ {erros.senha}</span>}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#7c3f0a', marginBottom:3 }}>Confirmar senha</label>
              <div style={{ position:'relative' }}>
                <input
                  type={mostrarConfirmar ? 'text' : 'password'} name="confirmarSenha" value={form.confirmarSenha}
                  onChange={handleChange} onKeyDown={handleCapsLock} onKeyUp={handleCapsLock}
                  required autoComplete="new-password" style={inp(erros.confirmarSenha)} placeholder="Repita a senha"
                />
                <button type="button" onClick={() => setMostrarConfirmar(p => !p)}
                  style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9a6030', fontSize:'1rem', padding:4 }}>
                  {mostrarConfirmar ? '🙈' : '👁️'}
                </button>
              </div>
              {form.confirmarSenha && !erros.confirmarSenha && (
                <span style={{ fontSize:'0.75rem', color:'#16a34a', marginTop:2, display:'block' }}>✅ Senhas coincidem</span>
              )}
              {erros.confirmarSenha && <span style={{ fontSize:'0.75rem', color:'#e53e3e', marginTop:2, display:'block' }}>⚠️ {erros.confirmarSenha}</span>}
              {capsLock && <span style={{ fontSize:'0.75rem', color:'#d97706', marginTop:2, display:'block' }}>⚠️ Caps Lock ativado</span>}
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', background:loading?'#c4956a':'linear-gradient(135deg, #b86a1a 0%, #7c3f0a 100%)', color:'#fff', fontWeight:700, fontSize:'1rem', padding:'0.85rem', borderRadius:10, border:'none', cursor:loading?'not-allowed':'pointer', boxShadow:'0 4px 15px rgba(120,63,10,0.3)', fontFamily:'inherit', marginTop:4 }}>
              {loading ? '⏳ Criando conta...' : '✅ Criar conta'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:'0.875rem', color:'#9a6030', marginTop:'1rem', marginBottom:0 }}>
            Ja tem conta?{' '}
            <Link to="/login" style={{ fontWeight:700, color:'#7c3f0a', textDecoration:'underline' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
