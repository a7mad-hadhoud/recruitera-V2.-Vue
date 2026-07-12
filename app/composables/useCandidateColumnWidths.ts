import { useLocalStorage } from '@vueuse/core'
import { COLUMN_WIDTHS, type CandidateColumnKey } from './useCandidateColumns'

const DEFAULT_WIDTH = 180
export const MIN_COLUMN_WIDTH = 80

function parseWidth(w?: string) {
  return w ? Number.parseInt(w, 10) : DEFAULT_WIDTH
}

/**
 * Per-column pixel widths, draggable like a spreadsheet and persisted
 * across sessions. Falls back to the spec's COLUMN_WIDTHS, then a default.
 */
export function useCandidateColumnWidths() {
  const widths = useLocalStorage<Partial<Record<CandidateColumnKey, number>>>(
    'recruitera:candidates:column-widths',
    {},
  )

  function getWidth(col: CandidateColumnKey) {
    return widths.value[col] ?? parseWidth(COLUMN_WIDTHS[col])
  }

  function setWidth(col: CandidateColumnKey, px: number) {
    widths.value = { ...widths.value, [col]: Math.max(MIN_COLUMN_WIDTH, Math.round(px)) }
  }

  return { getWidth, setWidth }
}
