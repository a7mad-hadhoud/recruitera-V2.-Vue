export type JobStageDot = 'sourced' | 'applied' | 'phone' | 'interview' | 'offer' | 'hired' | 'rejected'

export interface PipelineCandidate {
  id: string
  name: string
  initials: string
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
