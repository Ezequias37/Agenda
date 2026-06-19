import { useClientes } from '../hooks/useClientes';
import { useAgendamentos } from '../hooks/useAgendamentos';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Dashboard() {
  const { clientes, loading: clientesLoading } = useClientes();
  const { agendamentos, loading: agendamentosLoading } = useAgendamentos();

  if (clientesLoading || agendamentosLoading) return <LoadingSpinner />;

  const agendamentosAtivos = agendamentos.filter(a => a.status === 'AGENDADO');

  return (
    <main>
      <div className="container">
        <h1 className="page-title">☀️ Bem-vindo ao LM Bronzeamento!</h1>
        <p className="page-subtitle">Gerencie seus clientes e agendamentos de forma fácil e eficiente</p>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-title">👥 Total de Clientes</div>
            <div className="card-number" style={{ color: 'var(--primary)' }}>{clientes.length}</div>
            <div className="card-description">Clientes cadastrados no sistema</div>
          </div>

          <div className="card">
            <div className="card-title">☀️ Agendamentos Ativos</div>
            <div className="card-number" style={{ color: 'var(--success)' }}>{agendamentosAtivos.length}</div>
            <div className="card-description">Sessões de bronzeamento agendadas</div>
          </div>

          <div className="card">
            <div className="card-title">📅 Sessões Concluídas</div>
            <div className="card-number" style={{ color: 'var(--accent)' }}>
              {agendamentos.filter(a => a.status === 'CONCLUIDO').length}
            </div>
            <div className="card-description">Bronzeamentos realizados</div>
          </div>
        </div>

        <div className="info-box">
          <h3>📋 Como usar o sistema?</h3>
          <ul>
            <li>
              <strong>👥 Clientes:</strong> Cadastre seus clientes com nome, email e telefone para receber confirmações automáticas por email
            </li>
            <li>
              <strong>☀️ Agendamentos:</strong> Marque as sessões de bronzeamento, defina data/hora e tipo de serviço
            </li>
            <li>
              <strong>📧 Notificações:</strong> Clientes recebem confirmação de agendamento e aviso de cancelamento automaticamente
            </li>
            <li>
              <strong>📱 Mobile:</strong> Acesse de qualquer dispositivo - interface responsiva e intuitiva
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
