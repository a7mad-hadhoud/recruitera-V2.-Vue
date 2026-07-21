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
import { Search, SlidersHorizontal, PanelLeftClose, PanelLeftOpen, X, ArrowLeftRight, Keyboard } from 'lucide-vue-next'
import type { PipelineStage } from '~/types'
import { useCandidateProfile } from '~/composables/useCandidates'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { useLocalStorage } from '@vueuse/core'
import ScreeningStageBar    from './ScreeningStageBar.vue'
import ScreeningCandidateRow from './ScreeningCandidateRow.vue'
import ScreeningProfilePane from './ScreeningProfilePane.vue'

const props = defineProps<{
  stages: PipelineStage[]
  selected: Set<string>
  qualifiedCount: number
  disqualifiedCount: number
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
const segment = ref<'qual' | 'disq'>('qual')

// Keyboard-hint dismissal persists so power users don't see it again.
// `1` = dismissed. Guard rendering off it AND require a selected candidate.
const kbdHintDismissed = useLocalStorage<0 | 1>('pipeline-screening-kbd-hint', 0)
const showKbdHint = computed(() => kbdHintDismissed.value !== 1)
function dismissKbdHint() { kbdHintDismissed.value = 1 }

// Filter popover state — simple client-side filters over the list
const filtersOpen = ref(false)
const sortBy = ref<'newest' | 'oldest' | 'name' | 'aiScore'>('newest')
const sourceFilter = ref<string>('all')
const dateFilter = ref<'any' | 'week' | 'month' | '3months'>('any')
const availableSources = computed<string[]>(() => {
  const set = new Set<string>()
  for (const s of props.stages) for (const _c of s.candidates) set.add('any')
  return ['all', ...Array.from(set).sort()]
})
const activeFilterCount = computed(() =>
  (sourceFilter.value !== 'all' ? 1 : 0) +
  (dateFilter.value !== 'any' ? 1 : 0) +
  (sortBy.value !== 'newest' ? 1 : 0),
)

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
        <!-- List column header — collapse toggle + Qualified/Disqualified
             segmented (moved here from the page-level sub-toolbar to match
             the Recruitee/Wuzzuf reference where these tabs live above the
             search inside the candidate list). -->
        <div v-if="!listCollapsed" class="border-b border-[var(--brand-border-fade)]">
          <div class="flex items-center gap-2 px-3 pt-3">
            <button
              class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
              aria-label="Collapse candidate list"
              @click="listCollapsed = true"
            >
              <PanelLeftClose class="w-4 h-4" stroke-width="1.8" />
            </button>
            <div role="tablist" class="flex-1 inline-flex items-center bg-[var(--brand-canvas)] rounded-[8px] p-[2px] h-[30px]">
              <button
                role="tab"
                :aria-selected="segment === 'qual'"
                class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[6px] h-[26px] text-[12.5px] font-bold transition"
                :class="segment === 'qual'
                  ? 'bg-white text-[var(--brand-text)] shadow-[0_1px_2px_rgba(0,20,18,0.08)]'
                  : 'text-[var(--brand-text-subtle)] hover:text-[var(--brand-text)]'"
                @click="segment = 'qual'"
              >
                Qualified
                <span class="text-[10.5px] font-bold rounded px-1.5 tabular-nums text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)]">{{ props.qualifiedCount }}</span>
              </button>
              <button
                role="tab"
                :aria-selected="segment === 'disq'"
                class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[6px] h-[26px] text-[12.5px] font-bold transition"
                :class="segment === 'disq'
                  ? 'bg-white text-[var(--brand-text)] shadow-[0_1px_2px_rgba(0,20,18,0.08)]'
                  : 'text-[var(--brand-text-subtle)] hover:text-[var(--brand-text)]'"
                @click="segment = 'disq'"
              >
                Disqualified
                <span class="text-[10.5px] font-bold rounded px-1.5 tabular-nums text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)]">{{ props.disqualifiedCount }}</span>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2 px-3 py-3">
            <div class="relative flex-1">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)]" stroke-width="2" />
              <input
                v-model="searchText"
                type="text"
                placeholder="Search by name, skills, tags…"
                class="w-full h-9 pl-8 pr-2 text-[13px] rounded-[10px] bg-[var(--brand-canvas)] border border-transparent focus:border-[var(--brand-teal)] focus:bg-white focus:outline-none transition"
              >
            </div>
            <!-- Filter popover — Sort, Source, Date range. Client-side today;
                 when the API lands these fold into the ['pipeline', jobId,
                 stageKey, filters] query key. -->
            <Popover v-model:open="filtersOpen">
              <PopoverTrigger as-child>
                <button
                  class="relative w-9 h-9 rounded-[10px] inline-flex items-center justify-center transition"
                  :class="activeFilterCount > 0
                    ? 'bg-[var(--brand-teal)] text-white'
                    : 'bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint)] hover:text-[var(--brand-text)]'"
                  aria-label="Sort and filter"
                >
                  <SlidersHorizontal class="w-4 h-4" stroke-width="1.7" />
                  <span
                    v-if="activeFilterCount > 0"
                    class="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[var(--brand-lime)] text-[var(--brand-teal)] text-[10px] font-bold inline-flex items-center justify-center px-1"
                  >{{ activeFilterCount }}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" class="w-[280px] p-4">
                <div class="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)] mb-1.5">Sort by</div>
                <select v-model="sortBy" class="w-full h-9 px-2.5 mb-4 text-[13px] rounded-[8px] bg-[var(--brand-canvas)] border border-transparent focus:border-[var(--brand-teal)] focus:outline-none">
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="aiScore">AI score</option>
                </select>

                <div class="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)] mb-1.5">Source</div>
                <select v-model="sourceFilter" class="w-full h-9 px-2.5 mb-4 text-[13px] rounded-[8px] bg-[var(--brand-canvas)] border border-transparent focus:border-[var(--brand-teal)] focus:outline-none">
                  <option value="all">Any source</option>
                  <option value="Indeed">Indeed</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">Referral</option>
                  <option value="Careers site">Careers site</option>
                  <option value="Facebook">Facebook</option>
                </select>

                <div class="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)] mb-1.5">Applied</div>
                <select v-model="dateFilter" class="w-full h-9 px-2.5 mb-4 text-[13px] rounded-[8px] bg-[var(--brand-canvas)] border border-transparent focus:border-[var(--brand-teal)] focus:outline-none">
                  <option value="any">Any time</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                  <option value="3months">Past 3 months</option>
                </select>

                <div class="flex items-center gap-2 pt-2 border-t border-[var(--brand-border-fade)]">
                  <button
                    class="flex-1 h-8 rounded-[8px] text-[12.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition"
                    @click="sortBy = 'newest'; sourceFilter = 'all'; dateFilter = 'any'"
                  >Reset</button>
                  <button
                    class="flex-1 h-8 rounded-[8px] text-[12.5px] font-bold bg-[var(--brand-teal)] text-white hover:bg-[color-mix(in_srgb,var(--brand-teal)_92%,white)] transition"
                    @click="filtersOpen = false"
                  >Apply</button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <!-- Collapsed rail (matches kanban's collapsed column) -->
        <div v-else class="flex flex-col items-center gap-2 py-3">
          <button
            class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
            aria-label="Expand candidate list"
            @click="listCollapsed = false"
          >
            <PanelLeftOpen class="w-4 h-4" stroke-width="1.8" />
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
      <div class="flex-1 min-h-0 overflow-hidden relative">
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

        <!-- Keyboard-hint floating pill. Dismissible; persists dismissal
             via localStorage so it stays out of the way for power users. -->
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-150"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showKbdHint && selectedRow"
            class="pointer-events-auto absolute left-1/2 bottom-4 -translate-x-1/2 inline-flex items-center gap-3 bg-[var(--brand-text)] text-white rounded-full pl-4 pr-2 h-10 text-[12.5px] font-semibold shadow-[0_4px_14px_rgba(0,20,18,0.25)]"
          >
            <Keyboard class="w-4 h-4 opacity-80" stroke-width="1.8" />
            <span>Switch candidates with <kbd class="mx-0.5 px-1.5 py-px rounded bg-white/15">↑</kbd><kbd class="mx-0.5 px-1.5 py-px rounded bg-white/15">↓</kbd></span>
            <button
              class="w-7 h-7 rounded-full inline-flex items-center justify-center hover:bg-white/10 transition"
              aria-label="Dismiss keyboard hint"
              @click="dismissKbdHint"
            ><X class="w-3.5 h-3.5" stroke-width="2" /></button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
