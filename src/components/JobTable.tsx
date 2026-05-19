import type { JobApplication } from '../lib/types'
import { statusLabel } from '../lib/validators'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
}

export function JobTable({ jobs, onEdit }: { jobs: JobApplication[]; onEdit: (id: string) => void }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>Submitted</th>
            <th>Company</th>
            <th>Title</th>
            <th>Location</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{formatDate(job.submitted_at)}</td>
              <td>{job.company_name}</td>
              <td>{job.job_title}</td>
              <td>{job.job_location}</td>
              <td>
                <span className={`status-badge status-badge--${job.status.split('_')[0]}`}>
                  {statusLabel(job.status)}
                </span>
              </td>
              <td className="table-card__actions">
                <button className="button button--small" onClick={() => onEdit(job.id)} type="button">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
