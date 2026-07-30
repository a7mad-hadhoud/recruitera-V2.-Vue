import { useLocalStorage } from '@vueuse/core'
import { type JobColumnKey } from './useJobsColumns'

// Per-column defaults, tuned to fit typical Jobs rows without wrapping.
const DEFAULT_WIDTHS: Record<JobColumnKey, number> = {
  'title':               260,
  'status':              170,
  'cands':               130,
  'hired':               90,
  'created':             150,
  'assigned':            160,
  'dept':                160,
  'location':            160,
  'location-address':    220,
  'workmodel':           130,
  'tags':                150,
  'manage':              120,
  'hidden':              100,
  'jobid':               110,
  'newcands':            140,
  'schedpublish':        160,
  'schedclose':          160,
  'qualcands':           160,
  'disqualcands':        180,
  'followers':           130,
}

export const MIN_COLUMN_WIDTH = 80

/**
 * Per-column pixel widths for the Jobs table, draggable like a spreadsheet
 * and persisted across sessions. Mirrors useCandidateColumnWidths so both
 * tables behave identically.
 */
export function useJobsColumnWidths() {
  const widths = useLocalStorage<Partial<Record<JobColumnKey, number>>>(
    'recruitera:jobs:column-widths',
    {},
  )

  function getWidth(col: JobColumnKey) {
    return widths.value[col] ?? DEFAULT_WIDTHS[col]
  }
  function setWidth(col: JobColumnKey, px: number) {
    widths.value = { ...widths.value, [col]: Math.max(MIN_COLUMN_WIDTH, Math.round(px)) }
  }

  return { getWidth, setWidth }
}
