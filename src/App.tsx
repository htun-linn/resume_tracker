import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Toolbar } from './components/Toolbar'
import { useJobs } from './hooks/useJobs'
import { CoverLetters } from './views/CoverLetters'
import { Dashboard } from './views/Dashboard'
import { Resumes } from './views/Resumes'
import { JobFormWindow } from './windows/JobFormWindow'

export type ViewKey = 'dashboard' | 'resumes' | 'coverLetters'

export function App() {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dataPath, setDataPath] = useState<string | null>(null)
  const { jobs, stats, loading } = useJobs()

  if (window.location.hash.startsWith('#/job-form')) {
    return <JobFormWindow />
  }

  async function uploadResume() {
    await window.api.files.upload('resume')
  }

  async function uploadCoverLetter() {
    await window.api.files.upload('cover_letter')
  }

  async function openSettings() {
    setDataPath(await window.api.settings.getDataPath())
    setSettingsOpen(true)
  }

  function renderView() {
    if (activeView === 'resumes') return <Resumes />
    if (activeView === 'coverLetters') return <CoverLetters />

    return (
      <Dashboard
        jobs={jobs}
        loading={loading}
        onAdd={() => window.api.jobs.openForm()}
        onEdit={(id) => window.api.jobs.openForm(id)}
        stats={stats}
      />
    )
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onChange={setActiveView} />
      <div className="app-main">
        <Toolbar onOpenSettings={openSettings} onUploadCoverLetter={uploadCoverLetter} onUploadResume={uploadResume} />
        {renderView()}
      </div>

      {settingsOpen && (
        <div className="modal-backdrop" role="presentation">
          <section aria-modal="true" className="modal" role="dialog">
            <div className="modal__header">
              <h2>Settings</h2>
              <button className="icon-button" onClick={() => setSettingsOpen(false)} type="button">
                ×
              </button>
            </div>
            <p className="muted">Your database and uploaded documents are stored locally on this computer.</p>
            <label className="field">
              <span>Data folder</span>
              <input readOnly value={dataPath ?? ''} />
            </label>
            <div className="modal__actions">
              <button className="button" onClick={() => window.api.settings.openDataFolder()} type="button">
                Open data folder
              </button>
              <button className="button button--primary" onClick={() => setSettingsOpen(false)} type="button">
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
