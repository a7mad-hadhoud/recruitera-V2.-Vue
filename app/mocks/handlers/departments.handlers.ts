import { http, HttpResponse } from 'msw'
import type { Department } from '~/types'

const departments: Department[] = [
  { id: '1', name: 'Engineering',      subDepartments: ['Frontend', 'Backend', 'DevOps'],        jobCount: 8 },
  { id: '2', name: 'Product',          subDepartments: ['Design', 'Research'],                   jobCount: 3 },
  { id: '3', name: 'Sales',            subDepartments: [],                                       jobCount: 5 },
  { id: '4', name: 'Human Resources',  subDepartments: ['Talent Acquisition', 'L&D'],             jobCount: 2 },
]

export const departmentsHandlers = [
  http.get('/api/departments', () => {
    return HttpResponse.json({ data: departments, total: departments.length })
  }),
]
