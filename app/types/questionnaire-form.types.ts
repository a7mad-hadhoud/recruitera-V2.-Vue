export type QFQuestionType =
  | 'Text (single line)' | 'Text (multiple lines)' | 'Video answer' | 'Rating scale' | 'Yes / No'
  | 'Single choice' | 'Multiple choice' | 'Date' | 'File Upload'

export interface QFQuestion {
  id: string
  type: QFQuestionType
  q: string
  hint: string
  required: boolean
  options?: string[]
  timeLimit?: string
  scale?: '1-5' | '1-10'
  scaleLabelLow?: string
  scaleLabelHigh?: string
}

export interface QuestionnaireForm {
  id: string
  name: string
  category: string
  questions: QFQuestion[]
}

export interface QuestionnaireFormsResponse {
  data: QuestionnaireForm[]
  total: number
}
