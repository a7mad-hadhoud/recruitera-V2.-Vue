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

  return {
    stages: stagesRef,
    qualifiedCount,
    disqualifiedCount,
  }
}

export type { PipelineStage, PipelineCandidate }
