import { useLocalStorage } from '@vueuse/core'

/** Full column set. Order = default table column order. */
export const ALL_CANDIDATE_COLUMNS = [
  'name', 'job', 'stage', 'evaluation-score', 'avg-evaluation-score',
  'screening-score', 'work-location', 'date-created', 'source', 'tag',
  'talent-pool', 'disqualified-by', 'disqualify-date', 'integrations',
  'last-activity', 'hire-date', 'start-date',
] as const

export type CandidateColumnKey = typeof ALL_CANDIDATE_COLUMNS[number]

/** Name is always visible (contains the checkbox + primary identifier). */
export const LOCKED_COLUMNS: CandidateColumnKey[] = ['name']

/** Defaults per spec: checked ones show at first mount. */
export const DEFAULT_VISIBLE_COLUMNS: CandidateColumnKey[] = [
  'name', 'job', 'date-created', 'source', 'tag', 'talent-pool', 'disqualified-by',
]

/** Default order = spec sequence, mixing hidden ones between visibles. */
const DEFAULT_ORDER: CandidateColumnKey[] = [...ALL_CANDIDATE_COLUMNS]

export const CANDIDATE_COLUMN_LABELS: Record<CandidateColumnKey, string> = {
  'name':                  'Name',
  'job':                   'Job',
  'stage':                 'Stage',
  'evaluation-score':      'Evaluation score',
  'avg-evaluation-score':  'Average evaluation score',
  'screening-score':       'Screening score',
  'work-location':         'Work location',
  'date-created':          'Date created',
  'source':                'Keywords',
  'tag':                   'Tag',
  'talent-pool':           'Talent pool',
  'disqualified-by':       'Disqualified by',
  'disqualify-date':       'Disqualify date',
  'integrations':          'Integrations',
  'last-activity':         'Last activity',
  'hire-date':             'Hire date',
  'start-date':            'Start date',
}

/** Fixed pixel widths from the spec. Unspecified = flex. */
export const COLUMN_WIDTHS: Partial<Record<CandidateColumnKey, string>> = {
  'name':            '280px',
  'job':             '250px',
  'date-created':    '140px',
  'source':          '320px',
  'tag':             '250px',
  'talent-pool':     '250px',
  'disqualified-by': '150px',
}

/**
 * Column visibility + order persist across sessions.
 * `order` controls the order they appear in both the chooser and the table.
 */
export function useCandidateColumns() {
  const visibleColumns = useLocalStorage<CandidateColumnKey[]>(
    'recruitera:candidates:columns',
    [...DEFAULT_VISIBLE_COLUMNS],
  )
  const columnOrder = useLocalStorage<CandidateColumnKey[]>(
    'recruitera:candidates:column-order',
    [...DEFAULT_ORDER],
  )
  const autoFitDisabled = useLocalStorage<boolean>(
    'recruitera:candidates:auto-fit-disabled',
    false,
  )

  function isVisible(col: CandidateColumnKey) {
    return visibleColumns.value.includes(col)
  }
  function isLocked(col: CandidateColumnKey) {
    return LOCKED_COLUMNS.includes(col)
  }

  function toggleColumn(col: CandidateColumnKey) {
    if (isLocked(col)) return
    const arr = visibleColumns.value
    const idx = arr.indexOf(col)
    if (idx === -1) arr.push(col)
    else arr.splice(idx, 1)
  }

  function moveColumn(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return
    const arr = columnOrder.value.slice()
    const [item] = arr.splice(from, 1)
    if (item === undefined) return
    arr.splice(to, 0, item)
    columnOrder.value = arr
  }

  /** Columns in the user's order, filtered to those currently visible. */
  const orderedVisible = computed<CandidateColumnKey[]>(() =>
    columnOrder.value.filter(c => visibleColumns.value.includes(c)),
  )

  return {
    visibleColumns,
    columnOrder,
    orderedVisible,
    autoFitDisabled,
    isVisible,
    isLocked,
    toggleColumn,
    moveColumn,
  }
}
