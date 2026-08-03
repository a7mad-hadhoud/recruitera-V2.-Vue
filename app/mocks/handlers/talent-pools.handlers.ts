import { http, HttpResponse } from 'msw'
import type { PoolCandidate, TalentPool } from '~/types'

/**
 * Seed data ported from the `Recruitera Talent Pools.html` prototype.
 *
 * Two deliberate changes from that file:
 *  - Assigned members are the app's real team ids (see team.handlers.ts) instead of the
 *    prototype's invented roster, so there is one source of truth for people.
 *  - Candidates are a flat list keyed by `poolId` rather than a pool-id -> array map,
 *    which keeps filtering and moving candidates between pools straightforward.
 *
 * The General Application pool is system-generated. In the prototype it only appeared once a
 * toggle in Settings > Career Site had been switched on, bridged between standalone pages through
 * localStorage. `settings/career-site.vue` is still a stub here, so the pool ships as always
 * present and flagged `system: true`; gate it on that setting once the page exists.
 */

const pools: TalentPool[] = [
  {
    id: 'p1',
    name: 'General Application',
    description: 'Spontaneous applicants who applied without a specific job. Auto-collected from the career site.',
    category: 'general',
    system: true,
    total: 3,
    created: '2026-03-01',
    members: ['1'],
    archived: false,
    pinned: true,
  },
  {
    id: 'p2',
    name: 'Frontend Talent',
    description: 'Strong frontend engineers kept warm for the next React opening.',
    category: 'department',
    department: 'Engineering',
    total: 2,
    created: '2026-04-12',
    members: ['1', '2'],
    archived: false,
    pinned: true,
  },
  {
    id: 'p3',
    name: 'Leadership Pipeline',
    description: 'Senior & leadership-track candidates for succession planning.',
    category: 'department',
    department: 'Operations',
    total: 3,
    created: '2026-03-18',
    members: ['1', '4'],
    archived: false,
    pinned: true,
  },
  {
    id: 'p4',
    name: 'Cairo Tech Fair 2026',
    description: 'On-site applicants collected at the Cairo Tech Fair booth.',
    category: 'event',
    event: 'Cairo Tech Fair 2026',
    total: 2,
    created: '2026-05-28',
    members: ['2'],
    archived: false,
    pinned: false,
    formStatus: 'live',
  },
  {
    id: 'p5',
    name: 'Data & ML',
    description: 'Data science and machine learning specialists for future openings.',
    category: 'department',
    department: 'Engineering',
    total: 2,
    created: '2026-05-06',
    members: ['1', '3'],
    archived: false,
    pinned: false,
  },
  {
    id: 'p6',
    name: 'Design Bench',
    description: 'Product & visual designers we want to re-engage for upcoming roles.',
    category: 'department',
    department: 'Product',
    total: 1,
    created: '2026-05-14',
    members: ['4'],
    archived: false,
    pinned: false,
  },
  {
    id: 'p7',
    name: 'Campus Drive — Cairo University',
    description: 'Fresh graduate applicants collected during the campus recruiting drive.',
    category: 'event',
    event: 'Campus Drive — Cairo University',
    total: 0,
    created: '2026-02-20',
    members: ['3'],
    archived: true,
    pinned: false,
    formStatus: 'draft',
  },
]

const candidates: PoolCandidate[] = [
  { id: 'c11', poolId: 'p1', name: 'James Miller', stage: 'Applied', appliedVia: 'General Application', jobTitle: 'Developer', email: 'james.miller@example.com', phone: '+20 100 222 3344', location: 'Remote', aiScore: null, evalScore: null, tags: [], date: '2026-06-10' },
  { id: 'c12', poolId: 'p1', name: 'Sara Ahmed', stage: 'New', appliedVia: 'General Application', jobTitle: 'Developer', email: 'sara.ahmed@example.com', phone: '+20 101 333 4455', location: 'Cairo, EG', aiScore: null, evalScore: null, tags: ['New'], date: '2026-06-12' },
  { id: 'c13', poolId: 'p1', name: 'Fatima Cherif', stage: 'New', appliedVia: 'General Application', jobTitle: 'Data Scientist', email: 'fatima.cherif@example.com', phone: null, location: '6th of October, EG', aiScore: null, evalScore: null, tags: ['New'], date: '2026-06-10' },

  { id: 'c1', poolId: 'p2', name: 'Tomas Novak', stage: 'Applied', appliedVia: 'Referral', jobTitle: 'Senior Frontend Engineer', email: 'tomas.novak@example.com', phone: '+20 102 444 5566', location: 'Remote', aiScore: 88, evalScore: 91, tags: ['Referral', 'Strong portfolio'], date: '2026-05-20' },
  { id: 'c2', poolId: 'p2', name: 'Yuki Wang', stage: 'Screened', appliedVia: 'Career Site', jobTitle: 'Senior Frontend Engineer', email: 'yuki.wang@example.com', phone: '+20 103 555 6677', location: 'Cairo, EG', aiScore: 74, evalScore: null, tags: ['Passive'], date: '2026-06-14' },

  { id: 'c3', poolId: 'p3', name: 'Mei Lin', stage: 'Offer', appliedVia: 'Career Site', jobTitle: 'Backend Engineer', email: 'mei.lin@example.com', phone: '+20 104 666 7788', location: 'Cairo, EG', aiScore: 95, evalScore: 91, tags: ['Top performer'], date: '2026-05-28' },
  { id: 'c4', poolId: 'p3', name: 'Sofia Rossi', stage: 'Screened', appliedVia: 'LinkedIn', jobTitle: 'Product Manager', email: 'sofia.rossi@example.com', phone: null, location: 'Remote', aiScore: 68, evalScore: null, tags: [], date: '2026-06-04' },
  { id: 'c5', poolId: 'p3', name: 'Kwame Mensah', stage: 'Applied', appliedVia: 'Referral', jobTitle: 'Backend Engineer', email: 'kwame.mensah@example.com', phone: '+20 105 777 8899', location: '6th of October, EG', aiScore: 48, evalScore: null, tags: ['Deprioritized'], date: '2026-06-07' },

  { id: 'c6', poolId: 'p4', name: 'Nour El-Sayed', stage: 'New', appliedVia: 'Event Form', jobTitle: 'Product Designer', email: 'nour.elsayed@example.com', phone: '+20 106 888 9900', location: 'Cairo, EG', aiScore: null, evalScore: null, tags: ['Event: Cairo Tech Fair'], date: '2026-05-28' },
  { id: 'c7', poolId: 'p4', name: 'Omar Fathy', stage: 'New', appliedVia: 'Event Form', jobTitle: null, email: 'omar.fathy@example.com', phone: null, location: 'Cairo, EG', aiScore: null, evalScore: null, tags: ['Event: Cairo Tech Fair'], date: '2026-05-29' },

  { id: 'c8', poolId: 'p5', name: 'Priya Nair', stage: 'Interview', appliedVia: 'Career Site', jobTitle: 'Data Scientist', email: 'priya.nair@example.com', phone: '+20 107 999 0011', location: 'Remote', aiScore: 82, evalScore: 85, tags: [], date: '2026-06-02' },
  { id: 'c9', poolId: 'p5', name: 'Bruno Torres', stage: 'Applied', appliedVia: 'Career Site', jobTitle: 'Data Scientist', email: 'bruno.torres@example.com', phone: null, location: '6th of October, EG', aiScore: 63, evalScore: null, tags: ['Passive'], date: '2026-06-13' },

  { id: 'c10', poolId: 'p6', name: 'Liam Walsh', stage: 'Reference check', appliedVia: 'Referral', jobTitle: 'Product Designer', email: 'liam.walsh@example.com', phone: '+20 108 111 2233', location: 'Remote', aiScore: 87, evalScore: 90, tags: ['Top performer'], date: '2026-05-26' },
]

export const talentPoolsHandlers = [
  http.get('/api/talent-pools', () => {
    return HttpResponse.json({ pools, candidates })
  }),
]
