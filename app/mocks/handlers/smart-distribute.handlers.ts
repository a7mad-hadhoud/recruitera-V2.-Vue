import { http, HttpResponse, delay } from 'msw'
import type { SmartDistributeCandidate, SmartDistributeConfig } from '~/types'
import { ALL_CANDIDATES } from './candidates.handlers'

const DEV_LATENCY_MS = 350

// Demo config, keyed by teamMemberId (matches team.handlers.ts's fixture
// roster: '1' Mohamed Salem, '2' Sara Rashed, '3' Ahmed Kamal, '4' Lina
// Waheed). jobs/new.vue doesn't carry a real job id yet, so every request
// is scoped to a single demo job — same fixture-stage approach the rest of
// the Team tab already uses ("wire to job.assignedMemberIds when the API
// endpoint lands").
const configsByJob = new Map<string, SmartDistributeConfig>()

function defaultConfig(jobId: string): SmartDistributeConfig {
  return {
    jobId,
    enabled: true,
    mode: 'random',
    unclaimedAlertHours: 48,
    recruiters: [
      { teamMemberId: '1', capacity: 12, unlimited: false, assigned: 8, priority: 1 },
      { teamMemberId: '2', capacity: 10, unlimited: false, assigned: 6, priority: 2 },
      { teamMemberId: '3', capacity: null, unlimited: true, assigned: 4, priority: 3 },
      { teamMemberId: '4', capacity: 8, unlimited: false, assigned: 3, priority: 4 },
    ],
  }
}

function configFor(jobId: string): SmartDistributeConfig {
  let cfg = configsByJob.get(jobId)
  if (!cfg) {
    cfg = defaultConfig(jobId)
    configsByJob.set(jobId, cfg)
  }
  return cfg
}

// Deterministic recruiter -> candidate bucket, built once from the shared
// candidate roster (CLAUDE.md: build on ALL_CANDIDATES, don't invent a
// parallel dataset). Assigned counts above intentionally match each
// bucket's length so "N assigned" always agrees with what the View modal
// shows.
const RECRUITER_ORDER = ['1', '2', '3', '4']
const STAGES = ['Applied', 'Screened', 'Interview', 'Offer']
const candidateBuckets = new Map<string, SmartDistributeCandidate[]>()
;(function seedBuckets() {
  const pool = ALL_CANDIDATES.filter(c => c.status !== 'disqualified')
  let cursor = 0
  const counts: Record<string, number> = { 1: 8, 2: 6, 3: 4, 4: 3 }
  for (const teamMemberId of RECRUITER_ORDER) {
    const n = counts[teamMemberId] ?? 0
    const slice = pool.slice(cursor, cursor + n)
    cursor += n
    candidateBuckets.set(teamMemberId, slice.map((c, i) => ({
      id: c.id,
      name: c.name,
      initials: c.initials,
      avatarColor: c.avatarColor,
      stage: STAGES[i % STAGES.length]!,
      source: c.sources[0] ?? 'Careers site',
      evaluationScore: c.evaluationScore ?? null,
    })))
  }
})()

export const smartDistributeHandlers = [
  http.get('/api/jobs/:jobId/smart-distribute', async ({ params }) => {
    await delay(DEV_LATENCY_MS)
    return HttpResponse.json(configFor(String(params.jobId)))
  }),

  http.get('/api/jobs/:jobId/smart-distribute/candidates', async ({ request }) => {
    await delay(DEV_LATENCY_MS)
    const url = new URL(request.url)
    const recruiterId = url.searchParams.get('recruiterId') ?? ''
    const data = candidateBuckets.get(recruiterId) ?? []
    return HttpResponse.json({ data, total: data.length })
  }),
]
