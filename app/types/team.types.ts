export type TeamMemberStatus = 'Active' | 'Pending' | 'Suspended'
export type TeamMemberRole = 'Administrator' | 'Recruiter' | 'Hiring Manager' | 'Viewer'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamMemberRole
  status: TeamMemberStatus
  /** Tailwind bg color for the circular avatar. Same convention as Company's avatarColor. */
  avatarBg: string
  avatarText: string
}

export interface TeamMembersResponse {
  data: TeamMember[]
  total: number
}

export type HiringRoleId = 'admin' | 'hm' | 'recruiter' | 'employee' | 'reviewer' | string

export interface HiringPermission {
  id: string
  label: string
  description: string
}

export interface HiringPermissionTab {
  key: string
  perms: HiringPermission[]
}

export interface HiringRoleMember {
  name: string
  email: string
  status: TeamMemberStatus
}

export interface HiringRole {
  id: HiringRoleId
  label: string
  /** Locked (default) roles cannot be edited — Company Admin. */
  locked: boolean
  /** Whether this role is a user-created custom role (shown under "Custom Roles"). */
  custom: boolean
  description: string
  members: HiringRoleMember[]
  /** Permission id -> granted? */
  permissions: Record<string, boolean>
}

export interface HiringRolesResponse {
  data: HiringRole[]
  total: number
}
