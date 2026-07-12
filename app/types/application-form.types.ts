export type QuestionType =
  | 'Text (single line)' | 'Text (multiple lines)' | 'Yes / No' | 'Single choice' | 'Multiple choice'
  | 'Date' | 'Number' | 'Salary' | 'Video answer' | 'Add a file' | 'Info box' | 'Legal'

export interface FormQuestion {
  id: string
  q: string
  type: QuestionType
  required: boolean
  options?: string[]
  currency?: string
  text?: string
}

export interface ApplicationForm {
  id: string
  name: string
  category: string
  questions: FormQuestion[]
  isDefault: boolean
}

export interface ApplicationFormsResponse {
  data: ApplicationForm[]
  total: number
}
