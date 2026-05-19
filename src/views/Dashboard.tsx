import { EmptyState } from '../components/EmptyState'
import { JobTable } from '../components/JobTable'
import { MetricCards } from '../components/MetricCards'
import type { JobApplication, JobStats } from '../lib/types'

interface DashboardProps {
  jobs: JobApplication[]
  stats: JobStats
  loading: boolean
  onAdd: () => void
  onEdit: (id: string) => void
}

export function Dashboard({ jobs, stats, loading, onAdd, onEdit }: DashboardProps) {
  return (
    <main className="view">
      <div className="view__header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Applications</h1>
        </div>
        <button className="button button--primary" onClick={onAdd} type="button">
          + Add
        </button>
      </div>

      <MetricCards stats={stats} />

      {loading ? (
        <p className="muted">Loading applications...</p>
      ) : jobs.length === 0 ? (
        <EmptyState onAdd={onAdd} />
      ) : (
        <JobTable jobs={jobs} onEdit={onEdit} />
      )}
    </main>
  )
}
