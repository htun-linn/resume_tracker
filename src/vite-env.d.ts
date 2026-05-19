/// <reference types="vite/client" />

import type { FileAsset, FileKind, JobApplication, JobInput, JobStats, UploadResult } from './lib/types'

export interface ResumeTrackerApi {
  jobs: {
    list: () => Promise<JobApplication[]>
    get: (id: string) => Promise<JobApplication | null>
    create: (input: JobInput) => Promise<JobApplication>
    update: (id: string, input: JobInput) => Promise<JobApplication>
    delete: (id: string) => Promise<void>
    stats: () => Promise<JobStats>
    openForm: (id?: string) => Promise<void>
  }
  files: {
    list: (kind: FileKind) => Promise<FileAsset[]>
    upload: (kind: FileKind) => Promise<UploadResult>
    delete: (id: string) => Promise<void>
    open: (id: string) => Promise<void>
  }
  settings: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string | null) => Promise<void>
    getDataPath: () => Promise<string>
    openDataFolder: () => Promise<void>
  }
  onJobsChanged: (callback: () => void) => () => void
  onFilesChanged: (callback: () => void) => () => void
}

declare global {
  interface Window {
    api: ResumeTrackerApi
  }
}
