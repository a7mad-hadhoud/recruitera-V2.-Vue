<!--
  Jobs list page — mirrors the Candidates page shell so the two feel
  identical: rounded-tl white filter card on the left, flat white content
  panel on the right, brand primitives for every button/pill/badge.
-->
<script setup lang="ts">
import { Plus, Rows3, LayoutGrid, Bookmark, MoreHorizontal, Pencil, Megaphone, Copy, Archive, MessageSquare, Folder, Trash2, UserPlus, ChevronDown, Globe, Users, Lock, Check } from 'lucide-vue-next'
import { refDebounced, useLocalStorage } from '@vueuse/core'
import { BrandPageTitle, BrandSearchBar, BrandButton, BrandDataTable, BrandStatusBadge, BrandAvatarInitials } from '~/components/brand'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import JobsColumnsPicker from '~/components/jobs/JobsColumnsPicker.vue'
import JobsFiltersPanel from '~/components/jobs/JobsFiltersPanel.vue'
import JobCard from '~/components/jobs/JobCard.vue'
import type { ViewVisibility, ViewMode as SavedViewMode } from '~/components/jobs/JobsNewViewSheet.vue'
import JobStatusMenu from '~/components/jobs/JobStatusMenu.vue'
import CandidatesPerPage from '~/components/candidates/CandidatesPerPage.vue'
import AddJobModal, { type AddJobPayload } from '~/components/jobs/AddJobModal.vue'
import type { Job, JobStatus, CollarType } from '~/types'
import { useJobs } from '~/composables/useJobs'
import { useJobsColumns, type JobColumnKey } from '~/composables/useJobsColumns'
import { useJobsColumnWidths } from '~/composables/useJobsColumnWidths'
import { useJobsFilters, applyJobFilters, type JobFilterRow } from '~/composables/useJobsFilters'

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

// "2026-07-24" → "Jul 24, 2026"
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

// New-view mode swaps the JobsFilters sidebar column for the New View editor.
const newViewOpen = ref(false)

// Table vs card view mode — persisted so the choice sticks across visits.
const viewMode = useLocalStorage<'table' | 'cards'>('recruitera:jobs:view-mode', 'table')

// Add-job modal — 3-way chooser (template ↔ blank ↔ duplicate). Submitting
// the modal routes into /jobs/new pre-filled from query params; the editor
// page owns creation via POST /api/jobs when the endpoint lands.
const addJobOpen = ref(false)
async function onCreateJob(payload: AddJobPayload) {
  const query: Record<string, string> = {}
  if (payload.source === 'blank') {
    if (payload.title)  query.title = payload.title
    if (payload.collar) query.collar = payload.collar
  } else if (payload.source === 'template' && payload.templateId) {
    query.template = payload.templateId
  } else if (payload.source === 'duplicate' && payload.sourceJobId) {
    query.duplicate = payload.sourceJobId
    if (payload.title)  query.title = payload.title
    if (payload.collar) query.collar = payload.collar
  }
  await navigateTo({ path: '/jobs/new', query })
}

// Saved views — a view snapshots the CURRENT scope + collar + search +
// filters, so re-selecting it re-applies exactly that combination.
type SavedView = {
  id: string; title: string; visibility: ViewVisibility; mode: SavedViewMode
  scope: ViewKey; collar: CollarTab; search: string; filters: JobFilterRow[]
}
const savedViews = ref<SavedView[]>([])
const selectedSavedViewId = ref<string | null>(null)
let restoringView = false

function submitNewView() {
  if (!nvTitle.value.trim()) return
  const view: SavedView = {
    id: `v${Date.now()}`,
    title: nvTitle.value.trim(),
    visibility: nvVis.value,
    mode: nvMode.value,
    scope: activeView.value,
    collar: collarTab.value,
    search: searchInput.value,
    filters: filterRows.value.map(r => ({ ...r, values: [...r.values] })),
  }
  savedViews.value = [...savedViews.value, view]
  selectedSavedViewId.value = view.id
  viewMode.value = view.mode === 'table' ? 'table' : 'cards'
  nvTitle.value = ''; nvMode.value = 'list'; nvVis.value = 'me'; nvOpen.value = false
}
function onSelectSavedView(id: string) {
  const v = savedViews.value.find(sv => sv.id === id)
  if (!v) return
  restoringView = true
  activeView.value = v.scope
  collarTab.value = v.collar
  searchInput.value = v.search
  filterRows.value = v.filters.map(r => ({ ...r, values: [...r.values] }))
  viewMode.value = v.mode === 'table' ? 'table' : 'cards'
  selectedSavedViewId.value = id
  nextTick(() => { restoringView = false })
}

// The "＋ New view" chip highlights when there's an unsaved narrowing worth
// saving — a search, active filters, a non-All scope tab, or a collar filter.
const hasActiveState = computed(() =>
  searchInput.value.trim().length > 0
  || filterRows.value.some(r => r.values.length > 0)
  || activeView.value !== 'all'
  || collarTab.value !== 'all',
)

type ViewKey = 'all' | 'followed' | 'involved' | 'active' | 'archived' | 'draft' | 'closed'
type CollarTab = 'all' | 'white' | 'blue'

const activeView = ref<ViewKey>('all')
const collarTab  = ref<CollarTab>('all')

// 250ms debounce on the search input. Feels instant to the user but avoids
// re-running the filter/sort chain on every keystroke — matters more once
// the fixture is replaced by a Vue Query call.
const searchInput = ref('')
const search      = refDebounced(searchInput, 250)

// Manually changing scope / collar / search / filters means the user has
// diverged from any saved view — drop the selection (unless we're restoring one).
watch([activeView, collarTab, searchInput, filterRows], () => {
  if (!restoringView) selectedSavedViewId.value = null
}, { deep: true })

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

// Pagination — mirrors the Candidates page (count + per-page + prev/next).
const jobsPerPage = useLocalStorage('recruitera:jobs:per-page', 25)
const jobsPage = ref(1)
const totalJobPages = computed(() => Math.max(1, Math.ceil(filteredJobs.value.length / jobsPerPage.value)))
const pagedJobs = computed(() => {
  const start = (jobsPage.value - 1) * jobsPerPage.value
  return filteredJobs.value.slice(start, start + jobsPerPage.value)
})
const pageStart = computed(() => filteredJobs.value.length ? (jobsPage.value - 1) * jobsPerPage.value + 1 : 0)
const pageEnd = computed(() => Math.min(jobsPage.value * jobsPerPage.value, filteredJobs.value.length))
function onJobsPerPage(n: number) { jobsPerPage.value = n; jobsPage.value = 1 }
function onJobsPage(n: number) { jobsPage.value = Math.min(Math.max(1, n), totalJobPages.value) }
watch([filteredJobs, jobsPerPage], () => { if (jobsPage.value > totalJobPages.value) jobsPage.value = totalJobPages.value })

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

// Scope tabs replace the old left "Predefined views" sidebar.
const SCOPE_TABS: ViewKey[] = ['all', 'followed', 'involved', 'active', 'archived', 'draft', 'closed']

// New view — opens as a popover anchored to the chip (same behaviour as Filters).
const nvOpen = ref(false)
const nvTitle = ref('')
const nvMode = ref<SavedViewMode>('list')
const nvVis = ref<ViewVisibility>('me')
const NV_MODES: { key: SavedViewMode; label: string }[] = [{ key: 'list', label: 'List' }, { key: 'table', label: 'Table' }]
// Standard Visibility Options — same set used across the app (icon + label + desc).
const NV_VIS: { key: ViewVisibility; label: string; short: string; desc: string; icon: any }[] = [
  { key: 'everyone', label: 'Everyone at Recruitera', short: 'Visible to everyone',  desc: 'Visible to all team members',                icon: Globe },
  { key: 'selected', label: 'Selected team members',  short: 'Visible to selected',  desc: 'Visible only to selected people and roles',  icon: Users },
  { key: 'me',       label: 'Only me',                short: 'Visible only to me',   desc: 'Visible only to you',                        icon: Lock },
]
const nvVisMeta = computed(() => NV_VIS.find(v => v.key === nvVis.value) ?? NV_VIS[2]!)
const nvVisOpen = ref(false)
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden bg-[var(--brand-canvas)]">
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-white rounded-tl-[22px] border-t border-l border-[var(--brand-border)]">
      <!-- Page header bar: title + slots + Add job. White bg + bottom line. -->
      <div class="flex items-center gap-3 px-6 py-4 bg-white border-b border-[var(--brand-border-fade)]">
        <h1 class="text-[20px] font-bold text-[var(--brand-text)] tracking-tight flex-1 min-w-0 truncate">
          Jobs
        </h1>
        <BrandButton variant="outline">
          {{ slotsLeft }} slots left
          <ChevronDown class="w-3.5 h-3.5 ml-1.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
        </BrandButton>
        <BrandButton variant="primary-teal" @click="addJobOpen = true">
          <Plus class="w-4 h-4 mr-1" stroke-width="2.5" />
          Add job
        </BrandButton>
      </div>

      <!-- Add-job chooser (Template ↔ Blank). Rendered here so it's
           reachable from anywhere on the page; state lives in setup. -->
      <AddJobModal v-model:open="addJobOpen" @create="onCreateJob" />

      <!-- Scope tabs (replace the old left sidebar) + saved views + New view -->
      <div class="flex items-center gap-1 px-6 border-b border-[var(--brand-border-fade)] overflow-x-auto shrink-0">
        <button
          v-for="k in SCOPE_TABS"
          :key="k"
          class="shrink-0 inline-flex items-center gap-1.5 px-3 py-3 text-[13.5px] font-semibold transition border-b-2"
          :class="activeView === k && !selectedSavedViewId
            ? 'text-[var(--brand-text)] border-[var(--brand-teal)]'
            : 'text-[var(--brand-text-quiet)] border-transparent hover:text-[var(--brand-text)]'"
          @click="activeView = k"
        >
          {{ VIEW_LABELS[k] }}
          <span class="text-[11px] font-bold text-[var(--brand-text-faint)]">{{ viewCounts[k] }}</span>
        </button>

        <!-- Saved views -->
        <button
          v-for="sv in savedViews"
          :key="sv.id"
          class="shrink-0 inline-flex items-center gap-1.5 px-3 py-3 text-[13.5px] font-semibold transition border-b-2"
          :class="selectedSavedViewId === sv.id
            ? 'text-[var(--brand-text)] border-[var(--brand-teal)]'
            : 'text-[var(--brand-text-quiet)] border-transparent hover:text-[var(--brand-text)]'"
          @click="onSelectSavedView(sv.id)"
        >
          <Bookmark class="w-3.5 h-3.5" stroke-width="1.8" />
          {{ sv.title }}
        </button>

        <!-- ＋ New view — popover anchored to the chip (Filters-style) -->
        <Popover v-model:open="nvOpen">
          <PopoverTrigger as-child>
            <button
              class="shrink-0 ml-1 my-2 inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[13px] font-bold transition border-[1.5px]"
              :class="hasActiveState && !selectedSavedViewId
                ? 'border-[var(--brand-teal)] bg-[var(--brand-lime)] text-[var(--brand-teal)] shadow-[0_1px_3px_rgba(0,20,18,0.14)]'
                : 'border-dashed border-[var(--brand-teal)] text-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]'"
            >
              <Plus class="w-3.5 h-3.5" stroke-width="2.4" />
              {{ hasActiveState && !selectedSavedViewId ? 'Save this view' : 'New view' }}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            :side-offset="8"
            class="w-[300px] p-0 rounded-[16px] border border-[var(--brand-border-light)] shadow-[0_12px_40px_rgba(0,20,18,0.18)]"
          >
            <div class="px-4 pt-4 pb-3">
              <div class="text-[15px] font-bold text-[var(--brand-text)] mb-3">New view</div>
              <input
                v-model="nvTitle"
                placeholder="Enter a view title"
                class="w-full h-10 px-3 text-[13.5px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition mb-3"
                @keydown.enter="submitNewView"
              >
              <div class="grid grid-cols-2 gap-2 mb-3">
                <button
                  v-for="m in NV_MODES"
                  :key="m.key"
                  type="button"
                  class="h-9 rounded-[9px] border-[1.5px] text-[13px] font-bold transition"
                  :class="nvMode === m.key
                    ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)] text-[var(--brand-text)]'
                    : 'border-[var(--brand-border)] bg-white text-[var(--brand-text-secondary)] hover:border-[var(--brand-teal)]'"
                  @click="nvMode = m.key"
                >{{ m.label }}</button>
              </div>
              <label class="block text-[12px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Visibility</label>
              <DropdownMenu v-model:open="nvVisOpen">
                <DropdownMenuTrigger as-child>
                  <button type="button" class="w-full h-10 px-3 flex items-center justify-between gap-2 text-[13.5px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white hover:border-[var(--brand-teal)] transition">
                    <span class="inline-flex items-center gap-2 text-[var(--brand-text)]">
                      <component :is="nvVisMeta.icon" class="w-4 h-4 text-[var(--brand-text-secondary)]" stroke-width="1.8" />
                      {{ nvVisMeta.short }}
                    </span>
                    <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-[300px] p-1 rounded-[12px]">
                  <div class="px-2.5 pt-1.5 pb-1 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)]">Visibility Options</div>
                  <DropdownMenuItem
                    v-for="v in NV_VIS"
                    :key="v.key"
                    class="flex items-start gap-3 px-2.5 py-2 rounded-md cursor-pointer"
                    @click="nvVis = v.key"
                  >
                    <component :is="v.icon" class="w-4 h-4 mt-0.5 text-[var(--brand-text-secondary)] shrink-0" stroke-width="1.8" />
                    <div class="flex-1 min-w-0">
                      <div class="text-[13.5px] font-bold text-[var(--brand-text)]">{{ v.label }}</div>
                      <div class="text-[12px] text-[var(--brand-text-quiet)] leading-snug">{{ v.desc }}</div>
                    </div>
                    <Check v-if="nvVis === v.key" class="w-4 h-4 text-[var(--brand-teal)] mt-0.5 shrink-0" stroke-width="2.4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--brand-border-fade)]">
              <button type="button" class="px-3 h-9 rounded-[9px] text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition" @click="nvOpen = false">Cancel</button>
              <button type="button" class="px-4 h-9 rounded-[9px] text-[13px] font-bold bg-[var(--brand-teal)] text-white disabled:opacity-40 disabled:pointer-events-none transition" :disabled="!nvTitle.trim()" @click="submitNewView">Save view</button>
            </div>
          </PopoverContent>
        </Popover>
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
          <BrandSearchBar v-model="searchInput" placeholder="Search jobs..." />
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
      <div v-if="viewMode === 'table'" class="flex-1 overflow-auto px-6 pt-4 pb-6 bg-white">
        <BrandDataTable>
          <template #header>
            <TableHeader class="sticky top-0 z-10 bg-[var(--brand-canvas)]">
              <TableRow class="hover:bg-transparent border-b border-[var(--brand-border)]">
                <TableHead
                  v-for="col in (['title','status','cands','hired','dept','created','assigned','location','workmodel','tags','manage'] as JobColumnKey[])"
                  v-show="isColVisible(col)"
                  :key="col"
                  class="relative text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap border-r border-[var(--brand-border-fade)] last:border-r-0"
                  :style="widthStyle(col)"
                >
                  {{ ({
                    title: 'Title', status: 'Status', cands: 'Candidates', hired: 'Hired',
                    dept: 'Department', created: 'Creation date', assigned: 'Assigned to',
                    location: 'Location', workmodel: 'Work model', tags: 'Tags',
                    manage: 'Manage',
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
              v-for="(j, i) in pagedJobs"
              :key="j.id"
              class="min-h-14 border-b border-[var(--brand-border-light)] cursor-pointer hover:bg-[var(--brand-lime-tint)]/40"
              
            >
              <TableCell
                class="align-top py-4 border-r border-[var(--brand-border-fade)] text-[14px] font-semibold"
                :style="widthStyle('title')"
              >
                <NuxtLink
                  :to="`/jobs/${j.id}`"
                  class="text-[var(--brand-text)] hover:text-[var(--brand-teal)] hover:underline"
                >{{ j.title }}</NuxtLink>
              </TableCell>

              <!-- Status: dot + verb label + chevron; click to change. -->
              <TableCell
                class="align-middle py-3 border-r border-[var(--brand-border-fade)]"
                :style="widthStyle('status')"
              >
                <JobStatusMenu
                  :model-value="j.status"
                  @update:model-value="(s) => setStatus(j.id, s)"
                />
              </TableCell>

              <TableCell
                v-if="isColVisible('cands')"
                class="align-top py-4 border-r border-[var(--brand-border-fade)]"
                :style="widthStyle('cands')"
              >
                <div class="text-[13px] text-[var(--brand-text)]">{{ j.candidateCount }}</div>
              </TableCell>
              <TableCell v-if="isColVisible('hired')"     class="align-top py-4 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text)]"        :style="widthStyle('hired')">{{ j.hires }}</TableCell>
              <TableCell v-if="isColVisible('dept')"      class="align-top py-4 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)]" :style="widthStyle('dept')">{{ j.department ?? '—' }}</TableCell>

              <!-- Creation date -->
              <TableCell v-if="isColVisible('created')" class="align-top py-4 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)] whitespace-nowrap" :style="widthStyle('created')">{{ formatDate(j.createdAt) }}</TableCell>

              <!-- Assigned to — overlapping avatars, or a dashed +add when empty -->
              <TableCell v-if="isColVisible('assigned')" class="align-middle py-3 border-r border-[var(--brand-border-fade)]" :style="widthStyle('assigned')">
                <div class="flex items-center">
                  <template v-if="j.assignees.length">
                    <div class="flex items-center -space-x-2">
                      <BrandAvatarInitials
                        v-for="(a, ai) in j.assignees.slice(0, 3)"
                        :key="ai"
                        :initials="a.initials"
                        :bg="a.bg"
                        :color="a.color"
                        size="md"
                        class="ring-2 ring-white"
                        :title="a.name"
                      />
                    </div>
                    <span v-if="j.assignees.length > 3" class="ml-1.5 text-[12px] font-semibold text-[var(--brand-text-quiet)]">+{{ j.assignees.length - 3 }}</span>
                  </template>
                  <button
                    v-else
                    type="button"
                    class="w-8 h-8 rounded-full border-[1.5px] border-dashed border-[var(--brand-border)] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)] transition"
                    aria-label="Assign member"
                    @click.stop
                  >
                    <UserPlus class="w-3.5 h-3.5" stroke-width="1.8" />
                  </button>
                </div>
              </TableCell>
              <TableCell v-if="isColVisible('location')"  class="align-top py-4 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)]" :style="widthStyle('location')">{{ j.location ?? '—' }}</TableCell>
              <TableCell v-if="isColVisible('workmodel')" class="align-top py-4 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)]" :style="widthStyle('workmodel')">{{ WORK_MODEL_LABEL[j.workModel] }}</TableCell>
              <TableCell v-if="isColVisible('tags')" class="align-top py-4 border-r border-[var(--brand-border-fade)]" :style="widthStyle('tags')">
                <BrandStatusBadge
                  variant="solid"
                  :tone="j.collar === 'white' ? 'neutral' : 'pipeline-blue'"
                  :label="COLLAR_LABEL[j.collar]"
                />
              </TableCell>

              <!-- Manage: Following · Cross-post · Edit · ⋯ menu.
                   Same actions as the card view so both layouts feel identical. -->
              <TableCell v-if="isColVisible('manage')" class="align-middle py-3" :style="widthStyle('manage')">
                <div class="flex items-center gap-0.5">
                  <button
                    class="w-7 h-7 rounded-md flex items-center justify-center text-[var(--brand-status-approved-text)] hover:bg-[var(--brand-lime-tint)]/50 transition"
                    title="Following"
                  >
                    <Bookmark class="w-3.5 h-3.5 fill-current" stroke-width="1.7" />
                  </button>
                  <button
                    class="w-7 h-7 rounded-md flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint)]/50 transition"
                    title="Cross post"
                  >
                    <Megaphone class="w-3.5 h-3.5" stroke-width="1.7" />
                  </button>
                  <button
                    class="w-7 h-7 rounded-md flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint)]/50 transition"
                    title="Edit"
                  >
                    <Pencil class="w-3.5 h-3.5" stroke-width="1.7" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <button
                        class="w-7 h-7 rounded-md flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint)]/50 transition"
                        title="More"
                        @click.stop
                      >
                        <MoreHorizontal class="w-4 h-4" stroke-width="1.8" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-[180px] p-1">
                      <DropdownMenuItem class="flex items-center gap-2.5 px-2 py-2 text-[13.5px] cursor-pointer">
                        <MessageSquare class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                        Go to notes
                      </DropdownMenuItem>
                      <DropdownMenuItem class="flex items-center gap-2.5 px-2 py-2 text-[13.5px] cursor-pointer">
                        <Folder class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                        Go to files
                      </DropdownMenuItem>
                      <DropdownMenuItem class="flex items-center gap-2.5 px-2 py-2 text-[13.5px] cursor-pointer">
                        <Copy class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem class="flex items-center gap-2.5 px-2 py-2 text-[13.5px] cursor-pointer">
                        <Archive class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem class="flex items-center gap-2.5 px-2 py-2 text-[13.5px] cursor-pointer text-[var(--brand-danger)]">
                        <Trash2 class="w-3.5 h-3.5" stroke-width="1.7" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </BrandDataTable>

        <div v-if="!filteredJobs.length" class="py-16 text-center text-[13.5px] text-[var(--brand-text-quiet)]">
          No jobs match this view.
        </div>
      </div>

      <!-- Card view — one <JobCard /> per row. Extracted so a "recent jobs"
           widget or any future surface can render the same card. -->
      <div v-else class="flex-1 overflow-auto px-6 pt-4 pb-6 flex flex-col gap-3 bg-white">
        <JobCard
          v-for="j in pagedJobs"
          :key="j.id"
          :job="j"
          @update-status="setStatus"
        />

        <div v-if="!filteredJobs.length" class="py-16 text-center text-[13.5px] text-[var(--brand-text-quiet)]">
          No jobs match this view.
        </div>
      </div>

      <!-- Pagination footer — count + per-page + prev/next (Candidates pattern) -->
      <div v-if="filteredJobs.length" class="flex items-center justify-between gap-3 px-6 py-2.5 border-t border-[var(--brand-border-fade)] bg-white shrink-0">
        <span class="text-[13px] tabular-nums text-[var(--brand-text-muted)]">
          {{ pageStart.toLocaleString() }} – {{ pageEnd.toLocaleString() }} of {{ filteredJobs.length.toLocaleString() }} jobs
        </span>
        <CandidatesPerPage
          :per-page="jobsPerPage"
          :current-page="jobsPage"
          :total-pages="totalJobPages"
          @change="onJobsPerPage"
          @page-change="onJobsPage"
        />
      </div>
    </div>

  </div>
</template>
