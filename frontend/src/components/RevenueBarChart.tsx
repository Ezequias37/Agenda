interface RevenueBarChartProps {
  dados: Record<string, number>;
}

/** Gráfico de barras simples (sem dependências externas) para faturamento diário. */
export function RevenueBarChart({ dados }: RevenueBarChartProps) {
  const dias = Object.keys(dados).sort();

  if (dias.length === 0) {
    return <p style={{ color: 'var(--ink-faint)', fontSize: '0.9rem' }}>Sem faturamento registrado no período.</p>;
  }

  const maximo = Math.max(...dias.map(d => dados[d]), 1);

  return (
    <div>
      <div className="bars">
        {dias.map((dia, idx) => {
          const valor = dados[dia];
          const alturaPercentual = Math.max((valor / maximo) * 100, 4);
          const hoje = idx === dias.length - 1;
          return (
            <div key={dia} className="bar-col">
              <div className="bar-tooltip">R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className={`bar${hoje ? ' today' : ''}`} style={{ height: `${alturaPercentual}%` }} />
            </div>
          );
        })}
      </div>
      <div className="bar-labels">
        {dias.map(dia => {
          const [, , diaNum] = dia.split('-');
          return <div key={dia} className="bar-label">{diaNum}</div>;
        })}
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: 'linear-gradient(180deg, var(--purple-700), var(--teal-600))' }} />
          Faturamento diário
        </div>
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: 'linear-gradient(180deg, var(--purple-900), #05473F)' }} />
          Hoje
        </div>
      </div>
    </div>
  );
}

