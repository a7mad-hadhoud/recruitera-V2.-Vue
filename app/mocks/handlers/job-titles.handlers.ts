import { http, HttpResponse } from 'msw'
import type { JobTitle } from '~/types'

const jobTitles: JobTitle[] = [
  { id: '1', title: 'Software Engineer', department: 'Engineering', jobCount: 5 },
  { id: '2', title: 'Product Designer', department: 'Product', jobCount: 2 },
  { id: '3', title: 'Sales Manager', department: 'Sales', jobCount: 3 },
  { id: '4', title: 'HR Business Partner', department: 'Human Resources', jobCount: 1 },
]

export const jobTitlesHandlers = [
  http.get('/api/job-titles', () => {
    return HttpResponse.json({ data: jobTitles, total: jobTitles.length })
  }),
]
