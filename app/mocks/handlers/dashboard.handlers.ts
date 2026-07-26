import { http, HttpResponse } from 'msw'
import type {
  DashboardRecent, DashboardNewCandidate, DashboardAppliedStats, DashboardEvaluation,
  DashboardTask, DashboardNoteGroup, DashboardActivityGroup,
} from '~/types'

// All colors are brand tokens (var(--brand-*)) — never hardcoded hex — so the
// dashboard themes with the rest of the system.

const recents: DashboardRecent[] = [
  { id: 'r1', kind: 'candidate', title: 'dasddsd', sub: 'Amerewr (2)', initial: 'D', bg: 'var(--brand-avatar-4)' },
  { id: 'r2', kind: 'job', title: 'Amerewr (2)', sub: '1 candidate' },
]

const newCandidates: DashboardNewCandidate[] = [
  { id: 'nc1', name: 'Sara Nabil', initial: 'S', bg: 'var(--brand-avatar-5)', when: '6 days ago' },
]

const appliedStats: DashboardAppliedStats = {
  cards: [
    { key: 'careers', label: 'Applied via careers site', value: 0 },
    { key: 'email', label: 'Applied via email', value: 0 },
    { key: 'manual', label: 'Added manually', value: 2 },
    { key: 'sourced', label: 'Sourced', value: 0 },
    { key: 'referred', label: 'Referred', value: 0 },
  ],
  series: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
}

const evaluations: DashboardEvaluation[] = [
  {
    id: 'e1', status: 'completed',
    candidate: { name: 'dasddsd', initial: 'D', bg: 'var(--brand-avatar-4)' },
    job: 'Amerewr (2)', verdict: 'Not sure', stage: 'Applied',
    evaluator: { name: 'Amr Hammad', initials: 'AH', bg: 'var(--brand-avatar-4)' },
    template: 'Front End Developer template', when: 'just now', summary: 'njnnik',
    answers: [
      { q: 'How do you know when to solve a problem on your own or to ask for help?', a: 'df' },
      { q: 'Describe a situation where you faced serious challenges in doing your job efficiently. What were the challenges, and how did you overcome them?', a: 'ads' },
      { q: 'Tell me about a team project when you had to work with someone difficult.', a: 'Handled it calmly and kept the project on track.' },
    ],
  },
]

const tasks: DashboardTask[] = []

const noteGroups: DashboardNoteGroup[] = [
  {
    date: '26 July 2026', about: 'dasddsd',
    notes: [{ author: 'Amr Hammad', initials: 'AH', bg: 'var(--brand-avatar-4)', mention: '@Amr Hammad', body: 'asdsds', ago: '1s' }],
  },
]

const activityGroups: DashboardActivityGroup[] = [
  {
    date: '23 July 2026',
    events: [
      { text: 'enabled the Screening Assistant.', bold: 'Amr Hammad', icon: 'screen', ago: '3d' },
      { text: 'disabled the Screening Assistant.', bold: 'Amr Hammad', icon: 'screen', ago: '3d' },
      { text: 'enabled the Screening Assistant.', bold: 'Amr Hammad', icon: 'screen', ago: '3d' },
      { text: 'added follower(s) to the job ', bold: 'Amr Hammad', tail: 'sdas: Amr Hammad.', icon: 'bookmark', ago: '3d' },
      { text: 'added a new job ', bold: 'Amr Hammad', tail: 'sdas.', icon: 'job', ago: '3d' },
    ],
  },
  {
    date: '22 July 2026',
    events: [
      { text: 'added a new job ', bold: 'Amr Hammad', tail: 'Amerewr (3).', icon: 'job', ago: '5d' },
      { text: 'added follower(s) to the job ', bold: 'Amr Hammad', tail: 'dfv: Amr Hammad.', icon: 'bookmark', ago: '5d' },
      { text: 'added a new job ', bold: 'Amr Hammad', tail: 'dfv.', icon: 'job', ago: '5d' },
    ],
  },
]

export const dashboardHandlers = [
  http.get('/api/dashboard/recents', () => HttpResponse.json({ data: recents })),
  http.get('/api/dashboard/new-candidates', () => HttpResponse.json({ data: newCandidates })),
  http.get('/api/dashboard/applied-stats', () => HttpResponse.json(appliedStats)),
  http.get('/api/dashboard/evaluations', () => HttpResponse.json({ data: evaluations })),
  http.get('/api/dashboard/tasks', () => HttpResponse.json({ data: tasks })),
  http.get('/api/dashboard/notes', () => HttpResponse.json({ data: noteGroups })),
  http.get('/api/dashboard/activity', () => HttpResponse.json({ data: activityGroups })),
]
