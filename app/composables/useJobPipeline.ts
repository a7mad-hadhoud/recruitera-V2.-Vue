/**
 * Pipeline board data. Fixture today; production shape below.
 *
 * ─── Target query-key architecture (when the real API lands) ────────────
 * Per-column card data (paginated, infinite):
 *   ['pipeline', jobId, stageKey, filters]
 * Per-column count badge (lightweight, cacheable server-side):
 *   ['pipeline-count', jobId, stageKey, filters]
 * Single-candidate cache shared across pipeline + candidates table + profile:
 *   ['candidate', candidateId]
 *
 * Keeping stageKey INSIDE the pipeline key is what makes a move invalidate
 * only the two affected columns, not the whole board.
 *
 * ─── Per-column config the API swap should carry over ───────────────────
 *   useInfiniteQuery({
 *     queryKey: ['pipeline', jobId, stageKey, filters],
 *     pageSize: 30,             // do NOT fetch a whole column in one request
 *     maxPages: 6,              // cap resident pages; evict oldest on scroll
 *     staleTime: 45_000,        // avoid re-pulling on Pipeline↔Notes↔Activity
 *     refetchOnWindowFocus: false,   // expensive at scale; rely on staleTime
 *   })
 *   useQuery({
 *     queryKey: ['pipeline-count', jobId, stageKey, filters],
 *     refetchOnWindowFocus: true,    // cheap + benefits from freshness
 *   })
 *
 * ─── moveCandidate as optimistic mutation ───────────────────────────────
 *   const move = useMutation({
 *     onMutate: async ({ id, fromKey, toKey }) => {
 *       // 1. cancel in-flight card queries for both columns
 *       // 2. snapshot both column caches AND both count caches
 *       // 3. setQueryData for both columns + both counts (Part 3 point 1-2)
 *       // 4. return snapshots for rollback
 *     },
 *     onError:   (_e, _vars, ctx) => restoreSnapshots(ctx),   // Part 3 point 4
 *     onSuccess: () => {},   // nothing — cache already reflects reality
 *   })
 *
 * ─── Filter-change reset ────────────────────────────────────────────────
 * When filters change, RESET each column's infinite query (clear accumulated
 * pages) — don't stack stale-filter pages beneath new-filter pages.
 *
 * ─── Bulk-action invalidation scope ─────────────────────────────────────
 * "Add candidates" / bulk-move / bulk-reject: invalidate ONLY the specific
 * affected stageKeys' pipeline + pipeline-count keys. Never a board-wide
 * invalidate — that defeats the whole pagination effort.
 *
 * ─── "My candidates" / "Shared with me" toggles ─────────────────────────
 * These MUST change the query parameters sent to the server (a new filter
 * folded into the query key), not filter an already-fetched slice client-
 * side. With pagination the client never holds the full set anyway.
 *
 * ─── Real-time (Part 6) ─────────────────────────────────────────────────
 * Not yet decided. When it is: subscription patches the same query-key
 * cache entries the optimistic mutation writes, so local drag and remote
 * update converge on ONE cache-mutation function.
 *
 * ─── Server pre-reqs (not optional) ─────────────────────────────────────
 *  • DB index on (job_id, stage_id, status) — hard requirement at 10k+ rows
 *  • Per-stage count endpoint (or one endpoint returning all stage counts
 *    for a job) — cacheable server-side with short TTL
 *  • Card metadata (AI score, comment/reply counts) batched INTO the card
 *    response — never N+1 per card
 */
import type { JobStageDot } from '~/types/job-pipeline.types'
import type { PipelineCandidate, PipelineStage } from '~/types/job-pipeline.types'

// Stage → dot color token. Kept here (not in the fixture) so the pipeline
// coloring stays consistent regardless of stage label edits and so a
// palette recolor updates every column dot at once.
const STAGE_DOT: Record<JobStageDot, string> = {
  sourced:   'var(--brand-text-faint)',
  applied:   'var(--brand-text-secondary)',
  phone:     'var(--brand-pipeline-blue)',
  interview: 'var(--brand-status-teal-green)',
  offer:     'var(--brand-pipeline-purple)',
  hired:     'var(--brand-status-approved-text)',
  rejected:  'var(--brand-status-closed-text)',
}

// One demo pipeline shared by every /jobs/[id] view — replace with a Vue
// Query call keyed by jobId when the real API lands (see useJobs.ts note).
const DEMO_STAGES: PipelineStage[] = [
  { key: 'sourced',   label: 'Sourced',         dot: STAGE_DOT.sourced,   candidates: [] },
  { key: 'applied',   label: 'Applied',         dot: STAGE_DOT.applied,   candidates: [
    { id: 'c1', name: 'Mohamed Ibrahim',     initials: 'MI', aiScore: 75, notes: 1, replies: 2, location: 'Amsterdam', isNew: true },
    { id: 'c2', name: 'Testtt CV',           initials: 'TC', aiScore: 75, notes: 1, replies: 2, location: 'Amsterdam' },
    { id: 'c3', name: 'John Doe (Sample)',   initials: 'JD', aiScore: 88, notes: 1, replies: 2, location: 'Amsterdam' },
  ]},
  { key: 'phone',     label: 'Phone interview', dot: STAGE_DOT.phone,     candidates: [
    { id: 'c4', name: 'Mariela Vasquez (Sample)', initials: 'MV', aiScore: 62, notes: 1, replies: 2, location: 'Amsterdam' },
    { id: 'c5', name: 'Alex Chen',                 initials: 'AC', aiScore: 71, notes: 0, replies: 1, location: 'Berlin'    },
  ]},
  { key: 'interview', label: 'Interview',       dot: STAGE_DOT.interview, candidates: [
    { id: 'c6', name: 'Sam Rivera',          initials: 'SR', aiScore: 82, notes: 3, replies: 4, location: 'Amsterdam' },
  ]},
  { key: 'offer',     label: 'Offer',           dot: STAGE_DOT.offer,     candidates: [] },
  { key: 'hired',     label: 'Hired',           dot: STAGE_DOT.hired,     candidates: [] },
  { key: 'rejected',  label: 'Rejected',        dot: STAGE_DOT.rejected,  candidates: [] },
]

const stagesRef = ref<PipelineStage[]>(DEMO_STAGES)

export function useJobPipeline(_jobId?: string) {
  // jobId is accepted for API-shape parity (future useQuery({queryKey: ['pipeline', jobId]}))
  // but the fixture is the same for every job for now.
  const qualifiedCount    = computed(() => stagesRef.value.reduce((n, s) => n + s.candidates.length, 0))
  const disqualifiedCount = computed(() => 1) // stub

  /**
   * Move a candidate from one stage to another (drag-and-drop on the board).
   * No-op if the from/to are the same, or if the candidate isn't found.
   * When the API lands this becomes a `useMutation({ … onMutate: optimisticMove })`
   * with rollback on error.
   */
  function moveCandidate(candidateId: string, fromKey: JobStageDot, toKey: JobStageDot) {
    if (fromKey === toKey) return
    const stages = stagesRef.value.map(s => ({ ...s, candidates: [...s.candidates] }))
    const from = stages.find(s => s.key === fromKey)
    const to   = stages.find(s => s.key === toKey)
    if (!from || !to) return
    const idx = from.candidates.findIndex(c => c.id === candidateId)
    if (idx < 0) return
    const [moved] = from.candidates.splice(idx, 1)
    if (moved) to.candidates.push(moved)
    stagesRef.value = stages
  }

  return {
    stages: stagesRef,
    qualifiedCount,
    disqualifiedCount,
    moveCandidate,
  }
}

export type { PipelineStage, PipelineCandidate }
