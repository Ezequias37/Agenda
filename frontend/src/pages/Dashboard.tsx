import { useEffect, useState } from 'react';
import { useClientes } from '../hooks/useClientes';
import { useAgendamentos } from '../hooks/useAgendamentos';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';
import { pagamentoService } from '../services/pagamentoService';
import { RevenueBarChart } from '../components/RevenueBarChart';
import type { ResumoPagamentos } from '../types';

export function Dashboard() {
  const { clientes, loading: clientesLoading } = useClientes();
  const { agendamentos, loading: agendamentosLoading } = useAgendamentos();
  const { nomeExibicao } = useTheme();
  const [resumo, setResumo] = useState<ResumoPagamentos | null>(null);
  const [resumoLoading, setResumoLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setResumo(await pagamentoService.obterResumo()); }
      catch { /* financeiro é um extra: se falhar, o dashboard segue normalmente */ }
      finally { setResumoLoading(false); }
    })();
  }, []);

  if (clientesLoading || agendamentosLoading) return <LoadingSpinner />;

  const agendamentosAtivos = agendamentos.filter(a => a.status === 'AGENDADO');

  return (
    <main>
      <div className="container">
        <h1 className="page-title">👋 Bem-vindo ao {nomeExibicao}!</h1>
        <p className="page-subtitle">Gerencie seus clientes e agendamentos de forma fácil e eficiente</p>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-title"><span className="card-icon">👥</span> Total de Clientes</div>
            <div className="card-number" style={{ color: 'var(--primary)' }}>{clientes.length}</div>
            <div className="card-description">Clientes cadastrados no sistema</div>
          </div>

          <div className="card">
            <div className="card-title"><span className="card-icon">📅</span> Agendamentos Ativos</div>
            <div className="card-number" style={{ color: 'var(--success)' }}>{agendamentosAtivos.length}</div>
            <div className="card-description">Sessões agendadas</div>
          </div>

          <div className="card">
            <div className="card-title"><span className="card-icon">✅</span> Sessões Concluídas</div>
            <div className="card-number" style={{ color: 'var(--accent)' }}>
              {agendamentos.filter(a => a.status === 'CONCLUIDO').length}
            </div>
            <div className="card-description">Atendimentos realizados</div>
          </div>

          <div className="card">
            <div className="card-title"><span className="card-icon">💰</span> Faturamento Hoje</div>
            <div className="card-number" style={{ color: 'var(--ca-secondary)' }}>
              R$ {(resumo?.faturamentoHoje ?? 0).toFixed(2)}
            </div>
            <div className="card-description">Pagamentos confirmados hoje</div>
          </div>

          <div className="card">
            <div className="card-title"><span className="card-icon">💵</span> Faturamento no Mês</div>
            <div className="card-number" style={{ color: 'var(--ca-secondary)' }}>
              R$ {(resumo?.faturamentoMes ?? 0).toFixed(2)}
            </div>
            <div className="card-description">Total pago no mês atual</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-title" style={{ marginBottom: '0.5rem' }}>📈 Faturamento Diário (últimos 14 dias)</div>
          {resumoLoading ? (
            <LoadingSpinner />
          ) : (
            <RevenueBarChart dados={resumo?.faturamentoPorDia ?? {}} />
          )}
        </div>

        <div className="form-section">
          <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1rem', fontSize: '1.2rem' }}>💳 Pagamentos Recebidos</h2>
          {resumoLoading ? (
            <LoadingSpinner />
          ) : !resumo || resumo.pagamentos.length === 0 ? (
            <p style={{ color: '#999' }}>Nenhum pagamento confirmado ainda.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.5rem' }}>Cliente</th>
                    <th style={{ padding: '0.5rem' }}>Procedimento</th>
                    <th style={{ padding: '0.5rem' }}>Data</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo.pagamentos.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem' }}>{p.clienteNome ?? '—'}</td>
                      <td style={{ padding: '0.5rem' }}>{p.procedimentoNome ?? '—'}</td>
                      <td style={{ padding: '0.5rem' }}>{new Date(p.dataHora).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--ca-secondary)' }}>
                        R$ {(p.valor ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="info-box">
          <h3>📋 Como usar o sistema?</h3>
          <ul>
            <li><strong>👥 Clientes:</strong> Cadastre seus clientes com nome, email e telefone</li>
            <li><strong>📅 Agendamentos:</strong> Marque as sessões, defina data/hora e tipo de serviço</li>
            <li><strong>📧 Notificações:</strong> Clientes recebem confirmação automática por email</li>
            <li><strong>📱 Mobile:</strong> Acesse de qualquer dispositivo — interface responsiva</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
