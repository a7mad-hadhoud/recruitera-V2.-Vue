import { http, HttpResponse } from 'msw'
import type { PublicLink } from '~/types'

const publicLinks: PublicLink[] = [
  {
    id: 'pl-1',
    name: 'No candidates shared',
    candidates: [],
    expiresOn: '2026-08-09',
    guestReviews: 0,
    guestTeamNotes: 0,
    showInfo: ['contact', 'profile', 'cv'],
    allow: ['notes'],
  },
]

export const publicLinksHandlers = [
  http.get('/api/public-links', () => {
    return HttpResponse.json({ data: publicLinks, total: publicLinks.length })
  }),
]
