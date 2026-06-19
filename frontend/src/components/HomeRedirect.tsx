import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomeRedirect() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/meus-agendamentos" replace />;
}
