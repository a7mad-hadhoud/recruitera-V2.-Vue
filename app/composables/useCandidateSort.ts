/**
 * Sort state for the Candidates table. Persisted to the URL (`?sort=key,dir`)
 * so shared links restore the same view.
 */
export const SORT_OPTIONS = [
  { key: 'relevance',       label: 'Relevance' },
  { key: 'name',            label: 'Name' },
  { key: 'avg-eval',        label: 'Average evaluation score' },
  { key: 'job',             label: 'Job' },
  { key: 'pipeline-stage',  label: 'Pipeline stage' },
  { key: 'evaluation',      label: 'Evaluation score' },
  { key: 'screening',       label: 'Screening score' },
  { key: 'talent-pool',     label: 'Talent pool' },
  { key: 'date-created',    label: 'Date created' },
  { key: 'last-activity',   label: 'Last activity' },
  { key: 'disqualified-by', label: 'Disqualified by' },
  { key: 'disqualify-date', label: 'Disqualify date' },
  { key: 'hire-date',       label: 'Hire date' },
  { key: 'start-date',      label: 'Start date' },
] as const

export type SortKey = typeof SORT_OPTIONS[number]['key']
export type SortDir = 'asc' | 'desc'

const DEFAULT_KEY: SortKey = 'job'
const DEFAULT_DIR: SortDir = 'desc'

export function useCandidateSort() {
  const route = useRoute()
  const router = useRouter()

  const key = computed<SortKey>(() => {
    const raw = (route.query.sort as string) ?? ''
    const [k] = raw.split(',')
    return (SORT_OPTIONS.find(o => o.key === k)?.key) ?? DEFAULT_KEY
  })
  const dir = computed<SortDir>(() => {
    const raw = (route.query.sort as string) ?? ''
    const [, d] = raw.split(',')
    return d === 'asc' ? 'asc' : DEFAULT_DIR
  })
  const label = computed(() => SORT_OPTIONS.find(o => o.key === key.value)?.label ?? '')

  function set(nextKey: SortKey) {
    // Clicking the active option toggles asc/desc; a different option resets to desc.
    const nextDir: SortDir = nextKey === key.value ? (dir.value === 'desc' ? 'asc' : 'desc') : 'desc'
    const q = { ...route.query as Record<string, string> }
    q.sort = `${nextKey},${nextDir}`
    router.push({ query: q })
  }

  return { key, dir, label, set, options: SORT_OPTIONS }
}
