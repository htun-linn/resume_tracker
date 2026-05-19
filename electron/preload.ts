import { contextBridge, ipcRenderer } from 'electron'
import type { FileKind, JobInput } from '../src/lib/types'

contextBridge.exposeInMainWorld('api', {
  jobs: {
    list: () => ipcRenderer.invoke('jobs:list'),
    get: (id: string) => ipcRenderer.invoke('jobs:get', id),
    create: (input: JobInput) => ipcRenderer.invoke('jobs:create', input),
    update: (id: string, input: JobInput) => ipcRenderer.invoke('jobs:update', id, input),
    delete: (id: string) => ipcRenderer.invoke('jobs:delete', id),
    stats: () => ipcRenderer.invoke('jobs:stats'),
    openForm: (id?: string) => ipcRenderer.invoke('jobs:open-form', id)
  },
  files: {
    list: (kind: FileKind) => ipcRenderer.invoke('files:list', kind),
    upload: (kind: FileKind) => ipcRenderer.invoke('files:upload', kind),
    delete: (id: string) => ipcRenderer.invoke('files:delete', id),
    open: (id: string) => ipcRenderer.invoke('files:open', id)
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: string | null) => ipcRenderer.invoke('settings:set', key, value),
    getDataPath: () => ipcRenderer.invoke('settings:data-path'),
    openDataFolder: () => ipcRenderer.invoke('settings:open-data-folder')
  },
  onJobsChanged: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('jobs-changed', listener)
    return () => ipcRenderer.removeListener('jobs-changed', listener)
  },
  onFilesChanged: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('files-changed', listener)
    return () => ipcRenderer.removeListener('files-changed', listener)
  }
})
