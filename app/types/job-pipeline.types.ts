export type JobStageDot = 'sourced' | 'applied' | 'phone' | 'interview' | 'offer' | 'hired' | 'rejected'

export interface PipelineCandidate {
  id: string
  name: string
  initials: string
  /** Optional photo URL. When present, cards render <img>; otherwise, initials. */
  avatarUrl?: string | null
  aiScore: number       // 0-100
  notes: number
  replies: number
  location: string | null
  isNew?: boolean
}

export interface PipelineStage {
  key: JobStageDot
  label: string
  dot: string           // CSS color value (token reference)
  candidates: PipelineCandidate[]
}
