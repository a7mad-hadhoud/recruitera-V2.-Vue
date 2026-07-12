export type WorkLocationType = 'On-site' | 'Remote' | 'Hybrid'

export interface JobTemplate {
  id: string
  name: string
  jobName: string
  jobCount: number
  locations: WorkLocationType[]
  department: string
}

export interface JobTemplatesResponse {
  data: JobTemplate[]
  total: number
}
