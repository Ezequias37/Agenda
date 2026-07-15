import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClientes } from '../hooks/useClientes';
import { useAgendamentos } from '../hooks/useAgendamentos';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';
import { pagamentoService } from '../services/pagamentoService';
import { RevenueBarChart } from '../components/RevenueBarChart';
import type { Agendamento, ResumoPagamentos } from '../types';

const STATUS_LABEL: Record<string, string> = { AGENDADO: 'Agendado', CANCELADO: 'Cancelado', CONCLUIDO: 'Concluído' };
const STATUS_CLASSE: Record<string, string> = { AGENDADO: 'status-agendado', CANCELADO: 'status-cancelado', CONCLUIDO: 'status-concluido' };
const AVATAR_GRADIENTES = [
  'linear-gradient(145deg,#7C3AED,#4A148C)',
  'linear-gradient(145deg,#12A594,#00897B)',
  'linear-gradient(145deg,#3B82F6,#2563EB)',
];

function iniciaisDe(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?';
}

function formatarDataRelativa(dataHora: string): string {
  const data = new Date(dataHora);
  const hoje = new Date();
  const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1);
  const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (mesmoDia(data, hoje)) return `Hoje, ${hora}`;
  if (mesmoDia(data, ontem)) return `Ontem, ${hora}`;
  return `${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hora}`;
}

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
  const concluidas = agendamentos.filter(a => a.status === 'CONCLUIDO');

  const recentes: Agendamento[] = [...agendamentos]
    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
    .slice(0, 5);

  const hojeTexto = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <main>
      <div className="container">
        <div className="dash-page-head">
          <div>
            <div className="dash-eyebrow">Visão geral</div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Olá, {nomeExibicao} 👋</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>Aqui está o resumo da sua clínica hoje.</p>
          </div>
          <div className="dash-date-chip">📅 {hojeTexto}</div>
        </div>

        <section className="metrics-grid">
          <div className="card">
            <div className="metric-top">
              <div className="card-icon">👥</div>
            </div>
            <div className="card-number">{clientes.length}</div>
            <div className="card-description">Total de clientes</div>
          </div>

          <div className="card">
            <div className="metric-top">
              <div className="card-icon blue">📅</div>
            </div>
            <div className="card-number">{agendamentosAtivos.length}</div>
            <div className="card-description">Agendamentos ativos</div>
          </div>

          <div className="card">
            <div className="metric-top">
              <div className="card-icon teal">✅</div>
            </div>
            <div className="card-number">{concluidas.length}</div>
            <div className="card-description">Sessões concluídas</div>
          </div>

          <div className="card">
            <div className="metric-top">
              <div className="card-icon gold">💰</div>
            </div>
            <div className="card-number">R$ {(resumo?.faturamentoHoje ?? 0).toFixed(2)}</div>
            <div className="card-description">Faturamento hoje</div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Faturamento — últimos 14 dias</div>
                <div className="panel-sub">Total no mês: R$ {(resumo?.faturamentoMes ?? 0).toFixed(2)}</div>
              </div>
            </div>
            {resumoLoading ? <LoadingSpinner /> : <RevenueBarChart dados={resumo?.faturamentoPorDia ?? {}} />}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Últimos agendamentos</div>
                <div className="panel-sub">Atualizado agora há pouco</div>
              </div>
              <Link to="/admin/agendamentos" className="panel-link">Ver todos →</Link>
            </div>

            {recentes.length === 0 ? (
              <p style={{ color: 'var(--ink-faint)', fontSize: '0.9rem' }}>Nenhum agendamento ainda.</p>
            ) : (
              <div className="appt-list">
                {recentes.map((a, idx) => {
                  const nome = a.cliente?.nome ?? '—';
                  return (
                    <div className="appt-row" key={a.id}>
                      <div className="appt-avatar" style={{ background: AVATAR_GRADIENTES[idx % AVATAR_GRADIENTES.length] }}>
                        {iniciaisDe(nome)}
                      </div>
                      <div className="appt-info">
                        <div className="appt-name">{nome}</div>
                        <div className="appt-proc">{a.procedimento?.nome ?? '—'}</div>
                      </div>
                      <div className="appt-meta">
                        <div className="appt-time">{formatarDataRelativa(a.dataHora)}</div>
                        <span className={`status-badge ${STATUS_CLASSE[a.status] ?? ''}`} style={{ marginTop: 5 }}>
                          {STATUS_LABEL[a.status] ?? a.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

