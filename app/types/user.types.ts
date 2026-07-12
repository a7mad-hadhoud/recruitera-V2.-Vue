export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'viewer'
  avatarColor: string
  initials: string
}

export type SubscriptionState = 'trial' | 'active' | 'expired' | 'frozen'

export interface Company {
  id: string
  name: string
  subscriptionState: SubscriptionState
  trialEndsAt?: string
}
