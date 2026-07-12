import { useQuery } from '@tanstack/vue-query'
import type { HiringRolesResponse, TeamMembersResponse } from '~/types'

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team', 'members'],
    queryFn: async () => {
      const res = await fetch('/api/team/members')
      if (!res.ok) throw new Error('Failed to fetch team members')
      return res.json() as Promise<TeamMembersResponse>
    },
  })
}

export function useHiringRoles() {
  return useQuery({
    queryKey: ['team', 'roles'],
    queryFn: async () => {
      const res = await fetch('/api/team/roles')
      if (!res.ok) throw new Error('Failed to fetch hiring roles')
      return res.json() as Promise<HiringRolesResponse>
    },
  })
}

export const PERM_TABS_ORDER = ['General', 'Workflow', 'Templates', 'Company', 'Add-ons'] as const

export const PERM_TABS: Record<string, { id: string, label: string, description: string }[]> = {
  General: [
    { id: 'view-candidates', label: 'View Candidates', description: 'Can view all candidates and their profiles within assigned jobs.' },
    { id: 'add-candidates', label: 'Add Candidates', description: 'Can add new candidates manually or via import to the system.' },
    { id: 'view-jobs', label: 'View Jobs', description: 'Can view all job postings and their details.' },
    { id: 'access-reports', label: 'Access Reports', description: 'Can view analytics and hiring reports across the platform.' },
    { id: 'share-candidates', label: 'Share Candidates', description: 'Can share candidate profiles with other team members and create public links.' },
    { id: 'print-candidates', label: 'Print Candidates', description: 'Can export and print candidate profiles and evaluation summaries.' },
  ],
  Workflow: [
    { id: 'move-candidates', label: 'Move Candidates', description: 'Can move candidates between pipeline stages.' },
    { id: 'disqualify-candidates', label: 'Disqualify Candidates', description: 'Can mark candidates as disqualified with a reason.' },
    { id: 'edit-candidates', label: 'Edit Candidates', description: 'Can edit candidate profile information and tags.' },
    { id: 'delete-candidates', label: 'Delete Candidates', description: 'Can permanently delete candidate records from the system.' },
    { id: 'send-emails', label: 'Send Emails', description: 'Can send emails to candidates directly from Recruitera.' },
    { id: 'send-interviews', label: 'Send Interviews', description: 'Can schedule and send interview invitations to candidates.' },
    { id: 'make-evaluations', label: 'Make Evaluations', description: 'Can submit structured evaluations and scorecards for candidates.' },
    { id: 'time-scheduling', label: 'Access to Create Time Scheduling', description: 'Can create and manage time scheduling events for interviews.' },
  ],
  Templates: [
    { id: 'manage-templates', label: 'Manage All Templates', description: 'Can create, edit, and delete email, evaluation, and pipeline templates.' },
  ],
  Company: [
    { id: 'create-edit-jobs', label: 'Create / Edit Jobs', description: 'Can create new job postings and edit existing ones.' },
    { id: 'manage-career-page', label: 'Manage Career Page', description: 'Can configure and publish the company career site.' },
    { id: 'manage-hiring-roles', label: 'Manage Hiring Roles and Permissions', description: 'Can view and configure role-based permissions for the organization.' },
    { id: 'add-team-members', label: 'Add Team Members', description: 'Can invite new members to the Recruitera account.' },
  ],
  'Add-ons': [
    { id: 'access-requisition', label: 'Access Requisition', description: 'Can view and manage the requisition approval workflow.' },
    { id: 'access-manpower', label: 'Access Manpower Planning', description: 'Can access and configure manpower planning features.' },
    { id: 'smart-distribute', label: 'Smart Distribute Initiation and Management', description: 'Can initiate and manage smart candidate distribution across jobs.' },
  ],
}
