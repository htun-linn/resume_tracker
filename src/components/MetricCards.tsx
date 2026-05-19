import type { JobStats } from '../lib/types'

const metrics: Array<{ key: keyof JobStats; label: string }> = [
  { key: 'applied', label: 'Applied' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'interviewed', label: 'Interviewed' },
  { key: 'offered', label: 'Offered' }
]

export function MetricCards({ stats }: { stats: JobStats }) {
  return (
    <section className="metrics" aria-label="Application metrics">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.key}>
          <span>{metric.label}</span>
          <strong>{stats[metric.key]}</strong>
        </article>
      ))}
    </section>
  )
}
