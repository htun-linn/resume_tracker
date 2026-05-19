export const JOB_LOCATIONS = [
  'Singapore',
  'Myanmar',
  'Malaysia',
  'Philippine',
  'Thailand',
  'Australia',
  'Japan',
  'Korea'
] as const

export const JOB_TYPES = ['Remote', 'Onsite', 'Hybrid', 'Fully Remote'] as const

export const JOB_STATUSES = [
  'draft',
  'applied',
  'replied',
  'interview_1',
  'interview_2',
  'interview_3',
  'interview_4',
  'interview_5',
  'offered',
  'rejected'
] as const

export type JobLocation = (typeof JOB_LOCATIONS)[number]
export type JobType = (typeof JOB_TYPES)[number]
export type JobStatus = (typeof JOB_STATUSES)[number]
export type FileKind = 'resume' | 'cover_letter'

export interface FileAsset {
  id: string
  kind: FileKind
  display_name: string
  stored_name: string
  mime_type: string | null
  size_bytes: number
  created_at: string
}

export interface JobApplication {
  id: string
  company_name: string
  job_location: JobLocation
  job_type: JobType
  company_email: string
  job_description: string
  job_title: string
  job_link: string
  resume_file_id: string | null
  cover_letter_file_id: string | null
  resume_name?: string | null
  cover_letter_name?: string | null
  notes: string
  status: JobStatus
  submitted_at: string
  created_at: string
  updated_at: string
}

export interface JobInput {
  company_name: string
  job_location: JobLocation
  job_type: JobType
  company_email: string
  job_description: string
  job_title: string
  job_link: string
  resume_file_id: string | null
  cover_letter_file_id: string | null
  notes: string
  status: JobStatus
}

export interface JobStats {
  applied: number
  rejected: number
  interviewed: number
  offered: number
}

export interface UploadResult {
  file: FileAsset | null
  canceled: boolean
}
