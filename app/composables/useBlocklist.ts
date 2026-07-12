import { useQuery } from '@tanstack/vue-query'
import type { BlocklistResponse } from '~/types'

export function useBlocklist() {
  return useQuery({
    queryKey: ['blocklist'],
    queryFn: async () => {
      const res = await fetch('/api/blocklist')
      if (!res.ok) throw new Error('Failed to fetch blocklist')
      return res.json() as Promise<BlocklistResponse>
    },
  })
}
