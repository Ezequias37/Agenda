interface RevenueBarChartProps {
  dados: Record<string, number>;
}

/** Gráfico de barras simples (sem dependências externas) para faturamento diário. */
export function RevenueBarChart({ dados }: RevenueBarChartProps) {
  const dias = Object.keys(dados).sort();

  if (dias.length === 0) {
    return <p style={{ color: '#999', fontSize: '0.9rem' }}>Sem faturamento registrado no período.</p>;
  }

  const maximo = Math.max(...dias.map(d => dados[d]), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, padding: '0.5rem 0', overflowX: 'auto' }}>
      {dias.map(dia => {
        const valor = dados[dia];
        const alturaPercentual = Math.max((valor / maximo) * 100, valor > 0 ? 4 : 0);
        const [, mes, diaNum] = dia.split('-');
        return (
          <div key={dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', width: 32 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--ca-primary)', marginBottom: 2, fontWeight: 600 }}>
              {valor > 0 ? `R$${valor.toFixed(0)}` : ''}
            </div>
            <div
              title={`${dia}: R$ ${valor.toFixed(2)}`}
              style={{
                width: '100%', height: `${alturaPercentual}%`, minHeight: valor > 0 ? 4 : 2,
                background: valor > 0
                  ? 'linear-gradient(180deg, var(--ca-secondary-light), var(--ca-secondary))'
                  : '#e5e7eb',
                borderRadius: '4px 4px 0 0',
              }}
            />
            <div style={{ fontSize: '0.65rem', color: '#999', marginTop: 4 }}>{diaNum}/{mes}</div>
          </div>
        );
      })}
    </div>
  );
}
