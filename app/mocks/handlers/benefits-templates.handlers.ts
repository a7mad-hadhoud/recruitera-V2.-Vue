import { http, HttpResponse } from 'msw'
import type { BenefitsTemplate } from '~/types'

const benefitsTemplates: BenefitsTemplate[] = [
  { id: '1', name: 'Standard Benefits Package', content: 'Health insurance\nDental and vision coverage\nAnnual bonus\n21 days paid leave\nFlexible working hours\nRemote work options' },
  { id: '2', name: 'Engineering Package', content: 'Health insurance\nStock options\nLearning & development budget ($2,000/year)\nHome office allowance\nUnlimited PTO' },
  { id: '3', name: 'Blue Collar Package', content: 'Social insurance\nMeal allowance\nTransportation allowance\nAnnual leave per labor law\nOvertime compensation' },
]

export const benefitsTemplatesHandlers = [
  http.get('/api/templates/benefits', () => {
    return HttpResponse.json({ data: benefitsTemplates, total: benefitsTemplates.length })
  }),
]
