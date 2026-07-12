import { useQuery } from '@tanstack/vue-query'
import type { LocationsResponse } from '~/types'

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await fetch('/api/locations')
      if (!res.ok) throw new Error('Failed to fetch locations')
      return res.json() as Promise<LocationsResponse>
    },
  })
}
