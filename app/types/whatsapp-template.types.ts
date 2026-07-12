export type WhatsAppStatus = 'Approved' | 'Pending' | 'Draft'
export type WhatsAppType = 'message' | 'event'
export type WhatsAppCategory = 'Utility' | 'Marketing' | 'Authentication'

export interface WhatsAppTemplate {
  id: string
  name: string
  language: string
  category: WhatsAppCategory
  type: WhatsAppType
  status: WhatsAppStatus
  body: string
}

export interface WhatsAppTemplatesResponse {
  data: WhatsAppTemplate[]
  total: number
}
