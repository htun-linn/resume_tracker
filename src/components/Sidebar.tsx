import type { ViewKey } from '../App'

const items: Array<{ key: ViewKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'resumes', label: 'Resumes' },
  { key: 'coverLetters', label: 'Cover Letters' }
]

interface SidebarProps {
  activeView: ViewKey
  onChange: (view: ViewKey) => void
}

export function Sidebar({ activeView, onChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Resume Tracker</div>
      <nav className="sidebar__nav">
        {items.map((item) => (
          <button
            className={item.key === activeView ? 'sidebar__item sidebar__item--active' : 'sidebar__item'}
            key={item.key}
            onClick={() => onChange(item.key)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
