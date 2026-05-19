import { JOB_LOCATIONS, JOB_STATUSES, JOB_TYPES, JobInput } from './types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return value.trim() === '' || EMAIL_PATTERN.test(value.trim())
}

export function isValidHttpUrl(value: string): boolean {
  if (value.trim() === '') return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateJobInput(input: JobInput): string[] {
  const errors: string[] = []

  if (!input.company_name.trim()) errors.push('Company name is required.')
  if (!input.job_title.trim()) errors.push('Job title is required.')
  if (!JOB_LOCATIONS.includes(input.job_location)) errors.push('Choose a valid job location.')
  if (!JOB_TYPES.includes(input.job_type)) errors.push('Choose a valid job type.')
  if (!JOB_STATUSES.includes(input.status)) errors.push('Choose a valid status.')
  if (!isValidEmail(input.company_email)) errors.push('Enter a valid company email.')
  if (!isValidHttpUrl(input.job_link)) errors.push('Enter a valid http or https job link.')

  return errors
}

export function statusLabel(status: string): string {
  if (status.startsWith('interview_')) {
    return `Interview (Round ${status.replace('interview_', '')})`
  }

  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
