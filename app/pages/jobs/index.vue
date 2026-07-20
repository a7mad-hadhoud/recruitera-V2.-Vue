<!--
  Jobs list page — mirrors the Candidates page shell so the two feel
  identical: rounded-tl white filter card on the left, flat white content
  panel on the right, brand primitives for every button/pill/badge.
-->
<script setup lang="ts">
import { Zap, Plus } from 'lucide-vue-next'
import { BrandPageTitle, BrandSearchBar, BrandButton, BrandDataTable, BrandStatusBadge } from '~/components/brand'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import JobsFilters from '~/components/jobs/JobsFilters.vue'
import JobsColumnsPicker from '~/components/jobs/JobsColumnsPicker.vue'
import JobsFiltersPanel from '~/components/jobs/JobsFiltersPanel.vue'
import JobsNewViewPanel, { type ViewVisibility } from '~/components/jobs/JobsNewViewSheet.vue'
import type { Job, JobStatus, CollarType } from '~/types'
import { useJobs } from '~/composables/useJobs'
import { useJobsColumns } from '~/composables/useJobsColumns'
import { useJobsFilters, applyJobFilters } from '~/composables/useJobsFilters'

definePageMeta({ layout: 'default' })

const { jobs } = useJobs()
const { isVisible: isColVisible } = useJobsColumns()
const { rows: filterRows, addRow, removeRow, updateRow, clearAll: clearFilters } = useJobsFilters()

// New-view mode swaps the JobsFilters sidebar column for the New View editor.
const newViewOpen = ref(false)

// Saved views (in-memory for now).
type SavedView = { id: string; title: string; visibility: ViewVisibility }
const savedViews = ref<SavedView[]>([])
function onSaveView(payload: { title: string; visibility: ViewVisibility }) {
  savedViews.value = [...savedViews.value, { id: `v${Date.now()}`, title: payload.title, visibility: payload.visibility }]
  newViewOpen.value = false
}

type ViewKey = 'all' | 'followed' | 'involved' | 'active' | 'archived' | 'draft' | 'closed'
type CollarTab = 'all' | 'white' | 'blue'

const activeView = ref<ViewKey>('all')
const collarTab  = ref<CollarTab>('all')
const search     = ref('')

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

const STATUS: Record<JobStatus, { label: string; tone: 'approved' | 'pending' | 'neutral' | 'closed' }> = {
  published: { label: 'PUBLISHED', tone: 'approved' },
  internal:  { label: 'INTERNAL',  tone: 'pending' },
  draft:     { label: 'DRAFT',     tone: 'pending' },
  closed:    { label: 'CLOSED',    tone: 'closed' },
  archived:  { label: 'ARCHIVED',  tone: 'neutral' },
}

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
      @update:active="(k) => (activeView = k)"
      @new-view="newViewOpen = true"
    />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--brand-surface-white)] border-t border-[var(--brand-border)]">
      <!-- Header row: title (+ slots pill) + Create -->
      <div class="flex items-start gap-3 px-6 pt-6 pb-2">
        <div class="flex-1 min-w-0">
          <BrandPageTitle label="Jobs" favoriteable />
          <p class="mt-1 text-[13.5px] text-[var(--brand-text-quiet)]">
            Browse, create, publish, and promote every job posting.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] bg-[var(--brand-status-pending-bg)] text-[var(--brand-status-pending-text)] text-[13px] font-semibold hover:brightness-95 transition"
          >
            <Zap class="w-4 h-4" stroke-width="2" />
            {{ slotsLeft }} slots left
          </button>
          <BrandButton variant="primary-teal" size="lg">
            <Plus class="w-4 h-4 mr-1" stroke-width="2.5" />
            Create a New Job
          </BrandButton>
        </div>
      </div>

      <!-- Collar tabs + search + Filters/Columns -->
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
           column dividers, zebra rows, lime-tint hover/selected. -->
      <div class="flex-1 overflow-auto px-6 pb-6">
        <BrandDataTable>
          <template #header>
            <TableHeader class="sticky top-0 z-10 bg-[var(--brand-canvas)]">
              <TableRow class="hover:bg-transparent border-b border-[var(--brand-border)]">
                <TableHead class="text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap border-r border-[var(--brand-border-fade)]">Title</TableHead>
                <TableHead class="text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap border-r border-[var(--brand-border-fade)]">Status</TableHead>
                <TableHead v-if="isColVisible('cands')"     class="text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap border-r border-[var(--brand-border-fade)]">Candidates</TableHead>
                <TableHead v-if="isColVisible('hired')"     class="text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap border-r border-[var(--brand-border-fade)]">Hires</TableHead>
                <TableHead v-if="isColVisible('dept')"      class="text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap border-r border-[var(--brand-border-fade)]">Department</TableHead>
                <TableHead v-if="isColVisible('location')"  class="text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap border-r border-[var(--brand-border-fade)]">Location</TableHead>
                <TableHead v-if="isColVisible('workmodel')" class="text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap border-r border-[var(--brand-border-fade)]">Work model</TableHead>
                <TableHead v-if="isColVisible('tags')"      class="text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap">Tags</TableHead>
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
              <TableCell class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[14px] font-semibold text-[var(--brand-text)]">
                {{ j.title }}
              </TableCell>
              <TableCell class="align-top py-3 border-r border-[var(--brand-border-fade)]">
                <BrandStatusBadge variant="solid" :tone="STATUS[j.status].tone" :label="STATUS[j.status].label" />
              </TableCell>
              <TableCell v-if="isColVisible('cands')" class="align-top py-3 border-r border-[var(--brand-border-fade)]">
                <div class="flex items-center gap-1.5 text-[13px] text-[var(--brand-text)]">
                  {{ j.candidateCount }}
                  <span v-if="j.newCandidates > 0" class="text-[12px] font-semibold text-[var(--brand-status-approved-text)]">+{{ j.newCandidates }}</span>
                </div>
              </TableCell>
              <TableCell v-if="isColVisible('hired')"     class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text)]">{{ j.hires }}</TableCell>
              <TableCell v-if="isColVisible('dept')"      class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)]">{{ j.department ?? '—' }}</TableCell>
              <TableCell v-if="isColVisible('location')"  class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)]">{{ j.location ?? '—' }}</TableCell>
              <TableCell v-if="isColVisible('workmodel')" class="align-top py-3 border-r border-[var(--brand-border-fade)] text-[13px] text-[var(--brand-text-muted)]">{{ WORK_MODEL_LABEL[j.workModel] }}</TableCell>
              <TableCell v-if="isColVisible('tags')" class="align-top py-3">
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
    </div>

  </div>
</template>
