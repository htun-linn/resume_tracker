interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <svg aria-hidden="true" className="empty-state__art" viewBox="0 0 220 160">
        <rect x="48" y="28" width="124" height="104" rx="16" fill="#e8eefc" />
        <rect x="67" y="50" width="86" height="10" rx="5" fill="#9db4f3" />
        <rect x="67" y="74" width="64" height="8" rx="4" fill="#c0cdf8" />
        <rect x="67" y="94" width="78" height="8" rx="4" fill="#c0cdf8" />
        <circle cx="160" cy="118" r="22" fill="#2563eb" />
        <path d="M160 106v24M148 118h24" stroke="#fff" strokeLinecap="round" strokeWidth="6" />
      </svg>
      <h2>No applications yet</h2>
      <p>Add your first job application to start tracking progress.</p>
      <button className="button button--primary" onClick={onAdd} type="button">
        Add application
      </button>
    </section>
  )
}
