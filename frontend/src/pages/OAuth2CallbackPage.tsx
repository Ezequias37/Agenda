import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const nome = searchParams.get('nome');
    const email = searchParams.get('email');
    const clienteId = Number(searchParams.get('clienteId') ?? '0');

    if (token && role && nome && email) {
      loginWithToken(token, role, nome, email, clienteId);
      navigate(role === 'ADMIN' ? '/admin' : '/meus-agendamentos', { replace: true });
    } else {
      navigate('/login?erro=google_falhou', { replace: true });
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #3d1c02 0%, #7c3f0a 35%, #b86a1a 65%, #d4935a 100%)' }}>
      <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>
        ⏳ Autenticando com Google...
      </div>
    </div>
  );
}
