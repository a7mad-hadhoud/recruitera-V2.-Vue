export type JobStatus = 'published' | 'internal' | 'closed' | 'archived'

export interface Job {
  id: string
  title: string
  status: JobStatus
  location: string | null
  department: string | null
  candidateCount: number
}
