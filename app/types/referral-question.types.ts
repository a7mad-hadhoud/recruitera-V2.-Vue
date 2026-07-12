export type ReferralQuestionType =
  | 'Text (single line)'
  | 'Text (multiple lines)'
  | 'Yes / No'
  | 'Single choice'
  | 'Multiple choice'
  | 'Date'
  | 'Number'
  | 'Salary'
  | 'Add a file'
  | 'Video answer'

export type ReferralQuestionVisibility = 'Visible to everyone' | 'Visible to recruiters only'

export interface ReferralQuestion {
  id: string
  type: ReferralQuestionType
  q: string
  required: boolean
  options?: string[]
  visibility: ReferralQuestionVisibility
}

export interface ReferralTemplate {
  id: string
  name: string
  category: string
  isDefault: boolean
  questions: ReferralQuestion[]
}

export interface ReferralTemplatesResponse {
  data: ReferralTemplate[]
  total: number
}
