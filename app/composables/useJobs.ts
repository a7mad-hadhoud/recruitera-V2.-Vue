import type { Job, JobStatus } from '~/types'

/**
 * Static jobs fixture — matches the rows in the design reference.
 * Swap for an MSW handler + Vue Query call when the API is ready
 * (mirror the useCandidates.ts pattern).
 *
 * Kept as a module-scope ref so status changes made via the Status
 * column dropdown persist across route changes within the same tab.
 *
 * ─── When the real API lands, migrate these here ────────────────────
 *   • Pagination — swap `jobs` for `useQuery({ queryKey: ['jobs', filters], … })`
 *     and thread `page/perPage` through the filters (see useCandidates for the
 *     shape). If total counts pass ~1000, add @tanstack/vue-virtual to the card
 *     list container instead of paginating.
 *   • Skeleton loading — render a stack of skeleton JobCards while `isFetching`
 *     is true (mirror CandidatesTableSkeleton). Avoids layout jump.
 *   • Optimistic status mutations — `useMutation` with onMutate to write the
 *     new status into the query cache, rollback in onError.
 *   • URL-synced search + filters — bind `searchInput` + activeView + collarTab
 *     to router.query so bookmarked/shared links reproduce the view.
 */
const FIXTURE: Job[] = [
  { id: 'j1', title: 'Backend Engineer',        status: 'published', location: 'Tel Aviv',  department: 'Engineering', workModel: 'on-site', collar: 'white', candidateCount: 58, newCandidates: 11, hires: 2 },
  { id: 'j2', title: 'Senior Frontend Engineer', status: 'published', location: 'London',    department: 'Engineering', workModel: 'hybrid',  collar: 'white', candidateCount: 47, newCandidates: 7,  hires: 2 },
  { id: 'j3', title: 'Marketing Manager',        status: 'draft',     location: 'Amsterdam', department: 'Marketing',   workModel: 'remote',  collar: 'white', candidateCount: 12, newCandidates: 2,  hires: 0 },
  { id: 'j4', title: 'Product Designer',         status: 'published', location: 'Remote',    department: 'Design',      workModel: 'remote',  collar: 'white', candidateCount: 31, newCandidates: 4,  hires: 1 },
  { id: 'j5', title: 'Data Analyst',             status: 'internal',  location: 'Tel Aviv',  department: 'Data',        workModel: 'on-site', collar: 'white', candidateCount: 8,  newCandidates: 1,  hires: 0 },
  { id: 'j6', title: 'Warehouse Operative',      status: 'published', location: 'Cairo',     department: 'Operations',  workModel: 'on-site', collar: 'blue',  candidateCount: 23, newCandidates: 3,  hires: 1 },
  { id: 'j7', title: 'Delivery Driver',          status: 'published', location: 'Cairo',     department: 'Logistics',   workModel: 'on-site', collar: 'blue',  candidateCount: 41, newCandidates: 6,  hires: 3 },
  { id: 'j8', title: 'Customer Support Lead',    status: 'closed',    location: 'Dubai',     department: 'Support',     workModel: 'hybrid',  collar: 'white', candidateCount: 19, newCandidates: 0,  hires: 1 },
  { id: 'j9', title: 'UX Researcher',            status: 'draft',     location: 'Remote',    department: 'Design',      workModel: 'remote',  collar: 'white', candidateCount: 0,  newCandidates: 0,  hires: 0 },
]

const jobsRef = ref<Job[]>(FIXTURE)

export function useJobs() {
  function setStatus(id: string, status: JobStatus) {
    jobsRef.value = jobsRef.value.map(j => j.id === id ? { ...j, status } : j)
  }
  return { jobs: jobsRef, setStatus }
}
