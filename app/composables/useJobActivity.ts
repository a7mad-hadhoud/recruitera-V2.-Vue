// Activity feed for a job's Activity tab. Fixture today — swap for a
// server call keyed by jobId when the API lands (see useJobs.ts note).

export type JobActivityKind =
  | 'assign-candidate'
  | 'assign-location'
  | 'change-status'
  | 'assign-work-type'
  | 'add-job'
  | 'automation'

export interface JobActivity {
  id: string
  kind: JobActivityKind
  userName: string
  userInitials: string
  /** HTML-safe segments — plain strings get rendered as text; { b } segments get wrapped in <strong>. */
  segments: ({ t: string } | { b: string })[]
  timeAgo: string   // "11h", "14h" — a real API returns ISO dates
  date:    string   // grouping bucket
  isAutomation?: boolean
}

const NOW_ACTIVITIES: JobActivity[] = [
  {
    id: 'a1',
    kind: 'assign-candidate',
    userName: 'Amr Hammad',
    userInitials: 'AH',
    segments: [
      { b: 'Amr Hammad' },
      { t: ' assigned candidate ' },
      { b: 'dasddsd' },
      { t: ' to the job ' },
      { b: 'Amerewr (2)' },
      { t: '.' },
    ],
    timeAgo: '11h',
    date: '20 July 2026',
  },
  {
    id: 'a2',
    kind: 'assign-location',
    userName: 'Amr Hammad',
    userInitials: 'AH',
    segments: [
      { b: 'Amr Hammad' },
      { t: ' assigned the ' },
      { b: 'Amsterdam' },
      { t: ' location to the ' },
      { b: 'Amerewr (2)' },
      { t: ' job.' },
    ],
    timeAgo: '14h',
    date: '20 July 2026',
  },
  {
    id: 'a3',
    kind: 'change-status',
    userName: 'Amr Hammad',
    userInitials: 'AH',
    segments: [
      { b: 'Amr Hammad' },
      { t: ' changed the status of the job ' },
      { b: 'Amerewr (2)' },
      { t: ' from ' },
      { b: 'draft' },
      { t: ' to ' },
      { b: 'published' },
      { t: '.' },
    ],
    timeAgo: '14h',
    date: '20 July 2026',
  },
  {
    id: 'a4',
    kind: 'assign-work-type',
    userName: 'Amr Hammad',
    userInitials: 'AH',
    segments: [
      { b: 'Amr Hammad' },
      { t: ' assigned the Remote work type to the ' },
      { b: 'Amerewr (2)' },
      { t: ' job.' },
    ],
    timeAgo: '14h',
    date: '20 July 2026',
  },
  {
    id: 'a5',
    kind: 'add-job',
    userName: 'Amr Hammad',
    userInitials: 'AH',
    segments: [
      { b: 'Amr Hammad' },
      { t: ' added a new job ' },
      { b: 'Amerewr (2)' },
      { t: '.' },
    ],
    timeAgo: '14h',
    date: '20 July 2026',
  },
]

export function useJobActivity(_jobId?: string) {
  const activities = ref<JobActivity[]>(NOW_ACTIVITIES)

  // Group by date bucket for the timeline headers.
  const grouped = computed(() => {
    const buckets = new Map<string, JobActivity[]>()
    for (const a of activities.value) {
      if (!buckets.has(a.date)) buckets.set(a.date, [])
      buckets.get(a.date)!.push(a)
    }
    return Array.from(buckets.entries()).map(([date, items]) => ({ date, items }))
  })

  return { activities, grouped }
}
