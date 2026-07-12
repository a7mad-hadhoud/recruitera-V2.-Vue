export type EvalQuestionType =
  | 'Text (single line)' | 'Text (multiple lines)' | 'Scorecard' | 'Yes / No'
  | 'Single choice' | 'Multiple choice' | 'Drop-down' | 'Add a file' | 'Info box'

export interface ScorecardStatement {
  id: string
  s: string
  d: string
}

export interface EvalQuestion {
  id: string
  type: EvalQuestionType
  q: string
  hint?: string
  required: boolean
  options?: string[]
  statements?: ScorecardStatement[]
}

export interface EvaluationForm {
  id: string
  name: string
  category: string
  description: string
  scoreRequired: boolean
  questions: EvalQuestion[]
}

export interface EvaluationFormsResponse {
  data: EvaluationForm[]
  total: number
}
