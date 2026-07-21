// Screening list filters (row-based). Mirrors useJobsFilters shape so
// the UI can reuse the exact JobsFiltersPanel visual pattern for a
// consistent "All filters" experience across the app.
//
// Client-side today; when the API lands the rows fold into the
// ['pipeline', jobId, stageKey, filters] query key documented in
// useJobPipeline.ts (see JSDoc there).

export type ScreeningFilterField =
  | 'stage'
  | 'source'
  | 'rating'
  | 'ai-score'
  | 'location'
  | 'tag'
  | 'date-added'

export type ScreeningFilterOp = 'is-any-of' | 'is-not' | 'is-empty'

export interface ScreeningFilterOption {
  value: string
  label: string
  dot?: string       // CSS color token — same convention as JOB_FILTER_OPTIONS
}

export interface ScreeningFilterRow {
  id: string
  field: ScreeningFilterField
  op: ScreeningFilterOp
  values: string[]
}

export const SCREENING_FILTER_FIELDS: Array<{ key: ScreeningFilterField; label: string }> = [
  { key: 'stage',       label: 'Stage'      },
  { key: 'source',      label: 'Source'     },
  { key: 'rating',      label: 'Rating'     },
  { key: 'ai-score',    label: 'AI score'   },
  { key: 'location',    label: 'Location'   },
  { key: 'tag',         label: 'Tag'        },
  { key: 'date-added',  label: 'Date added' },
]

export const SCREENING_FILTER_OPS: Array<{ key: ScreeningFilterOp; label: string }> = [
  { key: 'is-any-of', label: 'Is any of' },
  { key: 'is-not',    label: 'Is not'    },
  { key: 'is-empty',  label: 'Is empty'  },
]

// Preset value catalogs. Real API replaces these with server-provided
// facet lists (top N sources for this job, real stage keys, etc).
export const SCREENING_FILTER_OPTIONS: Record<ScreeningFilterField, ScreeningFilterOption[]> = {
  stage: [
    { value: 'sourced',   label: 'Sourced',         dot: 'var(--brand-text-faint)' },
    { value: 'applied',   label: 'Applied',         dot: 'var(--brand-text-secondary)' },
    { value: 'phone',     label: 'Phone interview', dot: 'var(--brand-pipeline-blue)' },
    { value: 'interview', label: 'Interview',       dot: 'var(--brand-status-teal-green)' },
    { value: 'offer',     label: 'Offer',           dot: 'var(--brand-pipeline-purple)' },
    { value: 'hired',     label: 'Hired',           dot: 'var(--brand-status-approved-text)' },
    { value: 'rejected',  label: 'Rejected',        dot: 'var(--brand-status-closed-text)' },
  ],
  source: [
    { value: 'indeed.com',    label: 'Indeed'         },
    { value: 'linkedin.com',  label: 'LinkedIn'       },
    { value: 'monster.com',   label: 'Monster'        },
    { value: 'careers page',  label: 'Careers page'   },
    { value: 'careers site',  label: 'Careers site'   },
    { value: 'referral',      label: 'Employee referral' },
    { value: 'resume sent',   label: 'Resume sent'    },
  ],
  rating: [
    { value: 'up',   label: 'Positive' },
    { value: 'down', label: 'Negative' },
    { value: 'none', label: 'No rating' },
  ],
  'ai-score': [
    { value: '80+', label: '80% and above' },
    { value: '70+', label: '70% and above' },
    { value: '50+', label: '50% and above' },
    { value: '<50', label: 'Below 50%'     },
  ],
  location: [
    { value: 'Amsterdam',   label: 'Amsterdam'   },
    { value: 'Berlin',      label: 'Berlin'      },
    { value: 'London',      label: 'London'      },
    { value: 'Remote',      label: 'Remote'      },
  ],
  tag: [
    { value: 'sample',    label: 'Sample'    },
    { value: 'senior',    label: 'Senior'    },
    { value: 'mid_level', label: 'Mid-level' },
    { value: 'junior',    label: 'Junior'    },
    { value: 'growth',    label: 'Growth'    },
    { value: 'sales',     label: 'Sales'     },
    { value: 'nodejs',    label: 'Node.js'   },
    { value: 'postgres',  label: 'Postgres'  },
  ],
  'date-added': [
    { value: 'week',    label: 'Past week'     },
    { value: 'month',   label: 'Past month'    },
    { value: '3months', label: 'Past 3 months' },
    { value: 'year',    label: 'Past year'     },
  ],
}

let seq = 0
export function newScreeningFilterRow(): ScreeningFilterRow {
  return { id: `sf-${++seq}`, field: 'stage', op: 'is-any-of', values: [] }
}

export function useScreeningFilters() {
  const rows = ref<ScreeningFilterRow[]>([])
  function add()    { rows.value = [...rows.value, newScreeningFilterRow()] }
  function remove(id: string)               { rows.value = rows.value.filter(r => r.id !== id) }
  function update(id: string, patch: Partial<ScreeningFilterRow>) {
    rows.value = rows.value.map(r => r.id === id ? { ...r, ...patch } : r)
  }
  function clear()  { rows.value = [] }
  return { rows, add, remove, update, clear }
}
