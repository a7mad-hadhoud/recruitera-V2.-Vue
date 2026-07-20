<!--
  Jobs list page — mirrors the Candidates page shell so the two feel
  identical: rounded-tl white filter card on the left, flat white content
  panel on the right, brand primitives for every button/pill/badge.
-->
<script setup lang="ts">
import { Zap, Plus, ChevronDown, Check, Rows3, LayoutGrid, MapPin, Globe, Bookmark, MoreHorizontal, Pencil, Megaphone } from 'lucide-vue-next'
import { BrandPageTitle, BrandSearchBar, BrandButton, BrandDataTable, BrandStatusBadge } from '~/components/brand'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import JobsFilters from '~/components/jobs/JobsFilters.vue'
import JobsColumnsPicker from '~/components/jobs/JobsColumnsPicker.vue'
import JobsFiltersPanel from '~/components/jobs/JobsFiltersPanel.vue'
import JobsNewViewPanel, { type ViewVisibility } from '~/components/jobs/JobsNewViewSheet.vue'
import type { Job, JobStatus, CollarType } from '~/types'
import { useJobs } from '~/composables/useJobs'
import { useJobsColumns, type JobColumnKey } from '~/composables/useJobsColumns'
import { useJobsColumnWidths } from '~/composables/useJobsColumnWidths'
import { useJobsFilters, applyJobFilters } from '~/composables/useJobsFilters'

definePageMeta({ layout: 'default' })

const { jobs, setStatus } = useJobs()
const { isVisible: isColVisible } = useJobsColumns()
const { getWidth, setWidth } = useJobsColumnWidths()
const { rows: filterRows, addRow, removeRow, updateRow, clearAll: clearFilters } = useJobsFilters()

// Excel-style drag-to-resize: pointer capture on the column's right edge.
const resizingCol = ref<JobColumnKey | null>(null)
let resizeStartX = 0
let resizeStartWidth = 0

function onResizeStart(col: JobColumnKey, e: PointerEvent) {
  resizingCol.value = col
  resizeStartX = e.clientX
  resizeStartWidth = getWidth(col)
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', onResizeEnd)
  e.preventDefault()
}
function onResizeMove(e: PointerEvent) {
  if (!resizingCol.value) return
  setWidth(resizingCol.value, resizeStartWidth + (e.clientX - resizeStartX))
}
function onResizeEnd() {
  resizingCol.value = null
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', onResizeEnd)
}
onBeforeUnmount(onResizeEnd)

function widthStyle(col: JobColumnKey) {
  const w = `${getWidth(col)}px`
  return { width: w, minWidth: w }
}

// New-view mode swaps the JobsFilters sidebar column for the New View editor.
const newViewOpen = ref(false)

// Table vs card view mode.
const viewMode = ref<'table' | 'cards'>('table')

// Saved views (in-memory for now).
type SavedView = { id: string; title: string; visibility: ViewVisibility }
const savedViews = ref<SavedView[]>([])
const selectedSavedViewId = ref<string | null>(null)

function onSaveView(payload: { title: string; visibility: ViewVisibility }) {
  const view: SavedView = { id: `v${Date.now()}`, title: payload.title, visibility: payload.visibility }
  savedViews.value = [...savedViews.value, view]
  selectedSavedViewId.value = view.id
  newViewOpen.value = false
}
function onSelectSavedView(id: string) {
  selectedSavedViewId.value = id
}

type ViewKey = 'all' | 'followed' | 'involved' | 'active' | 'archived' | 'draft' | 'closed'
type CollarTab = 'all' | 'white' | 'blue'

const activeView = ref<ViewKey>('all')
const collarTab  = ref<CollarTab>('all')
const search     = ref('')

// Clear the saved-view selection whenever a predefined view is picked, so the
// header title reflects the currently active filter.
watch(activeView, () => { selectedSavedViewId.value = null })

const VIEW_LABELS: Record<ViewKey, string> = {
  all:      'All',
  followed: 'Followed',
  involved: "I'm involved in",
  active:   'Active',
  archived: 'Archived',
  draft:    'Draft',
  closed:   'Closed',
}

const activeViewName = computed(() => {
  if (selectedSavedViewId.value) {
    const v = savedViews.value.find(sv => sv.id === selectedSavedViewId.value)
    if (v) return v.title
  }
  return VIEW_LABELS[activeView.value]
})

// Predefined view filter
function matchesView(j: Job, key: ViewKey): boolean {
  switch (key) {
    case 'all':      return true
    case 'followed': return false                       // TODO wire when Followed store exists
    case 'involved': return false                       // TODO wire when Involvement store exists
    case 'active':   return j.status === 'published' || j.status === 'internal'
    case 'archived': return j.status === 'archived'
    case 'draft':    return j.status === 'draft'
    case 'closed':   return j.status === 'closed'
  }
}

const viewCounts = computed<Record<ViewKey, number>>(() => ({
  all:      jobs.value.length,
  followed: jobs.value.filter(j => matchesView(j, 'followed')).length,
  involved: jobs.value.filter(j => matchesView(j, 'involved')).length,
  active:   jobs.value.filter(j => matchesView(j, 'active')).length,
  archived: jobs.value.filter(j => matchesView(j, 'archived')).length,
  draft:    jobs.value.filter(j => matchesView(j, 'draft')).length,
  closed:   jobs.value.filter(j => matchesView(j, 'closed')).length,
}))

const filteredJobs = computed(() => {
  const term = search.value.trim().toLowerCase()
  const preFilter = jobs.value.filter((j) => {
    if (!matchesView(j, activeView.value)) return false
    if (collarTab.value !== 'all' && j.collar !== collarTab.value) return false
    if (term && !j.title.toLowerCase().includes(term)) return false
    return true
  })
  return applyJobFilters(preFilter, filterRows.value)
})

// Status column: verb-style label + design-system dot color.
// Dropdown lets the user change a row's status inline.
const STATUS_META: Record<JobStatus, { label: string; dot: string }> = {
  published: { label: 'Publish',        dot: 'var(--brand-status-approved-text)' },
  internal:  { label: 'Use Internally', dot: 'var(--brand-status-teal-green)' },
  draft:     { label: 'Draft',          dot: 'var(--brand-text-quiet)' },
  closed:    { label: 'Close',          dot: 'var(--brand-status-closed-text)' },
  archived:  { label: 'Archived',       dot: 'var(--brand-text-faint)' },
}
const STATUS_OPTIONS: JobStatus[] = ['published', 'internal', 'draft', 'closed', 'archived']

const WORK_MODEL_LABEL: Record<Job['workModel'], string> = {
  'on-site': 'On-site',
  remote:    'Remote',
  hybrid:    'Hybrid',
}

const COLLAR_LABEL: Record<CollarType, string> = { white: 'White collar', blue: 'Blue collar' }

const collarTabs: { key: CollarTab; label: string }[] = [
  { key: 'all',   label: 'All' },
  { key: 'white', label: 'White' },
  { key: 'blue',  label: 'Blue' },
]

const slotsLeft = 5
</script>

<template>
  <div class="flex h-full overflow-hidden bg-[var(--brand-canvas)]">
    <!-- Sidebar column: default view list, or the inline New View editor. -->
    <JobsNewViewPanel
      v-if="newViewOpen"
      @cancel="newViewOpen = false"
      @save="onSaveView"
    />
    <JobsFilters
      v-else
      :active="activeView"
      :counts="viewCounts"
      :saved-views="savedViews"
      :selected-saved-view-id="selectedSavedViewId"
      @update:active="(k) => (activeView = k)"
      @new-view="newViewOpen = true"
      @select-view="onSelectSavedView"
    />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--brand-surface-white)] border-t border-[var(--brand-border)]">
      <!-- Page header bar: view name + slots + Add job. White bg + bottom line. -->
      <div class="flex items-center gap-3 px-6 py-4 border-b border-[var(--brand-border-fade)]">
        <h1 class="text-[20px] font-bold text-[var(--brand-text)] tracking-tight flex-1 min-w-0 truncate">
          {{ activeViewName }}
        </h1>
        <button
          class="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-[var(--brand-status-pending-bg)] text-[var(--brand-status-pending-text)] text-[13px] font-semibold hover:brightness-95 transition"
        >
          <Zap class="w-3.5 h-3.5" stroke-width="2" />
          {{ slotsLeft }} slots left
        </button>
        <BrandButton variant="primary-teal">
          <Plus class="w-4 h-4 mr-1" stroke-width="2.5" />
          Add job
        </BrandButton>
      </div>

      <!-- Collar tabs + search + Filters/Columns + view-mode toggle -->
      <div class="flex items-center gap-3 px-6 pt-3 pb-3">
        <div class="inline-flex bg-[var(--brand-canvas)] rounded-[10px] p-1 gap-1">
          <button
            v-for="t in collarTabs"
            :key="t.key"
            class="px-3 h-8 rounded-md text-[13px] font-semibold transition"
            :class="collarTab === t.key
              ? 'bg-white text-[var(--brand-text)] shadow-[0_1px_2px_rgba(0,20,18,0.06)]'
              : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'"
            @click="collarTab = t.key"
          >
            {{ t.label }}
          </button>
        </div>

        <div class="flex-1" />

        <div class="w-[280px]">
          <BrandSearchBar v-model="search" placeholder="Search jobs..." />
        </div>
        <JobsFiltersPanel
          :rows="filterRows"
          :result-count="filteredJobs.length"
          @add="addRow"
          @remove="(id) => removeRow(id)"
          @update="(id, patch) => updateRow(id, patch)"
          @clear="clearFilters"
        />
        <JobsColumnsPicker />

        <!-- Table / cards toggle -->
        <div class="inline-flex bg-[var(--brand-canvas)] rounded-[10px] p-1 gap-0.5 border border-[var(--brand-border-light)]">
          <button
            class="w-8 h-7 rounded-md flex items-center justify-center transition"
            :class="viewMode === 'table'
              ? 'bg-white text-[var(--brand-text)] shadow-[0_1px_2px_rgba(0,20,18,0.06)]'
              : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'"
            aria-label="Table view"
            @click="viewMode = 'table'"
          >
            <Rows3 class="w-4 h-4" stroke-width="1.8" />
          </button>
          <button
            class="w-8 h-7 rounded-md flex items-center justify-center transition"
            :class="viewMode === 'cards'
              ? 'bg-white text-[var(--brand-text)] shadow-[0_1px_2px_rgba(0,20,18,0.06)]'
              : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'"
            aria-label="Card view"
            @click="viewMode = 'cards'"
          >
            <LayoutGrid class="w-4 h-4" stroke-width="1.8" />
          </button>
        </div>
      </div>

      <!-- Sample data banner (matches Candidates pattern) -->
      <div class="px-6 pb-3">
        <div class="flex items-center gap-2 px-4 py-3 rounded-[10px] bg-[var(--brand-lime-tint)] text-[13px] text-[var(--brand-text-secondary)]">
          <span class="w-4 h-4 rounded-full bg-[var(--brand-teal)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">i</span>
          Your company account is filled with sample candidates, talent pools, and jobs. When you're ready to start hiring, you can
          <button class="font-semibold underline">remove the sample data</button>.
        </div>
      </div>

      <!-- Table — same chrome as CandidatesTable: sticky canvas header,
           column dividers, zebra rows, lime-tint hover/selected, drag-to-resize. -->
      <div v-if="viewMode === 'table'" class="flex-1 overflow-auto px-6 pb-6">
        <BrandDataTable>
          <template #header>
            <TableHeader class="sticky top-0 z-10 bg-[var(--brand-canvas)]">
              <TableRow class="hover:bg-transparent border-b border-[var(--brand-border)]">
                <TableHead
                  v-for="col in (['title','status','cands','hired','dept','location','workmodel','tags'] as JobColumnKey[])"
                  v-show="isColVisible(col)"
                  :key="col"
                  class="relative text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap border-r border-[var(--brand-border-fade)] last:border-r-0"
                  :style="widthStyle(col)"
                >
                  {{ ({
                    title: 'Title', status: 'Status', cands: 'Candidates', hired: 'Hires',
                    dept: 'Department', location: 'Location', workmodel: 'Work model', tags: 'Tags',
                  } as Record<JobColumnKey, string>)[col] }}
                  <div
                    class="absolute top-0 right-0 bottom-0 w-1.5 -mr-[3px] cursor-col-resize z-10 select-none"
                    :class="resizingCol === col ? 'bg-[var(--brand-teal)]' : 'hover:bg-[var(--brand-teal)]/40'"
                    @pointerdown="(e: PointerEvent) => onResizeStart(col, e)"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
          </template>

          <TableBody>
            <TableRow
              v-for="(j, i) in filteredJobs"
              :key="j.id"
              class="min-h-12 border-b border-[var(--brand-border-light)] cursor-pointer hover:bg-[var(--brand-lime-tint)]/40"
              :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
            >
              <TableCell
                class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[14px] font-semibold text-[var(--brand-text)]"
                :style="widthStyle('title')"
              >
                {{ j.title }}
              </TableCell>

              <!-- Status: dot + verb label + chevron; click to change. -->
              <TableCell
                class="align-middle py-2 border-r border-[var(--brand-border-fade)]"
                :style="widthStyle('status')"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <button
                      class="inline-flex items-center gap-2 h-8 pl-2 pr-1.5 rounded-md text-[13.5px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)]/50 transition"
                      @click.stop
                    >
                      <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: STATUS_META[j.status].dot }" />
                      {{ STATUS_META[j.status].label }}
                      <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)] shrink-0" stroke-width="2" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" class="w-[180px] p-1">
                    <DropdownMenuItem
                      v-for="opt in STATUS_OPTIONS"
                      :key="opt"
                      class="flex items-center gap-2 px-2 py-1.5 text-[13.5px] cursor-pointer"
                      @select="setStatus(j.id, opt)"
                    >
                      <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: STATUS_META[opt].dot }" />
                      <span class="flex-1">{{ STATUS_META[opt].label }}</span>
                      <Check
                        v-if="opt === j.status"
                        class="w-3.5 h-3.5 text-[var(--brand-status-approved-text)] shrink-0"
                        stroke-width="2.5"
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>

              <TableCell
                v-if="isColVisible('cands')"
                class="align-top py-3 border-r border-[var(--brand-border-fade)]"
                :style="widthStyle('cands')"
              >
                <div class="flex items-center gap-1.5 text-[13px] text-[var(--brand-text)]">
                  {{ j.candidateCount }}
                  <span v-if="j.newCandidates > 0" class="text-[12px] font-semibold text-[var(--brand-status-approved-text)]">+{{ j.newCandidates }}</span>
                </div>
              </TableCell>
              <TableCell v-if="isColVisible('hired')"     class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text)]"        :style="widthStyle('hired')">{{ j.hires }}</TableCell>
              <TableCell v-if="isColVisible('dept')"      class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)]" :style="widthStyle('dept')">{{ j.department ?? '—' }}</TableCell>
              <TableCell v-if="isColVisible('location')"  class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)]" :style="widthStyle('location')">{{ j.location ?? '—' }}</TableCell>
              <TableCell v-if="isColVisible('workmodel')" class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)]" :style="widthStyle('workmodel')">{{ WORK_MODEL_LABEL[j.workModel] }}</TableCell>
              <TableCell v-if="isColVisible('tags')" class="align-top py-3" :style="widthStyle('tags')">
                <BrandStatusBadge
                  variant="solid"
                  :tone="j.collar === 'white' ? 'neutral' : 'pipeline-blue'"
                  :label="COLLAR_LABEL[j.collar]"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </BrandDataTable>

        <div v-if="!filteredJobs.length" class="py-16 text-center text-[13.5px] text-[var(--brand-text-quiet)]">
          No jobs match this view.
        </div>
      </div>

      <!-- Card view — each job as its own card, matching the Recruitee mock. -->
      <div v-else class="flex-1 overflow-auto px-6 pb-6 flex flex-col gap-3">
        <article
          v-for="j in filteredJobs"
          :key="j.id"
          class="rounded-[14px] border border-[var(--brand-border-light)] bg-white p-5 hover:shadow-[0_2px_8px_rgba(0,20,18,0.06)] transition-shadow"
        >
          <!-- Top row: title + id + action buttons -->
          <div class="flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-[16px] font-bold text-[var(--brand-text)]">{{ j.title }}</h3>
                <span class="text-[11.5px] font-mono text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)] px-1.5 py-0.5 rounded">#{{ j.id }}</span>
              </div>
              <div class="mt-1.5 flex items-center gap-3 text-[13px] text-[var(--brand-text-muted)]">
                <span v-if="j.location" class="inline-flex items-center gap-1">
                  <MapPin class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                  {{ j.location }}
                </span>
                <span class="text-[var(--brand-text-faint)]">•</span>
                <span class="inline-flex items-center gap-1">
                  <Globe class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                  {{ WORK_MODEL_LABEL[j.workModel] }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button class="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)]/50 transition">
                <Megaphone class="w-3.5 h-3.5" stroke-width="1.8" />
                Promote
              </button>
              <button class="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)]/50 transition">
                <Pencil class="w-3.5 h-3.5" stroke-width="1.8" />
                Edit
              </button>
              <button class="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint)]/50 transition">
                <MoreHorizontal class="w-4 h-4" stroke-width="1.8" />
              </button>
            </div>
          </div>

          <!-- Bottom row: candidates count + follow + status -->
          <div class="mt-4 pt-3 border-t border-[var(--brand-border-fade)] flex items-center gap-4 text-[13px]">
            <div class="flex-1 text-[var(--brand-text-secondary)]">
              <span class="text-[15px] font-bold text-[var(--brand-text)]">{{ j.candidateCount }}</span>
              <span class="ml-1">Qualified candidates</span>
            </div>
            <span class="inline-flex items-center gap-1.5 text-[var(--brand-status-approved-text)] font-semibold">
              <Bookmark class="w-3.5 h-3.5 fill-current" stroke-width="1.7" />
              Following
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  class="inline-flex items-center gap-2 h-7 px-2 rounded-md text-[13px] font-semibold hover:bg-[var(--brand-lime-tint)]/50 transition"
                  :style="{ color: STATUS_META[j.status].dot }"
                  @click.stop
                >
                  <span class="w-2 h-2 rounded-full" :style="{ background: STATUS_META[j.status].dot }" />
                  {{ STATUS_META[j.status].label }}
                  <ChevronDown class="w-3 h-3" stroke-width="2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-[180px] p-1">
                <DropdownMenuItem
                  v-for="opt in STATUS_OPTIONS"
                  :key="opt"
                  class="flex items-center gap-2 px-2 py-1.5 text-[13.5px] cursor-pointer"
                  @select="setStatus(j.id, opt)"
                >
                  <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: STATUS_META[opt].dot }" />
                  <span class="flex-1">{{ STATUS_META[opt].label }}</span>
                  <Check
                    v-if="opt === j.status"
                    class="w-3.5 h-3.5 text-[var(--brand-status-approved-text)] shrink-0"
                    stroke-width="2.5"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </article>

        <div v-if="!filteredJobs.length" class="py-16 text-center text-[13.5px] text-[var(--brand-text-quiet)]">
          No jobs match this view.
        </div>
      </div>
    </div>

  </div>
</template>
