import { defineStore } from 'pinia'

/**
 * UI-only state for the candidates page.
 * Filter state lives in the URL (useCandidateFilters), never here.
 * This store only tracks which rows the user has ticked (bulk selection).
 * The profile panel's open/closed state lives in the URL too — see
 * /candidates/[id].vue — since it's a real, shareable route.
 */
export const useCandidatesStore = defineStore('candidates', () => {
  const selectedIds = ref<string[]>([])

  function toggleSelect(id: string) {
    const idx = selectedIds.value.indexOf(id)
    if (idx === -1) selectedIds.value.push(id)
    else selectedIds.value.splice(idx, 1)
  }
  function selectAll(ids: string[]) { selectedIds.value = [...ids] }
  function clearSelection() { selectedIds.value = [] }
  function isSelected(id: string) { return selectedIds.value.includes(id) }

  const selectedCount = computed(() => selectedIds.value.length)
  const hasSelection = computed(() => selectedIds.value.length > 0)

  return {
    selectedIds,
    selectedCount,
    hasSelection,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
  }
})
