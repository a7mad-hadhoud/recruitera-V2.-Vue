<!--
  Top stage-tab bar in Pipeline → Screening view.
  Horizontal, scrollable. Each tab = colored dot + label + count.
  Same stage data + dot colors as kanban columns (from useJobPipeline)
  so the screening view stays in lockstep with the board.

  Keyboard: ← / → move through tabs, Home/End jump to ends.
-->
<script setup lang="ts">
import type { PipelineStage } from '~/types'

const props = defineProps<{
  stages: PipelineStage[]
  activeKey: string
  totalCount: number
}>()

const emit = defineEmits<{
  'update:activeKey': [key: string]
}>()

function tabs() {
  return [
    { key: 'all', label: 'All', dot: 'var(--brand-text-quiet)', count: props.totalCount },
    ...props.stages.map(s => ({ key: s.key, label: s.label, dot: s.dot, count: s.candidates.length })),
  ]
}

function onKey(e: KeyboardEvent) {
  const list = tabs()
  const idx = list.findIndex(t => t.key === props.activeKey)
  if (idx < 0) return
  if (e.key === 'ArrowRight' || e.key === ']') {
    e.preventDefault()
    emit('update:activeKey', list[(idx + 1) % list.length]!.key)
  } else if (e.key === 'ArrowLeft' || e.key === '[') {
    e.preventDefault()
    emit('update:activeKey', list[(idx - 1 + list.length) % list.length]!.key)
  } else if (e.key === 'Home') {
    e.preventDefault(); emit('update:activeKey', list[0]!.key)
  } else if (e.key === 'End') {
    e.preventDefault(); emit('update:activeKey', list[list.length - 1]!.key)
  }
}
</script>

<template>
  <!-- Wuzzuf/Workable-style stage bar: full-width row, clean text labels
       with a right-aligned count. Active tab = solid dark pill; others are
       plain text (no colored dot). Tabs distribute evenly across the full
       width (justify-between); at narrow widths the row scrolls. -->
  <div
    role="tablist"
    aria-label="Pipeline stages"
    class="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar px-4 py-3 border-b border-[var(--brand-border-fade)] bg-white"
    @keydown="onKey"
  >
    <button
      v-for="tab in tabs()"
      :key="tab.key"
      role="tab"
      :aria-selected="tab.key === props.activeKey"
      :tabindex="tab.key === props.activeKey ? 0 : -1"
      class="group inline-flex items-center gap-2 shrink-0 rounded-[8px] h-9 px-4 text-[14px] font-bold transition"
      :class="tab.key === props.activeKey
        ? 'bg-[var(--brand-text)] text-white'
        : 'bg-transparent text-[var(--brand-text)] hover:bg-[var(--brand-canvas)]'"
      @click="emit('update:activeKey', tab.key)"
    >
      <span>{{ tab.label }}</span>
      <span
        class="text-[11.5px] font-bold rounded-md px-[7px] py-px tabular-nums"
        :class="tab.key === props.activeKey
          ? 'bg-white/15 text-white'
          : 'bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)]'"
      >{{ tab.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none }
.no-scrollbar { scrollbar-width: none }
</style>
