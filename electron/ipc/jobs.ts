import { ipcMain } from 'electron'
import { randomUUID } from 'node:crypto'
import { getDatabase } from '../db/database'
import { JobApplication, JobInput, JobStats } from '../../src/lib/types'
import { validateJobInput } from '../../src/lib/validators'

type OpenForm = (id?: string) => void
type ResumeTrackerDatabase = ReturnType<typeof getDatabase>

function now(): string {
  return new Date().toISOString()
}

function ensureFileExists(db: ResumeTrackerDatabase, id: string | null, kind: 'resume' | 'cover_letter'): void {
  if (!id) return

  const file = db.prepare('SELECT id FROM file_assets WHERE id = ? AND kind = ?').get(id, kind)
  if (!file) throw new Error(`Selected ${kind.replace('_', ' ')} was not found.`)
}

function validateInput(db: ResumeTrackerDatabase, input: JobInput): void {
  const errors = validateJobInput(input)

  ensureFileExists(db, input.resume_file_id, 'resume')
  ensureFileExists(db, input.cover_letter_file_id, 'cover_letter')

  if (errors.length) {
    throw new Error(errors.join('\n'))
  }
}

function selectJob(db: ResumeTrackerDatabase, id: string): JobApplication | null {
  return (
    db
      .prepare(
        `SELECT job_applications.*,
                resume.display_name AS resume_name,
                cover_letter.display_name AS cover_letter_name
           FROM job_applications
           LEFT JOIN file_assets resume ON resume.id = job_applications.resume_file_id
           LEFT JOIN file_assets cover_letter ON cover_letter.id = job_applications.cover_letter_file_id
          WHERE job_applications.id = ?`
      )
      .get(id) as unknown as JobApplication | undefined
  ) ?? null
}

export function registerJobIpc(openForm: OpenForm, broadcast: (channel: string) => void): void {
  ipcMain.handle('jobs:list', () => {
    const db = getDatabase()
    return db
      .prepare(
        `SELECT job_applications.*,
                resume.display_name AS resume_name,
                cover_letter.display_name AS cover_letter_name
           FROM job_applications
           LEFT JOIN file_assets resume ON resume.id = job_applications.resume_file_id
           LEFT JOIN file_assets cover_letter ON cover_letter.id = job_applications.cover_letter_file_id
          ORDER BY datetime(submitted_at) DESC`
      )
      .all() as unknown as JobApplication[]
  })

  ipcMain.handle('jobs:get', (_event, id: string) => {
    return selectJob(getDatabase(), id)
  })

  ipcMain.handle('jobs:create', (_event, input: JobInput) => {
    const db = getDatabase()
    validateInput(db, input)

    const timestamp = now()
    const id = randomUUID()

    db.prepare(
      `INSERT INTO job_applications (
        id, company_name, job_location, job_type, company_email, job_description,
        job_title, job_link, resume_file_id, cover_letter_file_id, notes, status,
        submitted_at, created_at, updated_at
      ) VALUES (
        @id, @company_name, @job_location, @job_type, @company_email, @job_description,
        @job_title, @job_link, @resume_file_id, @cover_letter_file_id, @notes, @status,
        @submitted_at, @created_at, @updated_at
      )`
    ).run({
      ...input,
      id,
      submitted_at: timestamp,
      created_at: timestamp,
      updated_at: timestamp
    })

    const job = selectJob(db, id)
    broadcast('jobs-changed')
    return job
  })

  ipcMain.handle('jobs:update', (_event, id: string, input: JobInput) => {
    const db = getDatabase()
    validateInput(db, input)

    const current = selectJob(db, id)
    if (!current) throw new Error('Job application was not found.')

    db.prepare(
      `UPDATE job_applications
          SET company_name = @company_name,
              job_location = @job_location,
              job_type = @job_type,
              company_email = @company_email,
              job_description = @job_description,
              job_title = @job_title,
              job_link = @job_link,
              resume_file_id = @resume_file_id,
              cover_letter_file_id = @cover_letter_file_id,
              notes = @notes,
              status = @status,
              updated_at = @updated_at
        WHERE id = @id`
    ).run({
      ...input,
      id,
      updated_at: now()
    })

    const job = selectJob(db, id)
    broadcast('jobs-changed')
    return job
  })

  ipcMain.handle('jobs:delete', (_event, id: string) => {
    const db = getDatabase()
    db.prepare('DELETE FROM job_applications WHERE id = ?').run(id)
    broadcast('jobs-changed')
  })

  ipcMain.handle('jobs:stats', () => {
    const rows = getDatabase()
      .prepare('SELECT status, COUNT(*) AS count FROM job_applications GROUP BY status')
      .all() as unknown as Array<{ status: string; count: number }>

    const stats: JobStats = { applied: 0, rejected: 0, interviewed: 0, offered: 0 }

    for (const row of rows) {
      if (row.status === 'applied' || row.status === 'replied') stats.applied += row.count
      if (row.status === 'rejected') stats.rejected += row.count
      if (row.status.startsWith('interview_')) stats.interviewed += row.count
      if (row.status === 'offered') stats.offered += row.count
    }

    return stats
  })

  ipcMain.handle('jobs:open-form', (_event, id?: string) => {
    openForm(id)
  })

}
