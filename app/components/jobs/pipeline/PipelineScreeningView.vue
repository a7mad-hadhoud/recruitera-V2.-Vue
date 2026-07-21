<!--
  Pipeline → Screening (3-pane) container.
  Owns activeStageKey + selectedCandidateId + local search text.
  Assembles ScreeningStageBar / ScreeningCandidateRow list / ScreeningProfilePane.

  Fixture today: pulls stages from parent (already reactive on move).
  When the API lands, this file's shape stays the same — swap the
  flattened `candidates` computed for a per-stage useInfiniteQuery
  keyed by ['pipeline', jobId, stageKey, filters] (see useJobPipeline
  JSDoc).

  Bulk-selection Set is passed in from the parent so bulk-action bar
  stays consistent across kanban + screening.
-->
<script setup lang="ts">
import { Search, ArrowUpDown, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import type { PipelineStage } from '~/types'
import { useCandidateProfile } from '~/composables/useCandidates'
import ScreeningStageBar    from './ScreeningStageBar.vue'
import ScreeningCandidateRow from './ScreeningCandidateRow.vue'
import ScreeningProfilePane from './ScreeningProfilePane.vue'

const props = defineProps<{
  stages: PipelineStage[]
  selected: Set<string>
}>()

const emit = defineEmits<{
  'toggle-select': [id: string]
  'move':          [id: string, fromKey: string, toKey: string]
  'open-full':     [id: string]
}>()

const activeStageKey = ref<string>('all')
const selectedCandidateId = ref<string | null>(null)
const searchText = ref('')
const listCollapsed = ref(false)

const totalCount = computed(() =>
  props.stages.reduce((n, s) => n + s.candidates.length, 0),
)

// Flatten with a back-pointer to the owning stage — used by list rows and
// by the profile pane to know the "current" stage for the Move split-button.
type Row = { candidate: PipelineStage['candidates'][number]; stage: PipelineStage }
const allRows = computed<Row[]>(() =>
  props.stages.flatMap(s => s.candidates.map(c => ({ candidate: c, stage: s }))),
)

const rowsForStage = computed<Row[]>(() =>
  activeStageKey.value === 'all'
    ? allRows.value
    : allRows.value.filter(r => r.stage.key === activeStageKey.value),
)

const filteredRows = computed<Row[]>(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return rowsForStage.value
  return rowsForStage.value.filter(r => r.candidate.name.toLowerCase().includes(q))
})

// Auto-select the first row when the filtered list changes AND the current
// selection isn't in it. If the current selection *is* in it (e.g. user just
// filtered by name), keep it.
watchEffect(() => {
  const rows = filteredRows.value
  if (!rows.length) { selectedCandidateId.value = null; return }
  if (!rows.some(r => r.candidate.id === selectedCandidateId.value)) {
    selectedCandidateId.value = rows[0]!.candidate.id
  }
})

const selectedRow = computed<Row | null>(() => {
  const id = selectedCandidateId.value
  if (!id) return null
  return filteredRows.value.find(r => r.candidate.id === id) ?? null
})

const moveTargets = computed<PipelineStage[]>(() => {
  const currentKey = selectedRow.value?.stage.key
  return props.stages.filter(s => s.key !== currentKey)
})

const nextStage = computed<PipelineStage | null>(() => {
  const currentKey = selectedRow.value?.stage.key
  if (!currentKey) return null
  const idx = props.stages.findIndex(s => s.key === currentKey)
  return idx >= 0 && idx < props.stages.length - 1 ? (props.stages[idx + 1] ?? null) : null
})

// Keyboard: j/k or ↑/↓ move selection in the list.
function onKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  // Don't hijack keys while user is typing into the search field.
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
  const rows = filteredRows.value
  if (!rows.length) return
  const idx = rows.findIndex(r => r.candidate.id === selectedCandidateId.value)
  const step = (dir: 1 | -1) => {
    e.preventDefault()
    const next = idx < 0 ? 0 : Math.min(rows.length - 1, Math.max(0, idx + dir))
    selectedCandidateId.value = rows[next]!.candidate.id
  }
  if (e.key === 'ArrowDown' || e.key === 'j') step(1)
  else if (e.key === 'ArrowUp' || e.key === 'k') step(-1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// Real candidate profile via the same query the /candidates/[id] page uses.
// Cached under ['candidate', id, 'profile'] so navigating from the pipeline
// list to the standalone page or vice-versa is instant. Nullable while the
// query is pending or when no row is selected.
const selectedIdRef = computed(() => selectedCandidateId.value ?? '')
const { data: profile } = useCandidateProfile(selectedIdRef)

/** Rich fields for the right pane, resolved from the fetched profile. Falls
 *  back to the pipeline-card fields when the profile hasn't loaded yet so
 *  the pane never shows an empty header. */
const profileForPane = computed(() => {
  const p = profile.value
  if (!p) return {}
  const headline = p.cv?.title ?? p.jobs[0]?.title
  const tags = p.tags
  const source = p.source
  const summary = p.cv?.summary
  const answers = p.screeningQuestions.map(q => ({ q: q.question, a: q.answer }))
  const contact = { location: p.location, phone: p.phone, email: p.email }
  return { headline, tags, source, summary, answers, contact }
})

/** For the LIST rows we only need light metadata; keep this synchronous. */
function listMetaFor(id: string) {
  // Cheap lookup — if the profile happens to be cached (recently selected)
  // we can enrich the row. Otherwise a sparse row is fine.
  const p = profile.value?.id === id ? profile.value : null
  return {
    headline: p?.cv?.title ?? p?.jobs[0]?.title,
    tags: p?.tags,
    source: p?.source,
  }
}
</script>

<template>
  <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
    <ScreeningStageBar
      :stages="props.stages"
      :active-key="activeStageKey"
      :total-count="totalCount"
      @update:active-key="activeStageKey = $event"
    />

    <div class="flex-1 min-h-0 flex overflow-hidden">
      <!-- LIST COLUMN -->
      <aside
        class="border-r border-[var(--brand-border-fade)] flex flex-col min-h-0 bg-white transition-[width]"
        :class="listCollapsed ? 'w-[52px]' : 'w-[340px]'"
      >
        <div class="flex items-center gap-2 px-3 py-3 border-b border-[var(--brand-border-fade)]">
          <button
            class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
            :aria-label="listCollapsed ? 'Expand candidate list' : 'Collapse candidate list'"
            @click="listCollapsed = !listCollapsed"
          >
            <PanelLeftOpen v-if="listCollapsed" class="w-4 h-4" stroke-width="1.8" />
            <PanelLeftClose v-else class="w-4 h-4" stroke-width="1.8" />
          </button>
          <div v-if="!listCollapsed" class="relative flex-1">
            <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)]" stroke-width="2" />
            <input
              v-model="searchText"
              type="text"
              placeholder="Search by name…"
              class="w-full h-8 pl-8 pr-2 text-[13px] rounded-md bg-[var(--brand-canvas)] border border-transparent focus:border-[var(--brand-teal)] focus:bg-white focus:outline-none transition"
            >
          </div>
          <button
            v-if="!listCollapsed"
            class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
            aria-label="Sort and filter"
          >
            <ArrowUpDown class="w-4 h-4" stroke-width="1.7" />
          </button>
        </div>

        <div v-if="!listCollapsed" class="flex-1 min-h-0 overflow-y-auto">
          <template v-if="filteredRows.length">
            <ScreeningCandidateRow
              v-for="row in filteredRows"
              :key="row.candidate.id"
              :candidate="row.candidate"
              :headline="listMetaFor(row.candidate.id).headline"
              :tags="listMetaFor(row.candidate.id).tags"
              :source="listMetaFor(row.candidate.id).source"
              :created-at="'3 months ago'"
              :selected="row.candidate.id === selectedCandidateId"
              :checked="props.selected.has(row.candidate.id)"
              @select="selectedCandidateId = $event"
              @toggle-check="(id) => emit('toggle-select', id)"
            />
          </template>
          <div v-else class="px-6 py-16 text-center text-[13px] text-[var(--brand-text-quiet)]">
            No candidates in this stage yet.
          </div>
        </div>
      </aside>

      <!-- PROFILE COLUMN -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <template v-if="selectedRow">
          <ScreeningProfilePane
            :candidate="selectedRow.candidate"
            :current-stage="selectedRow.stage"
            :move-targets="moveTargets"
            :next-stage="nextStage"
            :headline="profileForPane.headline"
            :tags="profileForPane.tags"
            :source="profileForPane.source"
            :summary="profileForPane.summary"
            :answers="profileForPane.answers"
            :contact="profileForPane.contact ?? { location: selectedRow.candidate.location ?? undefined }"
            @move="(id, from, to) => emit('move', id, from, to)"
            @disqualify="(id) => emit('move', id, selectedRow!.stage.key, 'rejected')"
            @open-full="(id) => emit('open-full', id)"
          />
        </template>
        <div v-else class="h-full flex items-center justify-center text-[14px] text-[var(--brand-text-quiet)]">
          Select a candidate from the list to review.
        </div>
      </div>
    </div>
  </div>
</template>
