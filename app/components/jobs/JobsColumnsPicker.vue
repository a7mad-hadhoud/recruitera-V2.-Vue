<!--
  "Adjust columns" popover — mirrors CandidatesColumnToggle exactly so
  Jobs and Candidates present the same column-management UI. Full column
  list with:
   - Title + Status locked/disabled/always-checked (top of list)
   - lime checkboxes to toggle each column
   - draggable rows (grip on right) to reorder
   - "Auto fit disabled" toggle below the divider
-->
<script setup lang="ts">
import { Columns3, GripVertical } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { BrandButton, BrandLimeCheckbox } from '~/components/brand'
import {
  JOB_COLUMN_LABELS,
  useJobsColumns,
} from '~/composables/useJobsColumns'

const { orderedRows, autoFitDisabled, isVisible, isLocked, toggleColumn, moveColumn } = useJobsColumns()

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
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <BrandButton variant="outline">
        <Columns3 class="w-4 h-4 mr-1.5" stroke-width="1.8" />
        Columns
      </BrandButton>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      :side-offset="6"
      class="w-[300px] p-0 rounded-lg border-[var(--brand-border-light)] shadow-[0_8px_24px_rgba(0,20,18,0.14)] overflow-hidden"
    >
      <div class="text-center text-[13px] font-bold text-[var(--brand-text)] py-2 border-b border-[var(--brand-border-fade)]">
        Adjust columns
      </div>
      <div class="max-h-[280px] overflow-y-auto py-1">
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
          >{{ JOB_COLUMN_LABELS[col] }}</span>
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
