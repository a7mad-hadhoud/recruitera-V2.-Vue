import { http, HttpResponse } from 'msw'
import type { ApplicationForm } from '~/types'

const applicationForms: ApplicationForm[] = [
  {
    id: '1',
    name: 'Standard Application Form',
    category: 'General',
    isDefault: true,
    questions: [
      { id: 'q1', q: 'Years of experience?', type: 'Text (single line)', required: true },
      { id: 'q2', q: 'Why do you want to join us?', type: 'Text (multiple lines)', required: false },
      { id: 'q3', q: 'Expected salary range?', type: 'Salary', required: true, currency: 'USD' },
    ],
  },
  { id: '2', name: 'Junior Roles Form', category: 'General', isDefault: false, questions: [] },
  { id: '3', name: 'Backend Engineer Application', category: 'Engineering', isDefault: false, questions: [] },
  { id: '4', name: 'Frontend Engineer Application', category: 'Engineering', isDefault: false, questions: [] },
  { id: '5', name: 'Sales Representative Form', category: 'Sales', isDefault: false, questions: [] },
]

export const applicationFormsHandlers = [
  http.get('/api/templates/application-forms', () => {
    return HttpResponse.json({ data: applicationForms, total: applicationForms.length })
  }),
]
