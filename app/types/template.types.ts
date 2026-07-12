export type TemplateCategory = 'auto-confirmation' | 'event-invitation' | 'general'

export interface EmailTemplate {
  id: string
  name: string
  category: TemplateCategory
  subject: string
  body: string
  isDefault: boolean
}

export interface EmailTemplatesResponse {
  data: EmailTemplate[]
  total: number
}
