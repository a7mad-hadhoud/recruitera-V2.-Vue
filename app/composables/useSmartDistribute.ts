import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import type { SmartDistributeCandidatesResponse, SmartDistributeConfig } from '~/types'
import { useApi } from '~/composables/useApi'

export function useSmartDistributeConfig(jobId: Ref<string> | string) {
  const api = useApi()
  const id = typeof jobId === 'string' ? ref(jobId) : jobId
  return useQuery({
    queryKey: ['smart-distribute', 'config', id],
    queryFn: () => api.get<SmartDistributeConfig>(`/api/jobs/${id.value}/smart-distribute`),
  })
}

export function useSmartDistributeCandidates(jobId: Ref<string> | string, recruiterId: Ref<string | null>) {
  const api = useApi()
  const id = typeof jobId === 'string' ? ref(jobId) : jobId
  return useQuery({
    queryKey: ['smart-distribute', 'candidates', id, recruiterId],
    queryFn: () => api.get<SmartDistributeCandidatesResponse>(
      `/api/jobs/${id.value}/smart-distribute/candidates?recruiterId=${recruiterId.value}`,
    ),
    enabled: computed(() => !!recruiterId.value),
  })
}
