export interface JobTitle {
  id: string
  title: string
  department: string
  jobCount: number
}

export interface JobTitlesResponse {
  data: JobTitle[]
  total: number
}
