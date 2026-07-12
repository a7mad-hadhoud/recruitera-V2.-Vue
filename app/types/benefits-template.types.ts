export interface BenefitsTemplate {
  id: string
  name: string
  content: string
}

export interface BenefitsTemplatesResponse {
  data: BenefitsTemplate[]
  total: number
}
