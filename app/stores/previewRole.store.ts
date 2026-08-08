import { defineStore } from 'pinia'

/**
 * DEMO-ONLY. There's no real role switching yet (auth is a single mock
 * user — see auth.store.ts) — this exists so permission-gated UI (Smart
 * Distribute's "Admin/Hiring Manager/Recruiter see different things") can
 * actually be previewed instead of only existing in the spec. Remove once
 * real role-aware auth ships.
 */
export type PreviewRole = 'admin' | 'hiring_manager' | 'recruiter'

export const PREVIEW_ROLE_LABELS: Record<PreviewRole, string> = {
  admin: 'Admin',
  hiring_manager: 'Hiring Manager',
  recruiter: 'Recruiter',
}

// Mirrors the default "Smart Distribute Initiation and Management" grants
// in team.handlers.ts (hmGranted/recruiterGranted both list/omit
// 'smart-distribute') — Admin is always on and locked, Hiring Manager is
// on by default, Recruiter is off by default.
export const SMART_DISTRIBUTE_PERMISSION_DEFAULT: Record<PreviewRole, boolean> = {
  admin: true,
  hiring_manager: true,
  recruiter: false,
}

export const usePreviewRoleStore = defineStore('previewRole', () => {
  const role = ref<PreviewRole>('admin')
  const canManageSmartDistribute = computed(() => SMART_DISTRIBUTE_PERMISSION_DEFAULT[role.value])
  return { role, canManageSmartDistribute }
})
