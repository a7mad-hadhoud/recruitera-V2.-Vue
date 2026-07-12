export type PipelineStageType = 'No type' | 'Apply' | 'Phone Screen' | 'Interview' | 'Evaluation' | 'Offer'

export const PIPELINE_TYPE_COLORS: Record<PipelineStageType, string> = {
  'No type': 'var(--brand-status-gray)',
  'Apply': 'var(--brand-status-gray)',
  'Phone Screen': 'var(--brand-pipeline-blue)',
  'Interview': 'var(--brand-pipeline-blue)',
  'Evaluation': 'var(--brand-settings-status-active)',
  'Offer': 'var(--brand-pipeline-purple)',
}

export interface StageAutomation {
  id: string
  label: string
}

export interface PipelineStage {
  id: string
  name: string
  type: PipelineStageType
  sla: string
  automations: StageAutomation[]
}

export interface PipelineTemplate {
  id: string
  name: string
  isDefault: boolean
  applicants: PipelineStage[]
  active: PipelineStage[]
  hires: PipelineStage[]
}

export interface PipelineTemplatesResponse {
  data: PipelineTemplate[]
  total: number
}
