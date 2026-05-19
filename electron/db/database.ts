import { app } from 'electron'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

let db: DatabaseSync | null = null

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS file_assets (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('resume', 'cover_letter')),
  display_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  job_location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  company_email TEXT,
  job_description TEXT,
  job_title TEXT NOT NULL,
  job_link TEXT,
  resume_file_id TEXT,
  cover_letter_file_id TEXT,
  notes TEXT,
  status TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (resume_file_id) REFERENCES file_assets(id),
  FOREIGN KEY (cover_letter_file_id) REFERENCES file_assets(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_job_applications_submitted_at
  ON job_applications (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_assets_kind
  ON file_assets (kind);
`

export function getDatabase(): DatabaseSync {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'resume-tracker.db')
  mkdirSync(dirname(dbPath), { recursive: true })

  db = new DatabaseSync(dbPath, { allowBareNamedParameters: true })
  db.exec('PRAGMA foreign_keys = ON;')

  db.exec(SCHEMA)

  return db
}

export function getFilesRoot(): string {
  const root = join(app.getPath('userData'), 'files')
  mkdirSync(join(root, 'resumes'), { recursive: true })
  mkdirSync(join(root, 'cover-letters'), { recursive: true })
  return root
}

export function closeDatabase(): void {
  if (!db) return
  db.close()
  db = null
}
