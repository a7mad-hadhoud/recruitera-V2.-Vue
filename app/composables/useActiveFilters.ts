import type { ActiveFilter, FilterOperator } from '~/types/candidate-filter.types'

/**
 * Active filter chips that appear in the panel. Persisted to URL as JSON in
 * `?f=` — enough to survive back/forward and share links. Kept separate from
 * the primary `?status/search/job` params so the picker doesn't collide with
 * the existing simple filters.
 */
export function useActiveFilters() {
  const route = useRoute()
  const router = useRouter()

  const active = computed<ActiveFilter[]>(() => {
    const raw = route.query.f as string | undefined
    if (!raw) return []
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as ActiveFilter[]
      return Array.isArray(parsed) ? parsed : []
    }
    catch { return [] }
  })

  function commit(next: ActiveFilter[]) {
    const query = { ...route.query as Record<string, string> }
    if (!next.length) delete query.f
    else query.f = encodeURIComponent(JSON.stringify(next))
    delete query.page   // reset page whenever the filter set changes
    router.push({ query })
  }

  function add(id: string, op: FilterOperator) {
    if (active.value.some(f => f.id === id)) return
    commit([...active.value, { id, op }])
  }

  /** Add several at once — a single URL write. Sequential `add` calls collapse
   *  because they all read the same pre-commit state. */
  function addMany(entries: { id: string; op: FilterOperator }[]) {
    const existing = new Set(active.value.map(f => f.id))
    const next = [...active.value]
    for (const e of entries) {
      if (existing.has(e.id)) continue
      next.push({ id: e.id, op: e.op })
      existing.add(e.id)
    }
    if (next.length !== active.value.length) commit(next)
  }

  function removeMany(ids: string[]) {
    const drop = new Set(ids)
    const next = active.value.filter(f => !drop.has(f.id))
    if (next.length !== active.value.length) commit(next)
  }

  function remove(id: string) {
    commit(active.value.filter(f => f.id !== id))
  }

  function update(id: string, patch: Partial<ActiveFilter>) {
    commit(active.value.map(f => f.id === id ? { ...f, ...patch } : f))
  }

  function clear() { commit([]) }

  function isActive(id: string) { return active.value.some(f => f.id === id) }
  function get(id: string) { return active.value.find(f => f.id === id) }

  return { active, add, addMany, remove, removeMany, update, clear, isActive, get }
}
