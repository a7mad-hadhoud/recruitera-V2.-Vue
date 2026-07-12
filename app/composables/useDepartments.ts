import { useQuery } from '@tanstack/vue-query'
import type { DepartmentsResponse } from '~/types'

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await fetch('/api/departments')
      if (!res.ok) throw new Error('Failed to fetch departments')
      return res.json() as Promise<DepartmentsResponse>
    },
  })
}
