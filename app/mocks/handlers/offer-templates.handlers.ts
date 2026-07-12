import { http, HttpResponse } from 'msw'
import type { OfferTemplate } from '~/types'

const offerTemplates: OfferTemplate[] = [
  {
    id: '1',
    name: 'White Collar – Permanent',
    type: 'OFFER',
    department: '',
    location: '',
    documentName: 'white-collar-offer.docx',
    message: 'Dear {{candidate first name}},\n\nIt is my great pleasure to offer you the position of {{job}} at {{company}}.\n\nPlease take a moment to review and sign the document by clicking on the link below:\n\n{{HelloSign link}}\n\nWe look forward to welcoming you onboard.\n\nShould you have any further questions, please do not hesitate to contact me.\n\nSincerely,\n{{user}}',
  },
  {
    id: '2',
    name: 'Blue Collar – Daily Wage',
    type: 'SIMPLE',
    department: 'Engineering',
    location: 'Cairo HQ',
    documentName: 'blue-collar-offer.docx',
    message: 'Dear {{candidate first name}},\n\nWe are pleased to confirm your daily wage offer for the position of {{job}} at {{company}}.\n\nPlease review and sign the document below:\n\n{{HelloSign link}}\n\nSincerely,\n{{user}}',
  },
]

export const offerTemplatesHandlers = [
  http.get('/api/templates/offer', () => {
    return HttpResponse.json({ data: offerTemplates, total: offerTemplates.length })
  }),
]
