export interface Department {
  id: string
  name: string
  subDepartments: string[]
  jobCount: number
}

export interface DepartmentsResponse {
  data: Department[]
  total: number
}
