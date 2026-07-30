export type JobStatus = 'published' | 'internal' | 'closed' | 'archived' | 'draft'
export type CollarType = 'white' | 'blue'
export type WorkModel = 'on-site' | 'remote' | 'hybrid'

export interface JobAssignee {
  name: string
  initials: string
  bg: string
  color: string
}

export interface Job {
  id: string
  title: string
  status: JobStatus
  location: string | null
  department: string | null
  workModel: WorkModel
  collar: CollarType
  candidateCount: number
  newCandidates: number
  hires: number
  createdAt: string
  assignees: JobAssignee[]
}
