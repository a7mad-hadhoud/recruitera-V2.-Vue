<!--
  "Adjust columns" popover. Full 17-column list with:
   - Name locked/disabled/always-checked
   - checkboxes to toggle each column
   - draggable rows (grip on right) to reorder
   - "Auto fit disabled" toggle below the divider (no drag handle)
-->
<script setup lang="ts">
import { Columns2, GripVertical } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { BrandLimeCheckbox } from '~/components/brand'
import {
  ALL_CANDIDATE_COLUMNS,
  CANDIDATE_COLUMN_LABELS,
  useCandidateColumns,
} from '~/composables/useCandidateColumns'

const { columnOrder, autoFitDisabled, isVisible, isLocked, toggleColumn, moveColumn } = useCandidateColumns()

const dragFromIndex = ref<number | null>(null)
function onDragStart(i: number, e: DragEvent) {
  dragFromIndex.value = i
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}
function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}
function onDrop(i: number, e: DragEvent) {
  e.preventDefault()
  if (dragFromIndex.value !== null) moveColumn(dragFromIndex.value, i)
  dragFromIndex.value = null
}

// Fallback: unknown columns (e.g. if someone edits localStorage) still render.
const orderedRows = computed(() => {
  const seen = new Set<string>()
  const rows: string[] = []
  for (const k of columnOrder.value) {
    if (ALL_CANDIDATE_COLUMNS.includes(k as never) && !seen.has(k)) {
      rows.push(k); seen.add(k)
    }
  }
  for (const k of ALL_CANDIDATE_COLUMNS) if (!seen.has(k)) rows.push(k)
  return rows as (typeof ALL_CANDIDATE_COLUMNS[number])[]
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        size="icon"
        class="h-9 w-9 rounded-lg border-[var(--brand-border)] text-[var(--brand-text-subtle)] hover:bg-[var(--brand-lime-tint-hover)]"
        aria-label="Adjust columns"
      >
        <Columns2 class="w-4 h-4" stroke-width="1.7" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      :side-offset="6"
      class="w-[300px] p-0 rounded-lg border-[var(--brand-border-light)] shadow-[0_8px_24px_rgba(0,20,18,0.14)] overflow-hidden"
    >
      <div class="text-center text-[13px] font-bold text-[var(--brand-text)] py-2 border-b border-[var(--brand-border-fade)]">
        Adjust columns
      </div>
      <div class="max-h-[220px] overflow-y-auto py-1">
        <div
          v-for="(col, i) in orderedRows"
          :key="col"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[var(--brand-lime-tint)] transition-colors"
          :draggable="!isLocked(col)"
          @dragstart="onDragStart(i, $event)"
          @dragover="onDragOver"
          @drop="onDrop(i, $event)"
        >
          <BrandLimeCheckbox
            :model-value="isVisible(col)"
            :disabled="isLocked(col)"
            :class="isLocked(col) ? 'opacity-60 cursor-not-allowed' : ''"
            @update:model-value="toggleColumn(col)"
          />
          <span
            class="flex-1 text-[13.5px]"
            :class="isLocked(col) ? 'text-[var(--brand-text-quiet)]' : 'text-[var(--brand-text-secondary)]'"
          >{{ CANDIDATE_COLUMN_LABELS[col] }}</span>
          <GripVertical
            v-if="!isLocked(col)"
            class="w-3.5 h-3.5 text-[var(--brand-text-faint)] cursor-grab active:cursor-grabbing"
            stroke-width="1.7"
          />
        </div>
      </div>
      <div class="h-px bg-[var(--brand-border-fade)]" />
      <label class="flex items-center gap-2 px-2.5 py-2.5 cursor-pointer hover:bg-[var(--brand-lime-tint)] transition-colors">
        <BrandLimeCheckbox v-model="autoFitDisabled" />
        <span class="flex-1 text-[13.5px] text-[var(--brand-text-secondary)]">Auto fit disabled</span>
      </label>
    </PopoverContent>
  </Popover>
</template>
