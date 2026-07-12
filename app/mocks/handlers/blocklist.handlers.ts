import { http, HttpResponse } from 'msw'
import type { BlocklistEntry } from '~/types'

const blocklist: BlocklistEntry[] = [
  { id: '1', name: 'Ahmed Karim', email: 'ahmed.karim@example.com', nationalId: '29501234567890', reason: 'Misconduct during interview', blockedOn: '12 Jan 2025' },
  { id: '2', name: 'Sara Nasser', email: 'sara.nasser@example.com', nationalId: null, reason: 'Fraudulent documents', blockedOn: '3 Mar 2025' },
  { id: '3', name: 'Mohamed Hassan', email: 'mohamed.hassan@example.com', nationalId: '30012345678901', reason: 'No-show, repeated', blockedOn: '18 May 2025' },
]

export const blocklistHandlers = [
  http.get('/api/blocklist', () => {
    return HttpResponse.json({ data: blocklist, total: blocklist.length })
  }),
]
