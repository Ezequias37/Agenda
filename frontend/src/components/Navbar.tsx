import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuAberto(false);
    navigate('/login');
  };

  const fecharMenu = () => setMenuAberto(false);

  const linksPublicos = (
    <>
      <li>
        <Link to="/informacoes" onClick={fecharMenu} className="block py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">Informações</Link>
      </li>
      <li>
        <Link to="/login" onClick={fecharMenu} className="block py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">Entrar</Link>
      </li>
      <li>
        <Link to="/cadastro" onClick={fecharMenu} className="block py-2 px-3 bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition font-semibold text-center">
          Cadastrar
        </Link>
      </li>
    </>
  );

  const linksCliente = (
    <>
      <li className="px-3 py-2">
        <span className="text-amber-300 text-sm font-medium">Olá, {usuario?.nome.split(' ')[0]} 👋</span>
      </li>
      <li>
        <Link to="/meus-agendamentos" onClick={fecharMenu} className="block py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">☀️ Meus Agendamentos</Link>
      </li>
      <li>
        <Link to="/informacoes" onClick={fecharMenu} className="block py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">📋 Informações</Link>
      </li>
      <li>
        <button onClick={handleLogout} className="block w-full text-left py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">
          🚪 Sair
        </button>
      </li>
    </>
  );

  const linksAdmin = (
    <>
      <li>
        <Link to="/admin" onClick={fecharMenu} className="block py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">📊 Dashboard</Link>
      </li>
      <li>
        <Link to="/admin/clientes" onClick={fecharMenu} className="block py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">👥 Clientes</Link>
      </li>
      <li>
        <Link to="/admin/agendamentos" onClick={fecharMenu} className="block py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">📅 Agendamentos</Link>
      </li>
      <li>
        <Link to="/informacoes" onClick={fecharMenu} className="block py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">📋 Informações</Link>
      </li>
      <li>
        <button onClick={handleLogout} className="block w-full text-left py-2 px-3 text-amber-200 hover:text-white transition rounded hover:bg-white/10">
          🚪 Sair
        </button>
      </li>
    </>
  );

  const links = !usuario ? linksPublicos : usuario.role === 'ADMIN' ? linksAdmin : linksCliente;

  return (
    <nav style={{ background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)' }} className="shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={fecharMenu}>
          <img
            src="/logo-lm.png"
            alt="LM Bronzeamentos"
            style={{ width: 36, height: 36, minWidth: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fbbf24' }}
          />
          <span style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
            LM Bronzeamentos
          </span>
        </Link>

        {/* Menu desktop */}
        <ul className="hidden md:flex items-center gap-1 text-sm">
          {links}
        </ul>

        {/* Botão hambúrguer (mobile) */}
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition"
          aria-label="Abrir menu"
        >
          {menuAberto ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu mobile dropdown */}
      {menuAberto && (
        <div className="md:hidden border-t border-amber-800/50" style={{ background: 'rgba(120, 53, 15, 0.97)' }}>
          <ul className="px-4 py-3 space-y-1 text-sm">
            {links}
          </ul>
        </div>
      )}
    </nav>
  );
}
