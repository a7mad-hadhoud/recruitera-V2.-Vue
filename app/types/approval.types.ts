export interface Approver {
  id: string
  type: 'user' | 'dynamic'
  name: string
  initials?: string
}

export interface ApprovalStep {
  id: string
  slaDays: number
  approvers: Approver[]
  rule: 'ALL' | 'ANY'
}

export interface ApprovalFlow {
  id: string
  name: string
  steps: ApprovalStep[]
}

export function newApproverId(): string {
  return `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
export function newStepId(): string {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
export function newFlowId(): string {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function flowSummary(flow: ApprovalFlow): string {
  const approverCount = flow.steps.reduce((sum, s) => sum + s.approvers.length, 0)
  return `${flow.steps.length} step${flow.steps.length === 1 ? '' : 's'} · ${approverCount} approver${approverCount === 1 ? '' : 's'}`
}
