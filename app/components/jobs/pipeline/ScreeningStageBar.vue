<!--
  Stage-tab bar for Pipeline → Screening view.

  Layout: [◀ scroll]  ── scrollable tab strip ──  [▶ scroll]

  Scroll buttons appear only when the strip actually overflows, and
  auto-disable when the strip has already scrolled to the edge (so they
  never lie about what they'll do). Sourced is hidden — recruiters don't
  triage from the sourced stage in this view; it clutters the row and
  they can always find those candidates from the kanban board.

  Keyboard: ← / → move through tabs, Home/End jump to ends.
-->
<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { PipelineStage } from '~/types'

const props = defineProps<{
  stages: PipelineStage[]
  activeKey: string
  totalCount: number
}>()

const emit = defineEmits<{
  'update:activeKey': [key: string]
}>()

// Stages hidden from this view. Sourced is a pre-application state — it
// belongs in the kanban's leftmost column, not in the triage triage row.
const HIDDEN_STAGE_KEYS = new Set(['sourced'])

const tabs = computed(() => [
  { key: 'all', label: 'All', dot: 'var(--brand-text-quiet)', count: props.totalCount },
  ...props.stages
    .filter(s => !HIDDEN_STAGE_KEYS.has(s.key))
    .map(s => ({ key: s.key, label: s.label, dot: s.dot, count: s.candidates.length })),
])

// Scroll-affordance state — recalculated whenever the strip scrolls or
// resizes; buttons hide when there's nothing to scroll to on that side.
const scrollEl = ref<HTMLElement | null>(null)
const canScrollLeft  = ref(false)
const canScrollRight = ref(false)
function recomputeScroll() {
  const el = scrollEl.value
  if (!el) return
  canScrollLeft.value  = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}
function scrollByPage(dir: 1 | -1) {
  const el = scrollEl.value
  if (!el) return
  el.scrollBy({ left: dir * Math.max(120, el.clientWidth * 0.75), behavior: 'smooth' })
}

onMounted(() => {
  recomputeScroll()
  const el = scrollEl.value
  if (el) {
    el.addEventListener('scroll', recomputeScroll)
    const ro = new ResizeObserver(recomputeScroll)
    ro.observe(el)
    onBeforeUnmount(() => {
      el.removeEventListener('scroll', recomputeScroll)
      ro.disconnect()
    })
  }
})
watch(tabs, () => nextTick(recomputeScroll))

function onKey(e: KeyboardEvent) {
  const list = tabs.value
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
  <div class="relative flex items-stretch border-b border-[var(--brand-border-fade)] bg-white">
    <!-- Scroll-left button. Only rendered when overflow is available. -->
    <button
      v-show="canScrollLeft"
      type="button"
      class="shrink-0 w-8 self-stretch inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
      aria-label="Scroll stages left"
      @click="scrollByPage(-1)"
    >
      <ChevronLeft class="w-4 h-4" stroke-width="2" />
    </button>

    <div
      ref="scrollEl"
      role="tablist"
      aria-label="Pipeline stages"
      class="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-3"
      @keydown="onKey"
    >
      <button
        v-for="tab in tabs"
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

    <!-- Scroll-right button. Only rendered when overflow is available. -->
    <button
      v-show="canScrollRight"
      type="button"
      class="shrink-0 w-8 self-stretch inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
      aria-label="Scroll stages right"
      @click="scrollByPage(1)"
    >
      <ChevronRight class="w-4 h-4" stroke-width="2" />
    </button>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none }
.no-scrollbar { scrollbar-width: none }
</style>
