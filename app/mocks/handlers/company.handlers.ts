import { http, HttpResponse } from 'msw'
import type { CompanyInfo } from '~/types'

const company: CompanyInfo = {
  name: 'iCareer',
  industry: 'Technology',
  size: '11–50',
  foundedYear: 2019,
  about: 'We help teams hire better, faster.',
  logoUrl: null,
  seoImageUrl: null,
}

export const companyHandlers = [
  http.get('/api/company', () => {
    return HttpResponse.json(company)
  }),
]
