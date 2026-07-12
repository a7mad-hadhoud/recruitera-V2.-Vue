import { http, HttpResponse } from 'msw'
import type { TagsByCategory } from '~/types'

const tags: TagsByCategory = {
  candidates: [
    { id: 'c-1', name: 'Sample', count1: 14 },
    { id: 'c-2', name: 'Senior', count1: 5 },
    { id: 'c-3', name: 'Junior', count1: 4 },
    { id: 'c-4', name: 'Mid-level', count1: 4 },
    { id: 'c-5', name: 'Hired', count1: 0 },
  ],
  jobs: [
    { id: 'j-1', name: 'Sample', count1: 3, count2: 3 },
    { id: 'j-2', name: 'Mid-level', count1: 2, count2: 2 },
    { id: 'j-3', name: 'Remote', count1: 2, count2: 2 },
    { id: 'j-4', name: 'Senior', count1: 1, count2: 1 },
    { id: 'j-5', name: 'Junior', count1: 0, count2: 0 },
  ],
  sources: [
    { id: 's-1', name: 'Indeed', count1: 6 },
    { id: 's-2', name: 'Careers site', count1: 2 },
    { id: 's-3', name: 'Resume sent', count1: 2 },
    { id: 's-4', name: 'LinkedIn', count1: 2 },
    { id: 's-5', name: 'Referral', count1: 1 },
    { id: 's-6', name: 'Facebook', count1: 1 },
    { id: 's-7', name: 'Matched', count1: 0 },
  ],
}

export const tagsHandlers = [
  http.get('/api/tags', () => {
    return HttpResponse.json(tags)
  }),
]
