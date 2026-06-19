import { createBrowserRouter } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ClientsPage } from './pages/ClientsPage';
import { AgendamentosPage } from './pages/AgendamentosPage';
import { InformacoesPage } from './pages/InformacoesPage';
import { App } from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/clientes',
        element: <ClientsPage />,
      },
      {
        path: '/agendamentos',
        element: <AgendamentosPage />,
      },
      {
        path: '/informacoes',
        element: <InformacoesPage />,
      },
    ],
  },
]);

