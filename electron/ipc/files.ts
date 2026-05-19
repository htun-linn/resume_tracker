import { dialog, ipcMain, shell } from 'electron'
import { randomUUID } from 'node:crypto'
import { copyFileSync, statSync, unlinkSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { getDatabase, getFilesRoot } from '../db/database'
import type { FileAsset, FileKind, UploadResult } from '../../src/lib/types'

const folderByKind: Record<FileKind, string> = {
  resume: 'resumes',
  cover_letter: 'cover-letters'
}

const filtersByKind: Record<FileKind, Electron.FileFilter[]> = {
  resume: [{ name: 'Resume files', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'] }],
  cover_letter: [{ name: 'Cover letter files', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'] }]
}

function getFileAsset(id: string): FileAsset | null {
  return (getDatabase().prepare('SELECT * FROM file_assets WHERE id = ?').get(id) as unknown as FileAsset | undefined) ?? null
}

function getStoredPath(file: FileAsset): string {
  return join(getFilesRoot(), folderByKind[file.kind], file.stored_name)
}

export function registerFileIpc(broadcast: (channel: string) => void): void {
  ipcMain.handle('files:list', (_event, kind: FileKind) => {
    if (!(kind in folderByKind)) throw new Error('Invalid file kind.')

    return getDatabase()
      .prepare('SELECT * FROM file_assets WHERE kind = ? ORDER BY datetime(created_at) DESC')
      .all(kind) as unknown as FileAsset[]
  })

  ipcMain.handle('files:upload', async (_event, kind: FileKind): Promise<UploadResult> => {
    if (!(kind in folderByKind)) throw new Error('Invalid file kind.')

    const result = await dialog.showOpenDialog({
      title: kind === 'resume' ? 'Upload resume' : 'Upload cover letter',
      properties: ['openFile'],
      filters: [...filtersByKind[kind], { name: 'All files', extensions: ['*'] }]
    })

    if (result.canceled || !result.filePaths[0]) {
      return { file: null, canceled: true }
    }

    const sourcePath = result.filePaths[0]
    const id = randomUUID()
    const displayName = basename(sourcePath)
    const storedName = `${id}${extname(sourcePath)}`
    const destinationPath = join(getFilesRoot(), folderByKind[kind], storedName)
    const sourceStats = statSync(sourcePath)

    copyFileSync(sourcePath, destinationPath)

    const createdAt = new Date().toISOString()
    getDatabase()
      .prepare(
        `INSERT INTO file_assets (id, kind, display_name, stored_name, mime_type, size_bytes, created_at)
         VALUES (@id, @kind, @display_name, @stored_name, @mime_type, @size_bytes, @created_at)`
      )
      .run({
        id,
        kind,
        display_name: displayName,
        stored_name: storedName,
        mime_type: null,
        size_bytes: sourceStats.size,
        created_at: createdAt
      })

    const file = getFileAsset(id)
    broadcast('files-changed')
    return { file, canceled: false }
  })

  ipcMain.handle('files:delete', (_event, id: string) => {
    const db = getDatabase()
    const file = getFileAsset(id)
    if (!file) throw new Error('File was not found.')

    const reference = db
      .prepare(
        `SELECT COUNT(*) AS count
           FROM job_applications
          WHERE resume_file_id = ? OR cover_letter_file_id = ?`
      )
      .get(id, id) as unknown as { count: number }

    if (reference.count > 0) {
      throw new Error(`This file is linked to ${reference.count} job application(s). Remove those links first.`)
    }

    db.prepare('DELETE FROM file_assets WHERE id = ?').run(id)

    try {
      unlinkSync(getStoredPath(file))
    } catch {
      // The DB record is the source of truth; a missing file should not block cleanup.
    }

    broadcast('files-changed')
  })

  ipcMain.handle('files:open', async (_event, id: string) => {
    const file = getFileAsset(id)
    if (!file) throw new Error('File was not found.')

    const error = await shell.openPath(getStoredPath(file))
    if (error) throw new Error(error)
  })
}
