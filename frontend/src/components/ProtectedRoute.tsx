import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  role?: 'ADMIN' | 'CLIENTE';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (role && usuario.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
