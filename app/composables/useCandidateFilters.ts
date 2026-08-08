import type { CandidateFilters } from '~/types'

/**
 * URL is the source of truth for candidate filters.
 * - Filtered views are shareable via link
 * - Browser back/forward restores state
 * - Refresh never loses filters
 *
 * Never store filter state in Pinia or component `ref()`.
 */
export function useCandidateFilters() {
  const route = useRoute()
  const router = useRouter()

  const filters = computed<CandidateFilters>(() => ({
    status:     (route.query.status     as string) ?? '',
    search:     (route.query.search     as string) ?? '',
    job:        (route.query.job        as string) ?? '',
    assignedTo: (route.query.assignedTo as string) ?? '',
    page:       Math.max(1, Number(route.query.page    ?? 1)),
    perPage:    Math.max(1, Number(route.query.perPage ?? 30)),
  }))

  /**
   * Merge/replace one filter key in the URL. Empty value removes the key.
   * Any filter change (except `page` itself) resets to page 1 — avoids being
   * stuck on page 12 of an empty result set after applying a narrower filter.
   */
  function setFilter(key: keyof CandidateFilters, value: string | number | null | undefined) {
    const next: Record<string, string> = { ...route.query as Record<string, string> }
    if (value === '' || value === null || value === undefined) {
      delete next[key]
    }
    else {
      next[key] = String(value)
    }
    if (key !== 'page' && key !== 'perPage') delete next.page
    router.push({ query: next })
  }

  function clearFilters() {
    router.push({ query: {} })
  }

  const hasActiveFilters = computed(() =>
    !!(filters.value.status || filters.value.search || filters.value.job || filters.value.assignedTo),
  )

  return { filters, setFilter, clearFilters, hasActiveFilters }
}
