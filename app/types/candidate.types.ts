export type CandidateStatus = 'new' | 'qualified' | 'disqualified' | 'not_contacted' | 'followed'
export type JobStatus       = 'published' | 'internal' | 'closed' | 'archived'

export interface CandidateJob {
  title: string
  status: JobStatus
}

export interface Candidate {
  id: string
  name: string
  initials: string
  avatarColor: string
  isNew: boolean

  status: CandidateStatus
  jobs: CandidateJob[]                 // 0..N
  sources: string[]                    // e.g. ['Indeed'], ['LinkedIn'], ['Careers site']
  tags: string[]                       // e.g. ['Sample', 'Junior']
  talentPools: string[]                // e.g. ['Rising stars (Sample)']
  disqualifiedBy: string | null

  // relative time strings — a real API would return ISO dates
  dateCreated: string

  // hidden-by-default columns
  stage?: string
  evaluationScore?: number
  averageEvaluationScore?: number
  screeningScore?: number
  workLocation?: string
  disqualifyDate?: string
  integrations?: string[]
  lastActivity?: string
  hireDate?: string
  startDate?: string
}

export interface CandidatesResponse {
  data: Candidate[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface CandidateFilterCounts {
  recentlyDeleted: number
  qualifiedCandidates: number
  newCandidates: number
  notContacted: number
  followedCandidates: number
}

export interface CandidateFilters {
  status: string
  search: string
  job: string
  page: number
  perPage: number
}
