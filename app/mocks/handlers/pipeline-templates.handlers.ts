import { http, HttpResponse } from 'msw'
import type { PipelineTemplate } from '~/types'

const pipelineTemplates: PipelineTemplate[] = [
  {
    id: '1',
    name: 'Default (Default)',
    isDefault: true,
    applicants: [
      { id: 'a1', name: 'Referred', type: 'No type', sla: 'No time limit', automations: [] },
      { id: 'a2', name: 'Sourced', type: 'No type', sla: 'No time limit', automations: [] },
      { id: 'a3', name: 'Applied', type: 'Apply', sla: 'No time limit', automations: [] },
    ],
    active: [
      { id: 's1', name: 'Phone interview', type: 'Phone Screen', sla: 'No time limit', automations: [{ id: 'au1', label: "When a candidate is moved to this stage, then add a note" }] },
      { id: 's2', name: 'On-site interview', type: 'Interview', sla: 'No time limit', automations: [] },
      { id: 's3', name: 'Offer', type: 'Offer', sla: 'No time limit', automations: [] },
      { id: 's4', name: 'Evaluation', type: 'Evaluation', sla: 'No time limit', automations: [] },
    ],
    hires: [
      { id: 'h1', name: 'Hired', type: 'No type', sla: 'No time limit', automations: [] },
    ],
  },
]

export const pipelineTemplatesHandlers = [
  http.get('/api/templates/pipeline', () => {
    return HttpResponse.json({ data: pipelineTemplates, total: pipelineTemplates.length })
  }),
]
