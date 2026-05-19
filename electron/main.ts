import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { closeDatabase, getDatabase } from './db/database'
import { registerFileIpc } from './ipc/files'
import { registerJobIpc } from './ipc/jobs'
import { registerSettingsIpc } from './ipc/settings'

let mainWindow: BrowserWindow | null = null

function broadcast(channel: string): void {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(channel)
  }
}

function rendererUrl(hash = ''): string {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  if (devServerUrl) return `${devServerUrl}${hash}`

  return join(__dirname, '../renderer/index.html')
}

function loadRenderer(window: BrowserWindow, hash = ''): void {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  if (devServerUrl) {
    window.loadURL(rendererUrl(hash))
    return
  }

  window.loadFile(rendererUrl(), { hash: hash.replace(/^#/, '') })
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    title: 'Resume Tracker',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  loadRenderer(mainWindow)
}

function openJobForm(id?: string): void {
  const query = id ? `?id=${encodeURIComponent(id)}` : ''
  const window = new BrowserWindow({
    width: 560,
    height: 760,
    minWidth: 520,
    minHeight: 680,
    parent: mainWindow ?? undefined,
    modal: false,
    title: id ? 'Edit Application' : 'Add Application',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  loadRenderer(window, `#/job-form${query}`)
}

app.whenReady().then(() => {
  getDatabase()
  registerFileIpc(broadcast)
  registerJobIpc(openJobForm, broadcast)
  registerSettingsIpc()
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  closeDatabase()
})
