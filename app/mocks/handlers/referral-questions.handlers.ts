import { http, HttpResponse } from 'msw'
import type { ReferralTemplate } from '~/types'

const referralTemplates: ReferralTemplate[] = [
  {
    id: '1',
    name: 'Default',
    category: 'Screening',
    isDefault: true,
    questions: [
      {
        id: 'q1',
        type: 'Single choice',
        q: 'How do you know each other?',
        required: false,
        options: ['We worked together directly', 'We worked together indirectly', 'Other'],
        visibility: 'Visible to everyone',
      },
      {
        id: 'q2',
        type: 'Text (multiple lines)',
        q: 'Why are you referring them?',
        required: false,
        visibility: 'Visible to everyone',
      },
    ],
  },
]

export const referralQuestionsHandlers = [
  http.get('/api/templates/referral-questions', () => {
    return HttpResponse.json({ data: referralTemplates, total: referralTemplates.length })
  }),
]
