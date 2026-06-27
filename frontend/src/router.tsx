import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { Dashboard } from './pages/Dashboard';
import { ClientsPage } from './pages/ClientsPage';
import { AgendamentosPage } from './pages/AgendamentosPage';
import { InformacoesPage } from './pages/InformacoesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MeusAgendamentosPage from './pages/client/MeusAgendamentosPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/cadastro',
    element: <RegisterPage />,
  },
  {
    path: '/oauth2/callback',
    element: <OAuth2CallbackPage />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomeRedirect />,
      },
      // Rotas do cliente
      {
        path: '/meus-agendamentos',
        element: (
          <ProtectedRoute role="CLIENTE">
            <MeusAgendamentosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/agendar',
        element: (
          <ProtectedRoute role="CLIENTE">
            <AgendamentosPage />
          </ProtectedRoute>
        ),
      },
      // Informações — pública (com navbar)
      {
        path: '/informacoes',
        element: <InformacoesPage />,
      },
      // Rotas do admin
      {
        path: '/admin',
        element: (
          <ProtectedRoute role="ADMIN">
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/clientes',
        element: (
          <ProtectedRoute role="ADMIN">
            <ClientsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/agendamentos',
        element: (
          <ProtectedRoute role="ADMIN">
            <AgendamentosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
