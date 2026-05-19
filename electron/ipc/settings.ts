import { app, ipcMain, shell } from 'electron'
import { getDatabase } from '../db/database'

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:get', (_event, key: string) => {
    const row = getDatabase().prepare('SELECT value FROM settings WHERE key = ?').get(key) as unknown as
      | { value: string | null }
      | undefined

    return row?.value ?? null
  })

  ipcMain.handle('settings:set', (_event, key: string, value: string | null) => {
    if (value === null) {
      getDatabase().prepare('DELETE FROM settings WHERE key = ?').run(key)
      return
    }

    getDatabase()
      .prepare(
        `INSERT INTO settings (key, value)
         VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`
      )
      .run(key, value)
  })

  ipcMain.handle('settings:data-path', () => app.getPath('userData'))

  ipcMain.handle('settings:open-data-folder', async () => {
    const error = await shell.openPath(app.getPath('userData'))
    if (error) throw new Error(error)
  })
}
