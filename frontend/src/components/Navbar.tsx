import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function Navbar() {
  const { usuario, logout } = useAuth();
  const { nomeExibicao, logoExibicao } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [avatarMenuAberto, setAvatarMenuAberto] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuAberto(false);
    setAvatarMenuAberto(false);
    navigate('/login');
  };

  const fecharMenu = () => { setMenuAberto(false); setAvatarMenuAberto(false); };

  const linkClass = (path: string) => location.pathname === path ? 'active' : '';

  const iniciais = (usuario?.nome ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || '?';

  const linksPublicos = (
    <>
      <li><Link to="/informacoes" onClick={fecharMenu} className={linkClass('/informacoes')}>Informações</Link></li>
      <li><Link to="/vitrine" onClick={fecharMenu} className={linkClass('/vitrine')}><span className="vitrine-dot" />Vitrine</Link></li>
      <li><Link to="/login" onClick={fecharMenu} className={linkClass('/login')}>Entrar</Link></li>
      <li>
        <Link
          to="/cadastro"
          onClick={fecharMenu}
          className="text-white font-semibold text-center"
          style={{ background: 'var(--teal-600)', borderRadius: 10 }}
        >
          Cadastrar
        </Link>
      </li>
    </>
  );

  const linksCliente = (
    <>
      <li><Link to="/meus-agendamentos" onClick={fecharMenu} className={linkClass('/meus-agendamentos')}>📅 Meus Agendamentos</Link></li>
      <li><Link to="/vitrine" onClick={fecharMenu} className={linkClass('/vitrine')}><span className="vitrine-dot" />Vitrine</Link></li>
      <li><Link to="/informacoes" onClick={fecharMenu} className={linkClass('/informacoes')}>Informações</Link></li>
    </>
  );

  const linksAdmin = (
    <>
      <li><Link to="/admin" onClick={fecharMenu} className={linkClass('/admin')}>Dashboard</Link></li>
      <li><Link to="/admin/clientes" onClick={fecharMenu} className={linkClass('/admin/clientes')}>Clientes</Link></li>
      <li><Link to="/admin/agendamentos" onClick={fecharMenu} className={linkClass('/admin/agendamentos')}>Agendamentos</Link></li>
      <li><Link to="/admin/configuracao" onClick={fecharMenu} className={linkClass('/admin/configuracao')}>Configurações</Link></li>
      <li><Link to="/admin/casos" onClick={fecharMenu} className={linkClass('/admin/casos')}>Cases</Link></li>
      <li><Link to="/vitrine" onClick={fecharMenu} className={linkClass('/vitrine')}><span className="vitrine-dot" />Vitrine</Link></li>
      <li><Link to="/informacoes" onClick={fecharMenu} className={linkClass('/informacoes')}>Informações</Link></li>
    </>
  );

  const links = !usuario ? linksPublicos : usuario.role === 'ADMIN' ? linksAdmin : linksCliente;

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Logo */}
        <Link to="/" className="brand-block" onClick={fecharMenu}>
          <div className="brand-mark">
            {logoExibicao ? (
              <img src={logoExibicao} alt={nomeExibicao} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={19} height={19}>
                <path d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4L12 2z" />
              </svg>
            )}
          </div>
          <div className="brand-text">
            <div className="app-name">ClickAgenda</div>
            <div className="clinic-name">{nomeExibicao}</div>
          </div>
        </Link>

        {usuario && <div className="divider-v" />}

        {/* Menu desktop / mobile */}
        <nav className={`app-nav ${menuAberto ? 'open' : ''}`}>
          <ul style={{ display: 'flex', flexDirection: menuAberto ? 'column' : 'row', alignItems: menuAberto ? 'stretch' : 'center', gap: 2, listStyle: 'none', width: '100%' }}>
            {links}
          </ul>
        </nav>

        <div className="header-actions">
          {usuario && (
            <>
              <div className="avatar-circle" onClick={() => setAvatarMenuAberto(v => !v)}>
                {iniciais}
              </div>
              {avatarMenuAberto && (
                <div className="avatar-menu" onMouseLeave={() => setAvatarMenuAberto(false)}>
                  <div style={{ padding: '8px 12px', fontSize: 12.5, color: 'var(--ink-faint)', fontWeight: 600 }}>
                    Olá, {usuario.nome.split(' ')[0]}
                  </div>
                  <Link to="/alterar-senha" onClick={fecharMenu}>🔒 Alterar Senha</Link>
                  <button onClick={handleLogout} className="logout-item">🚪 Sair</button>
                </div>
              )}
            </>
          )}

          <button
            className="icon-btn menu-toggle-btn"
            onClick={() => setMenuAberto(v => !v)}
            aria-label="Abrir menu"
          >
            {menuAberto ? (
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            ) : (
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

