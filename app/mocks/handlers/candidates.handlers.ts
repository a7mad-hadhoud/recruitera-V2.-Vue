import { http, HttpResponse, delay } from 'msw'
import type { Candidate } from '~/types'

// Simulates realistic API latency in dev so skeletons + loading states are
// visible to design/QA. Real API responses (150-500ms) replace this in prod.
const DEV_LATENCY_MS = 350

/**
 * The exact 17 sample candidates from the design spec. Field shape mirrors
 * a future API response — jobs/sources/tags/talentPools are arrays because
 * the design shows them stacked.
 */
const ALL_CANDIDATES: Candidate[] = [
  { id: '1',  name: 'dasdasdasdasd',            initials: 'D',  avatarColor: '#1F2937', isNew: true,  status: 'new',          jobs: [],                                                                                                    sources: [],              tags: [],                            talentPools: [],                            disqualifiedBy: null,               dateCreated: 'an hour ago' },
  { id: '2',  name: 'asdsd',                    initials: 'A',  avatarColor: '#374151', isNew: true,  status: 'new',          jobs: [],                                                                                                    sources: [],              tags: [],                            talentPools: [],                            disqualifiedBy: null,               dateCreated: 'an hour ago' },
  { id: '3',  name: 'dasda',                    initials: 'D',  avatarColor: '#4B5563', isNew: true,  status: 'new',          jobs: [],                                                                                                    sources: [],              tags: [],                            talentPools: [],                            disqualifiedBy: null,               dateCreated: 'an hour ago' },
  { id: '4',  name: 'Kendall McClure (Sample)', initials: 'KM', avatarColor: '#1F2937', isNew: false, status: 'not_contacted', jobs: [],                                                                                                    sources: ['Indeed'],       tags: ['Sample', 'Junior'],           talentPools: ['Next recruitment - Q3 (Sample)'], disqualifiedBy: null,       dateCreated: 'a month ago' },
  { id: '5',  name: 'Mikel Lang (Sample)',      initials: 'ML', avatarColor: '#374151', isNew: false, status: 'not_contacted', jobs: [{ title: 'Recruiter (Sample)', status: 'internal' }],                                                  sources: ['LinkedIn'],     tags: ['Sample', 'Mid-level'],        talentPools: [],                            disqualifiedBy: null,               dateCreated: 'a month ago' },
  { id: '6',  name: 'John Smith (Sample)',      initials: 'JS', avatarColor: '#4B5563', isNew: false, status: 'not_contacted', jobs: [{ title: 'Senior Marketer (Sample)', status: 'published' }],                                           sources: ['Referral'],     tags: ['Sample', 'Mid-level'],        talentPools: [],                            disqualifiedBy: null,               dateCreated: 'a month ago' },
  { id: '7',  name: 'Zachery Bahringer (Sample)', initials: 'ZB', avatarColor: '#1F2937', isNew: false, status: 'not_contacted', jobs: [],                                                                                                  sources: ['Indeed'],       tags: ['Sample', 'Junior'],           talentPools: ['Rising stars (Sample)'],     disqualifiedBy: null,               dateCreated: 'a month ago' },
  { id: '8',  name: 'Wilma Roelendsen (Sample)', initials: 'WR', avatarColor: '#374151', isNew: false, status: 'not_contacted', jobs: [{ title: 'Recruiter (Sample)', status: 'internal' }, { title: 'Senior Marketer (Sample)', status: 'published' }], sources: ['Indeed'],       tags: ['Sample', 'Mid-level'],        talentPools: [],                            disqualifiedBy: null,               dateCreated: 'a month ago' },
  { id: '9',  name: 'Serena Uppin (Sample)',    initials: 'SU', avatarColor: '#4B5563', isNew: false, status: 'not_contacted', jobs: [{ title: 'Senior Marketer (Sample)', status: 'published' }, { title: 'Recruiter (Sample)', status: 'internal' }], sources: ['Careers site'], tags: ['Sample', 'Senior'],           talentPools: [],                            disqualifiedBy: null,               dateCreated: 'a month ago' },
  { id: '10', name: 'Brooke Strosin (Sample)',  initials: 'BS', avatarColor: '#1F2937', isNew: false, status: 'not_contacted', jobs: [],                                                                                                    sources: ['Resume sent'],  tags: ['Sample'],                     talentPools: ['Next recruitment - Q3 (Sample)'], disqualifiedBy: null,       dateCreated: 'a month ago' },
  { id: '11', name: 'Kevin Hernandez (Sample)', initials: 'KH', avatarColor: '#374151', isNew: false, status: 'not_contacted', jobs: [{ title: 'Senior Marketer (Sample)', status: 'published' }],                                           sources: ['Resume sent'],  tags: ['Sample', 'Senior'],           talentPools: [],                            disqualifiedBy: null,               dateCreated: 'a month ago' },
  { id: '12', name: 'Mariela Vasquez (Sample)', initials: 'MV', avatarColor: '#4B5563', isNew: false, status: 'not_contacted', jobs: [{ title: 'Senior Marketer (Sample)', status: 'published' }],                                           sources: ['Careers site'], tags: ['Sample', 'Senior'],           talentPools: [],                            disqualifiedBy: null,               dateCreated: 'a month ago' },
  { id: '13', name: 'Anna Jansen (Sample)',     initials: 'AJ', avatarColor: '#1F2937', isNew: false, status: 'disqualified',  jobs: [{ title: 'Marketer (Sample)', status: 'archived' }, { title: 'Senior Marketer (Sample)', status: 'published' }],   sources: ['Indeed'],       tags: ['Sample', 'Junior'],           talentPools: ['Rising stars (Sample)'],     disqualifiedBy: 'Knockout question', dateCreated: 'a month ago' },
  { id: '14', name: 'Max Mustermann (Sample)',  initials: 'MM', avatarColor: '#374151', isNew: false, status: 'not_contacted', jobs: [{ title: 'Recruiter (Sample)', status: 'internal' }],                                                  sources: ['Indeed'],       tags: ['Sample', 'Mid-level'],        talentPools: [],                            disqualifiedBy: null,               dateCreated: 'a month ago' },
  { id: '15', name: 'Conor Moreno (Sample)',    initials: 'CM', avatarColor: '#4B5563', isNew: false, status: 'not_contacted', jobs: [{ title: 'Recruiter (Sample)', status: 'internal' }],                                                  sources: ['Facebook'],     tags: ['Sample', 'Junior'],           talentPools: [],                            disqualifiedBy: null,               dateCreated: 'a month ago' },
  { id: '16', name: 'Scot Highlinder (Sample)', initials: 'SH', avatarColor: '#1F2937', isNew: false, status: 'not_contacted', jobs: [{ title: 'Senior Marketer (Sample)', status: 'published' }],                                           sources: ['LinkedIn'],     tags: ['Sample', 'Senior'],           talentPools: [],                            disqualifiedBy: null,               dateCreated: '2 months ago' },
  { id: '17', name: 'John Doe (Sample)',        initials: 'JD', avatarColor: '#374151', isNew: true,  status: 'new',           jobs: [{ title: 'Senior Marketer (Sample)', status: 'published' }],                                           sources: ['Indeed'],       tags: ['Sample', 'Senior'],           talentPools: [],                            disqualifiedBy: null,               dateCreated: '2 months ago' },
]

export const candidatesHandlers = [
  http.get('/api/candidates', async ({ request }) => {
    await delay(DEV_LATENCY_MS)
    const url = new URL(request.url)
    const status  = url.searchParams.get('status')
    const search  = url.searchParams.get('search')?.toLowerCase()
    const job     = url.searchParams.get('job')?.toLowerCase()
    const page    = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const perPage = Math.max(1, Number(url.searchParams.get('perPage') ?? 30))

    let result = [...ALL_CANDIDATES]
    if (status) result = result.filter(c => c.status === status)
    if (search) result = result.filter(c =>
      c.name.toLowerCase().includes(search)
      || c.jobs.some(j => j.title.toLowerCase().includes(search)),
    )
    if (job) result = result.filter(c => c.jobs.some(j => j.title.toLowerCase().includes(job)))

    const total = result.length
    const start = (page - 1) * perPage
    const paginated = result.slice(start, start + perPage)

    return HttpResponse.json({
      data: paginated,
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    })
  }),

  http.get('/api/candidates/filters/counts', () => {
    return HttpResponse.json({
      recentlyDeleted: 0,
      qualifiedCandidates: ALL_CANDIDATES.filter(c => c.status === 'qualified').length,
      newCandidates:       ALL_CANDIDATES.filter(c => c.status === 'new').length,
      notContacted:        ALL_CANDIDATES.filter(c => c.status === 'not_contacted').length,
      followedCandidates:  ALL_CANDIDATES.filter(c => c.status === 'followed').length,
    })
  }),

  http.get('/api/candidates/:id', ({ params }) => {
    const candidate = ALL_CANDIDATES.find(c => c.id === params.id)
    if (!candidate) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(candidate)
  }),
]
