export type DistributionMode = 'random' | 'sequential' | 'referral' | 'claim'

export interface DistributionRecruiter {
  teamMemberId: string
  /** null when `unlimited` is true — capacity has no meaning for an unlimited recruiter. */
  capacity: number | null
  unlimited: boolean
  assigned: number
  /** Fill order for Sequential mode; ignored otherwise. */
  priority: number
}

export interface SmartDistributeConfig {
  jobId: string
  enabled: boolean
  mode: DistributionMode
  /** Open Pool only — hours before an unclaimed candidate triggers a recruiter nudge. */
  unclaimedAlertHours: number
  recruiters: DistributionRecruiter[]
}

export interface SmartDistributeCandidate {
  id: string
  name: string
  initials: string
  avatarColor: string
  stage: string
  source: string
  evaluationScore: number | null
}

export interface SmartDistributeCandidatesResponse {
  data: SmartDistributeCandidate[]
  total: number
}
