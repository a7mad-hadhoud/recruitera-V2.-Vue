import { useLocalStorage } from '@vueuse/core'

// Column keys mirror the reference (Recruitera Jobs Standalone.html).
// Order here is the DEFAULT display order — user can drag to reorder.
export const JOB_COLUMN_KEYS = [
  'title',
  'dept',
  'status',
  'cands',
  'hired',
  'created',
  'assigned',
  'location',
  'location-address',
  'workmodel',
  'tags',
  'manage',
  'hidden',
  'jobid',
  'newcands',
  'schedpublish',
  'schedclose',
  'qualcands',
  'disqualcands',
  'followers',
] as const
export type JobColumnKey = typeof JOB_COLUMN_KEYS[number]

export const JOB_COLUMN_LABELS: Record<JobColumnKey, string> = {
  'title':               'Title',
  'status':              'Status',
  'cands':               'Candidates',
  'hired':               'Hired',
  'created':             'Creation date',
  'assigned':            'Assigned to',
  'dept':                'Department',
  'location':            'Location',
  'location-address':    'Location address',
  'workmodel':           'Work model',
  'tags':                'Tags',
  'manage':              'Manage',
  'hidden':              'Hidden',
  'jobid':               'Job ID',
  'newcands':            'New candidates',
  'schedpublish':        'Scheduled publish',
  'schedclose':          'Scheduled close',
  'qualcands':           'Qualified candidates',
  'disqualcands':        'Disqualified candidates',
  'followers':           'Followers',
}

// Columns visible on first visit — a cleaner, Bubble-like default set
// (title, department, status, candidates, hired, creation date, assigned to).
// Location / work model / tags stay available via the Columns picker.
const DEFAULT_VISIBLE: JobColumnKey[] = [
  'title', 'dept', 'status', 'cands', 'hired', 'created', 'assigned', 'manage',
]

// `title` and `status` are always on — the picker disables them.
export const LOCKED_COLUMNS: readonly JobColumnKey[] = ['title', 'status']

const VISIBLE_KEY = 'recruitera:jobs:visible-columns:v2'
const ORDER_KEY   = 'recruitera:jobs:column-order:v2'
const AUTOFIT_KEY = 'recruitera:jobs:autofit-disabled'

export function useJobsColumns() {
  const visible        = useLocalStorage<JobColumnKey[]>(VISIBLE_KEY, DEFAULT_VISIBLE)
  const columnOrder    = useLocalStorage<JobColumnKey[]>(ORDER_KEY, [...JOB_COLUMN_KEYS])
  const autoFitDisabled = useLocalStorage<boolean>(AUTOFIT_KEY, false)

  const isVisible = (k: JobColumnKey) => visible.value.includes(k)
  const isLocked = (k: JobColumnKey) => LOCKED_COLUMNS.includes(k)

  function toggleColumn(k: JobColumnKey) {
    if (isLocked(k)) return
    visible.value = isVisible(k)
      ? visible.value.filter(x => x !== k)
      : [...visible.value, k]
  }

  function moveColumn(from: number, to: number) {
    const arr = [...orderedRows.value]
    const [moved] = arr.splice(from, 1)
    if (!moved) return
    arr.splice(to, 0, moved)
    columnOrder.value = arr
  }

  // Full ordered list — user order first, then any keys added since (fallback).
  const orderedRows = computed<JobColumnKey[]>(() => {
    const seen = new Set<JobColumnKey>()
    const rows: JobColumnKey[] = []
    for (const k of columnOrder.value) {
      if ((JOB_COLUMN_KEYS as readonly string[]).includes(k) && !seen.has(k)) {
        rows.push(k); seen.add(k)
      }
    }
    for (const k of JOB_COLUMN_KEYS) if (!seen.has(k)) rows.push(k)
    return rows
  })

  // Visible-only, in the user's chosen order — what the table actually renders.
  const orderedVisible = computed<JobColumnKey[]>(() =>
    orderedRows.value.filter(k => isVisible(k)),
  )

  return {
    visible, columnOrder, autoFitDisabled,
    orderedRows, orderedVisible,
    isVisible, isLocked, toggleColumn, moveColumn,
  }
}
