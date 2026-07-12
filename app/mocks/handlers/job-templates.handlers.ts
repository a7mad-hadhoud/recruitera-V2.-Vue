import { http, HttpResponse } from 'msw'
import type { JobTemplate } from '~/types'

const jobTemplates: JobTemplate[] = [
  { id: '1', name: 'Senior Marketer', jobName: 'Senior Marketer (Sample)', jobCount: 3, locations: ['On-site'], department: 'Marketing' },
  { id: '2', name: 'Recruiter', jobName: 'Recruiter (Sample)', jobCount: 1, locations: ['On-site', 'Remote'], department: 'Human Resources' },
  { id: '3', name: 'Marketer', jobName: 'Marketer (Sample)', jobCount: 5, locations: ['On-site'], department: 'Marketing' },
]

export const jobTemplatesHandlers = [
  http.get('/api/templates/job-templates', () => {
    return HttpResponse.json({ data: jobTemplates, total: jobTemplates.length })
  }),
]
