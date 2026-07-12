import { http, HttpResponse } from 'msw'
import type { Location } from '~/types'

const locations: Location[] = [
  { id: '1', name: 'Cairo HQ',     country: 'Egypt',     city: 'Cairo',     jobCount: 3 },
  { id: '2', name: 'Dubai Office', country: 'UAE',       city: 'Dubai',     jobCount: 1 },
  { id: '3', name: 'Remote',       country: 'Worldwide', city: 'Worldwide', jobCount: 5 },
]

export const locationsHandlers = [
  http.get('/api/locations', () => {
    return HttpResponse.json({ data: locations, total: locations.length })
  }),
]
