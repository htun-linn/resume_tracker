import { FormEvent, useEffect, useMemo, useState } from 'react'
import { FilePickerField } from '../components/FilePickerField'
import { useFiles } from '../hooks/useFiles'
import { FileAsset, FileKind, JOB_LOCATIONS, JOB_STATUSES, JOB_TYPES, JobApplication, JobInput } from '../lib/types'
import { statusLabel, validateJobInput } from '../lib/validators'

const emptyInput: JobInput = {
  company_name: '',
  job_location: 'Singapore',
  job_type: 'Remote',
  company_email: '',
  job_description: '',
  job_title: '',
  job_link: '',
  resume_file_id: null,
  cover_letter_file_id: null,
  notes: '',
  status: 'draft'
}

function getJobId(): string | null {
  const hash = window.location.hash
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) return null

  return new URLSearchParams(hash.slice(queryIndex + 1)).get('id')
}

function toInput(job: JobApplication): JobInput {
  return {
    company_name: job.company_name,
    job_location: job.job_location,
    job_type: job.job_type,
    company_email: job.company_email,
    job_description: job.job_description,
    job_title: job.job_title,
    job_link: job.job_link,
    resume_file_id: job.resume_file_id,
    cover_letter_file_id: job.cover_letter_file_id,
    notes: job.notes,
    status: job.status
  }
}

export function JobFormWindow() {
  const jobId = useMemo(getJobId, [])
  const [input, setInput] = useState<JobInput>(emptyInput)
  const [loading, setLoading] = useState(Boolean(jobId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resumes = useFiles('resume')
  const coverLetters = useFiles('cover_letter')

  useEffect(() => {
    if (!jobId) return

    window.api.jobs
      .get(jobId)
      .then((job) => {
        if (!job) throw new Error('Job application was not found.')
        setInput(toInput(job))
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)))
      .finally(() => setLoading(false))
  }, [jobId])

  const errors = validateJobInput(input)
  const canSave = errors.length === 0 && !saving

  function setField<Key extends keyof JobInput>(key: Key, value: JobInput[Key]) {
    setInput((current) => ({ ...current, [key]: value }))
  }

  async function uploadFile(kind: FileKind): Promise<FileAsset | null> {
    const result = await window.api.files.upload(kind)
    return result.file
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSave) return

    try {
      setSaving(true)
      setError(null)
      if (jobId) {
        await window.api.jobs.update(jobId, input)
      } else {
        await window.api.jobs.create(input)
      }
      window.close()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="form-window">
        <p className="muted">Loading application...</p>
      </main>
    )
  }

  return (
    <main className="form-window">
      <div className="form-window__header">
        <div>
          <p className="eyebrow">{jobId ? 'Edit' : 'New'} application</p>
          <h1>{jobId ? 'Edit job application' : 'Add job application'}</h1>
        </div>
      </div>

      <form className="job-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Company & role</h2>
          <label className="field">
            <span>Company name</span>
            <input value={input.company_name} onChange={(event) => setField('company_name', event.target.value)} required />
          </label>
          <label className="field">
            <span>Job title</span>
            <input value={input.job_title} onChange={(event) => setField('job_title', event.target.value)} required />
          </label>
          <label className="field">
            <span>Job link</span>
            <input
              placeholder="https://example.com/job"
              value={input.job_link}
              onChange={(event) => setField('job_link', event.target.value)}
            />
          </label>
        </section>

        <section className="form-section form-section--grid">
          <label className="field">
            <span>Location</span>
            <select value={input.job_location} onChange={(event) => setField('job_location', event.target.value as JobInput['job_location'])}>
              {JOB_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Job type</span>
            <select value={input.job_type} onChange={(event) => setField('job_type', event.target.value as JobInput['job_type'])}>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="form-section">
          <h2>Contact & description</h2>
          <label className="field">
            <span>Company email</span>
            <input
              placeholder="hr@example.com"
              type="email"
              value={input.company_email}
              onChange={(event) => setField('company_email', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Job description</span>
            <textarea rows={6} value={input.job_description} onChange={(event) => setField('job_description', event.target.value)} />
          </label>
        </section>

        <section className="form-section">
          <h2>Documents</h2>
          <FilePickerField
            files={resumes.files}
            kind="resume"
            label="Resume file"
            onChange={(id) => setField('resume_file_id', id)}
            onUpload={uploadFile}
            value={input.resume_file_id}
          />
          <FilePickerField
            files={coverLetters.files}
            kind="cover_letter"
            label="Cover letter"
            onChange={(id) => setField('cover_letter_file_id', id)}
            onUpload={uploadFile}
            value={input.cover_letter_file_id}
          />
        </section>

        <section className="form-section">
          <h2>Status & notes</h2>
          <label className="field">
            <span>Status</span>
            <select value={input.status} onChange={(event) => setField('status', event.target.value as JobInput['status'])}>
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Notes</span>
            <textarea rows={3} value={input.notes} onChange={(event) => setField('notes', event.target.value)} />
          </label>
        </section>

        {(error || errors.length > 0) && (
          <div className="form-errors">
            {error ? <p>{error}</p> : errors.map((message) => <p key={message}>{message}</p>)}
          </div>
        )}

        <footer className="form-actions">
          <button className="button" onClick={() => window.close()} type="button">
            Cancel
          </button>
          <button className="button button--primary" disabled={!canSave} type="submit">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </footer>
      </form>
    </main>
  )
}
