import { useLocalStorage } from '@vueuse/core'

// Column keys mirror the reference (Recruitera Jobs Standalone.html).
// Some are wired to real Job fields today; the rest are stubbed as toggles so
// the picker matches the full design and we can flesh them out later.
export const JOB_COLUMN_KEYS = [
  'title',
  'status',
  'cands',
  'hired',
  'dept',
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
  'hired':               'Hires',
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

// Columns visible on first visit — matches the reference's checked state.
const DEFAULT_VISIBLE: JobColumnKey[] = [
  'title', 'status', 'cands', 'hired', 'dept', 'location', 'workmodel', 'tags',
]

// `title` and `status` are always on — the picker disables them.
export const LOCKED_COLUMNS: readonly JobColumnKey[] = ['title', 'status']

const STORAGE_KEY = 'recruitera:jobs:visible-columns'

export function useJobsColumns() {
  const visible = useLocalStorage<JobColumnKey[]>(STORAGE_KEY, DEFAULT_VISIBLE)

  const isVisible = (k: JobColumnKey) => visible.value.includes(k)
  const isLocked = (k: JobColumnKey) => LOCKED_COLUMNS.includes(k)

  function toggle(k: JobColumnKey) {
    if (isLocked(k)) return
    visible.value = isVisible(k)
      ? visible.value.filter(x => x !== k)
      : [...visible.value, k]
  }

  const orderedVisible = computed<JobColumnKey[]>(() =>
    JOB_COLUMN_KEYS.filter(k => visible.value.includes(k)),
  )

  return { visible, orderedVisible, isVisible, isLocked, toggle }
}
