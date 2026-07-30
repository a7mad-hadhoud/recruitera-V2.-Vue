import type { Job } from '~/types'

export type JobFilterField =
  | 'status' | 'department' | 'workmodel' | 'location'
  | 'jobtype' | 'recruiter' | 'hiringmanager' | 'datecreated' | 'collar'

export type JobFilterOp = 'is-any-of' | 'is-not' | 'is-empty'

export interface JobFilterRow {
  id: string
  field: JobFilterField
  op: JobFilterOp
  values: string[]
}

export const JOB_FILTER_FIELDS: { key: JobFilterField; label: string }[] = [
  { key: 'status',        label: 'Status' },
  { key: 'department',    label: 'Department' },
  { key: 'workmodel',     label: 'Work model' },
  { key: 'location',      label: 'Location' },
  { key: 'jobtype',       label: 'Job type' },
  { key: 'recruiter',     label: 'Recruiter' },
  { key: 'hiringmanager', label: 'Hiring manager' },
  { key: 'datecreated',   label: 'Date created' },
  { key: 'collar',        label: 'Collar type' },
]

export const JOB_FILTER_OPS: { key: JobFilterOp; label: string }[] = [
  { key: 'is-any-of', label: 'Is any of' },
  { key: 'is-not',    label: 'Is not' },
  { key: 'is-empty',  label: 'Is empty' },
]

// Value option lists, keyed by field. Fields not listed use free-text later.
export const JOB_FILTER_OPTIONS: Partial<Record<JobFilterField, { value: string; label: string; dot?: string }[]>> = {
  status: [
    { value: 'draft',     label: 'Draft',     dot: 'var(--brand-text-quiet)' },
    { value: 'published', label: 'Published', dot: 'var(--brand-status-approved-text)' },
    { value: 'internal',  label: 'Internal',  dot: 'var(--brand-status-pending-text)' },
    { value: 'closed',    label: 'Closed',    dot: 'var(--brand-status-closed-text)' },
    { value: 'archived',  label: 'Archived',  dot: 'var(--brand-text-faint)' },
  ],
  workmodel: [
    { value: 'on-site', label: 'On-site' },
    { value: 'remote',  label: 'Remote' },
    { value: 'hybrid',  label: 'Hybrid' },
  ],
  collar: [
    { value: 'white', label: 'White collar' },
    { value: 'blue',  label: 'Blue collar' },
  ],
}

// Value → Job predicate. Fields with no known predicate are ignored (permissive).
export function applyJobFilters(jobs: readonly Job[], rows: JobFilterRow[]): Job[] {
  return jobs.filter((j) => {
    for (const r of rows) {
      if (r.op === 'is-empty' && r.field === 'department') { if (j.department) return false; continue }
      if (r.op === 'is-empty' && r.field === 'location')   { if (j.location)   return false; continue }
      if (!r.values.length) continue

      const jobVal = jobFieldValue(j, r.field)
      if (jobVal === null) continue
      const matches = r.values.includes(String(jobVal))
      if (r.op === 'is-any-of' && !matches) return false
      if (r.op === 'is-not'    &&  matches) return false
    }
    return true
  })
}

function jobFieldValue(j: Job, f: JobFilterField): string | null {
  switch (f) {
    case 'status':     return j.status
    case 'department': return j.department
    case 'location':   return j.location
    case 'workmodel':  return j.workModel
    case 'collar':     return j.collar
    default:           return null
  }
}

let seq = 0
const nextId = () => `f${++seq}`

export function useJobsFilters() {
  // Start with NO filters — the list shows every job by default (no "Filters 1"
  // badge). Users add filters explicitly via "＋ Add filter".
  const rows = ref<JobFilterRow[]>([])

  function addRow() {
    rows.value = [...rows.value, { id: nextId(), field: 'status', op: 'is-any-of', values: [] }]
  }
  function removeRow(id: string) {
    rows.value = rows.value.filter(r => r.id !== id)
  }
  function updateRow(id: string, patch: Partial<JobFilterRow>) {
    rows.value = rows.value.map(r => r.id === id ? { ...r, ...patch } : r)
  }
  function clearAll() { rows.value = [] }

  return { rows, addRow, removeRow, updateRow, clearAll }
}
