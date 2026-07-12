import { http, HttpResponse } from 'msw'
import type { WhatsAppTemplate } from '~/types'

const whatsappTemplates: WhatsAppTemplate[] = [
  {
    id: '1',
    name: 'Interview invitation',
    language: 'English (en)',
    category: 'Utility',
    type: 'event',
    status: 'Approved',
    body: 'Hi {{candidate_name}},\n\nWe would like to invite you to interview for the {{job_title}} role at {{company_name}} on {{event_date}}.',
  },
  {
    id: '2',
    name: 'Self-scheduling link',
    language: 'Arabic (ar)',
    category: 'Marketing',
    type: 'message',
    status: 'Pending',
    body: 'Hi {{candidate_name}}, please pick a slot: {{scheduling_link}}',
  },
  {
    id: '3',
    name: 'Rejection template',
    language: 'English (en_US)',
    category: 'Utility',
    type: 'message',
    status: 'Draft',
    body: 'Hi {{candidate_name}},\n\nThank you for your interest in {{company_name}}. After careful consideration, we\'ve decided to move forward with other candidates.',
  },
]

export const whatsappTemplatesHandlers = [
  http.get('/api/templates/whatsapp', () => {
    return HttpResponse.json({ data: whatsappTemplates, total: whatsappTemplates.length })
  }),
]
