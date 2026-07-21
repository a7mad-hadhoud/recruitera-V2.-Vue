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
  <div
    role="tablist"
    aria-label="Pipeline stages"
    class="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-[var(--brand-border-fade)]"
    @keydown="onKey"
  >
    <button
      v-for="tab in tabs()"
      :key="tab.key"
      role="tab"
      :aria-selected="tab.key === props.activeKey"
      :tabindex="tab.key === props.activeKey ? 0 : -1"
      class="group inline-flex items-center gap-2 shrink-0 px-4 h-11 text-[13.5px] font-semibold transition relative"
      :class="tab.key === props.activeKey
        ? 'text-[var(--brand-text)]'
        : 'text-[var(--brand-text-subtle)] hover:text-[var(--brand-text)]'"
      @click="emit('update:activeKey', tab.key)"
    >
      <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: tab.dot }" />
      <span>{{ tab.label }}</span>
      <span
        class="text-[11px] font-bold rounded-md px-[7px] py-px tabular-nums"
        :class="tab.key === props.activeKey
          ? 'bg-[var(--brand-teal)] text-white'
          : 'bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)]'"
      >{{ tab.count }}</span>
      <span
        v-if="tab.key === props.activeKey"
        class="absolute left-3 right-3 -bottom-px h-[2px] bg-[var(--brand-teal)] rounded-full"
      />
    </button>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none }
.no-scrollbar { scrollbar-width: none }
</style>
