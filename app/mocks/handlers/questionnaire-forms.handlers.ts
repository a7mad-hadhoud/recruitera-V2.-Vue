import { http, HttpResponse } from 'msw'
import type { QuestionnaireForm } from '~/types'

const questionnaireForms: QuestionnaireForm[] = [
  {
    id: '1',
    name: 'Essential template',
    category: 'Screening',
    questions: [
      { id: 'q1', type: 'Video answer', q: 'What are the top three things most important to you in a job?', hint: '', required: true, timeLimit: '2 min' },
      { id: 'q2', type: 'Text (multiple lines)', q: 'How would you describe [topic] in one sentence?', hint: '', required: true },
      { id: 'q3', type: 'Text (multiple lines)', q: 'What are your salary expectations?', hint: '', required: false },
      { id: 'q4', type: 'Text (multiple lines)', q: 'Do you need a VISA to work in [country name]?', hint: '', required: false },
      { id: 'q5', type: 'Rating scale', q: '', hint: '', required: true, scale: '1-5' },
      { id: 'q6', type: 'Date', q: '', hint: '', required: true },
    ],
  },
  {
    id: '2',
    name: 'General screening',
    category: 'General',
    questions: [
      { id: 'q1', type: 'Text (multiple lines)', q: 'Tell us about yourself.', hint: '', required: true },
    ],
  },
]

export const questionnaireFormsHandlers = [
  http.get('/api/templates/questionnaire-forms', () => {
    return HttpResponse.json({ data: questionnaireForms, total: questionnaireForms.length })
  }),
]
