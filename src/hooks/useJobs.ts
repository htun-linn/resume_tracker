import { useCallback, useEffect, useState } from 'react'
import type { JobApplication, JobStats } from '../lib/types'

const EMPTY_STATS: JobStats = {
  applied: 0,
  rejected: 0,
  interviewed: 0,
  offered: 0
}

export function useJobs() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [stats, setStats] = useState<JobStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [nextJobs, nextStats] = await Promise.all([window.api.jobs.list(), window.api.jobs.stats()])
    setJobs(nextJobs)
    setStats(nextStats)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    return window.api.onJobsChanged(refresh)
  }, [refresh])

  return { jobs, stats, loading, refresh }
}
