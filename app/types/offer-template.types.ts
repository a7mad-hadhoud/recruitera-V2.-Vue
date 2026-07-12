export type OfferTemplateType = 'OFFER' | 'SIMPLE'

export interface OfferTemplate {
  id: string
  name: string
  type: OfferTemplateType
  /** Empty string = available to all departments. */
  department: string
  /** Empty string = available to all locations. */
  location: string
  /** Chosen .docx file name, empty if none uploaded yet. */
  documentName: string
  /** Raw message text with {{token}} placeholders, same convention as EmailTemplate.body. */
  message: string
}

export interface OfferTemplatesResponse {
  data: OfferTemplate[]
  total: number
}
