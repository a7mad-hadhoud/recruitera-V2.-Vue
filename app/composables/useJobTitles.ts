import { useQuery } from '@tanstack/vue-query'
import type { JobTitlesResponse } from '~/types'

export function useJobTitles() {
  return useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      const res = await fetch('/api/job-titles')
      if (!res.ok) throw new Error('Failed to fetch job titles')
      return res.json() as Promise<JobTitlesResponse>
    },
  })
}
