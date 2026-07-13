import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import type { Candidate, CandidateFilterCounts, CandidateProfile, CandidatesResponse } from '~/types'
import { useApi } from '~/composables/useApi'

/**
 * Fetch a paginated, filtered slice of candidates.
 * `keepPreviousData` keeps the current rows visible while the new page/filter
 * loads — without it the table flickers to empty on every filter or page change.
 */
export function useCandidates(filters: Ref<Record<string, string | number | undefined>>) {
  const api = useApi()
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(filters.value)) {
        if (v === '' || v === undefined || v === null) continue
        params.set(k, String(v))
      }
      return api.get<CandidatesResponse>(`/api/candidates?${params}`)
    },
    placeholderData: keepPreviousData,
  })
}

export function useCandidate(id: Ref<string>) {
  const api = useApi()
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => api.get<Candidate>(`/api/candidates/${id.value}`),
  })
}

export function useCandidateProfile(id: Ref<string>) {
  const api = useApi()
  return useQuery({
    queryKey: ['candidate', id, 'profile'],
    queryFn: () => api.get<CandidateProfile>(`/api/candidates/${id.value}/profile`),
  })
}

export function useCandidateFilterCounts() {
  const api = useApi()
  return useQuery({
    queryKey: ['candidates', 'filter-counts'],
    queryFn: () => api.get<CandidateFilterCounts>('/api/candidates/filters/counts'),
  })
}
