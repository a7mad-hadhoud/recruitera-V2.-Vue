import { useQuery } from '@tanstack/vue-query'
import type { TagsByCategory } from '~/types'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags')
      if (!res.ok) throw new Error('Failed to fetch tags')
      return res.json() as Promise<TagsByCategory>
    },
  })
}
