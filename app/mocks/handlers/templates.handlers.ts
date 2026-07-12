import { http, HttpResponse } from 'msw'
import type { EmailTemplate } from '~/types'

const emailTemplates: EmailTemplate[] = [
  { id: '1',  name: 'Auto-confirmation (Default)', category: 'auto-confirmation', subject: "We've received your application", body: 'Hi {{candidate_name}},\n\nThanks for applying to {{job_title}}. We will review your application and get back to you shortly.\n\n— The {{company_name}} team', isDefault: true },
  { id: '2',  name: 'Event invitation',            category: 'event-invitation',  subject: 'You are invited: {{event_title}}',   body: 'Hi {{candidate_name}},\n\nWe would love to have you at {{event_title}} on {{event_date}}.',                                                                                            isDefault: false },
  { id: '3',  name: 'Event invitation (2)',        category: 'event-invitation',  subject: 'Save the date: {{event_title}}',     body: 'Hi {{candidate_name}},\n\nA quick note about our upcoming event.',                                                                                                                     isDefault: false },
  { id: '4',  name: 'Invitation — Phone Interview', category: 'general',           subject: 'Phone interview with {{company_name}}', body: 'Hi {{candidate_name}},\n\nWe would like to schedule a phone interview for the {{job_title}} role.',                                                                                    isDefault: false },
  { id: '5',  name: 'Invitation to interview',     category: 'general',           subject: 'Interview invitation — {{job_title}}', body: 'Hi {{candidate_name}},\n\nWe are excited to invite you to interview for the {{job_title}} role.',                                                                                     isDefault: false },
  { id: '6',  name: 'Candidate rejection',         category: 'general',           subject: 'Update on your application',           body: 'Hi {{candidate_name}},\n\nThank you for your interest in {{company_name}}. After careful consideration, we have decided to move forward with other candidates.',                          isDefault: false },
  { id: '7',  name: 'Application acknowledgement', category: 'general',           subject: 'Thanks for applying to {{job_title}}', body: 'Hi {{candidate_name}},\n\nWe have received your application and will review it soon.',                                                                                                isDefault: false },
  { id: '8',  name: 'Keeping candidates warm',     category: 'general',           subject: 'Still thinking about you',             body: 'Hi {{candidate_name}},\n\nJust checking in — we have not forgotten about you.',                                                                                                          isDefault: false },
  { id: '9',  name: 'GDPR Historic Data retention', category: 'general',           subject: 'Your data at {{company_name}}',        body: 'Hi {{candidate_name}},\n\nPer GDPR, we are contacting you about the personal data we hold.',                                                                                            isDefault: false },
  { id: '10', name: 'Referral outreach',           category: 'general',           subject: '{{referrer_name}} thought of you',      body: 'Hi {{candidate_name}},\n\n{{referrer_name}} suggested we reach out about an opportunity at {{company_name}}.',                                                                         isDefault: false },
]

export const templatesHandlers = [
  http.get('/api/templates/email', () => {
    return HttpResponse.json({ data: emailTemplates, total: emailTemplates.length })
  }),
  http.get('/api/templates/email/:id', ({ params }) => {
    const t = emailTemplates.find(t => t.id === params.id)
    if (!t) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(t)
  }),
]
