import { useQuery } from '@tanstack/vue-query'
import type { PublicLink } from '~/types'

interface PublicLinksResponse {
  data: PublicLink[]
  total: number
}

export function usePublicLinks() {
  return useQuery({
    queryKey: ['public-links'],
    queryFn: async () => {
      const res = await fetch('/api/public-links')
      if (!res.ok) throw new Error('Failed to fetch public links')
      return res.json() as Promise<PublicLinksResponse>
    },
  })
}
