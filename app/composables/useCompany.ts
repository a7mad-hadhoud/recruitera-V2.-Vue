import { useQuery } from '@tanstack/vue-query'
import type { CompanyInfo } from '~/types'

export function useCompany() {
  return useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const res = await fetch('/api/company')
      if (!res.ok) throw new Error('Failed to fetch company')
      return res.json() as Promise<CompanyInfo>
    },
  })
}
