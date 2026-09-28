type Metric = { label: string; value: string; detail?: string };

export function MetricStrip({ metrics }: { metrics: Metric[] }) {
  return <div className="metric-strip" role="list" aria-label="Métricas do Codex">{metrics.map((metric) => <div className="metric-strip__item" role="listitem" key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span>{metric.detail ? <small>{metric.detail}</small> : null}</div>)}</div>;
}