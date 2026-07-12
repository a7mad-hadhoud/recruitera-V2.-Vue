import { defineStore } from 'pinia'

/**
 * UI-only state for the candidates page.
 * Filter state lives in the URL (useCandidateFilters), never here.
 * This store only tracks:
 *   - which rows the user has ticked (bulk selection)
 *   - which candidate's profile panel is open, if any
 */
export const useCandidatesStore = defineStore('candidates', () => {
  const selectedIds = ref<string[]>([])
  const activeCandidateId = ref<string | null>(null)

  function toggleSelect(id: string) {
    const idx = selectedIds.value.indexOf(id)
    if (idx === -1) selectedIds.value.push(id)
    else selectedIds.value.splice(idx, 1)
  }
  function selectAll(ids: string[]) { selectedIds.value = [...ids] }
  function clearSelection() { selectedIds.value = [] }
  function isSelected(id: string) { return selectedIds.value.includes(id) }

  function openProfile(id: string) { activeCandidateId.value = id }
  function closeProfile() { activeCandidateId.value = null }

  const selectedCount = computed(() => selectedIds.value.length)
  const hasSelection = computed(() => selectedIds.value.length > 0)

  return {
    selectedIds,
    activeCandidateId,
    selectedCount,
    hasSelection,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    openProfile,
    closeProfile,
  }
})
