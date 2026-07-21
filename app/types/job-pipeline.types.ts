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
  /** Optional card metadata shown in every screening list row. Rendering
   *  falls back to the fetched profile when these are absent, but keeping
   *  them on the card keeps NON-selected rows populated too. */
  headline?: string
  tags?: string[]
  source?: string
  createdAt?: string
}

export interface PipelineStage {
  key: JobStageDot
  label: string
  dot: string           // CSS color value (token reference)
  candidates: PipelineCandidate[]
}
