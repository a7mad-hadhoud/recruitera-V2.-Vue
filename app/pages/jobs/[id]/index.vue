<!--
  Job Management page — ported from "Job management.dc.html". Matches the
  design's visible-on-load structure at ~90% fidelity: header row, tab bar,
  sub-toolbar, pipeline kanban board with candidate cards.

  Interactive additions on top of the base design:
   • Column collapse — click chevron in a stage header to fold to a 40px
     rail (dot + count + rotated label). Click the expand chevron to restore.
   • Per-column automation — lightning-bolt in every header opens a stub
     menu (Send email / Move to next stage / Notify recruiter).
   • Bulk-select — checkbox on every card (plus a select-all in each column
     header). When ≥1 selected the Qualified/Disqualified segmented toggle
     swaps for the bulk toolbar (Send Email / Change Stage / More…), and
     selected cards highlight with lime tint.

  Every color goes through --brand-* tokens so a future palette swap
  propagates. Reuse: BrandLimeCheckbox for selection, JobStatusMenu-style
  status dot for the header, DropdownMenu for automation + bulk More menu.
-->
<script setup lang="ts">
import { Share2, Eye, Plus, Pencil, MapPin, Briefcase, Zap, MoreHorizontal,
         Mail, MessageSquare, CornerUpLeft, ArrowUpDown, Kanban, ChevronLeft, ChevronRight,
         X, ArrowLeftRight, Users, Copy, Trash2, Share, Ban, Download, Search } from 'lucide-vue-next'
import { BrandButton, BrandLimeCheckbox } from '~/components/brand'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import AddCandidatesModal from '~/components/candidates/AddCandidatesModal.vue'
import { useJobs } from '~/composables/useJobs'
import { useJobPipeline } from '~/composables/useJobPipeline'
import type { Job, PipelineStage } from '~/types'

definePageMeta({ layout: 'default' })

const route = useRoute()
const jobId = computed(() => String(route.params.id))
const { jobs } = useJobs()
const job = computed<Job | undefined>(() => jobs.value.find(j => j.id === jobId.value))

const { stages, qualifiedCount, disqualifiedCount } = useJobPipeline(jobId.value)

// ─── UI state ───
const STATUS_DOT: Record<string, string> = {
  published: 'var(--brand-status-approved-text)',
  internal:  'var(--brand-status-teal-green)',
  draft:     'var(--brand-text-quiet)',
  closed:    'var(--brand-status-closed-text)',
  archived:  'var(--brand-text-faint)',
}
const WORK_MODEL_LABEL: Record<Job['workModel'], string> = {
  'on-site': 'On-site',
  remote:    'Remote',
  hybrid:    'Hybrid',
}

const TABS = ['Pipeline', 'Filters', 'Activity', 'Notes', 'Referral', 'SEO', 'Reports'] as const
type Tab = typeof TABS[number]
const activeTab = ref<Tab>('Pipeline')

const segment = ref<'qual' | 'disq'>('qual')
const myOn     = ref(true)
const sharedOn = ref(false)

// Share popover state — computed job URL and copy-to-clipboard flag.
const jobUrl = computed(() =>
  `https://app.recruitera.ai/job/${encodeURIComponent((job.value?.title || jobId.value).toLowerCase().replace(/\s+/g, '-'))}-${jobId.value}`,
)
const copied = ref(false)
async function copyJobUrl() {
  try {
    await navigator.clipboard.writeText(jobUrl.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1200)
  } catch { /* clipboard blocked — ignore, tooltip stays */ }
}

// Filters-tab table state — scoped to this job's pipeline candidates only.
const filtersSearch = ref('')
const filtersStatusOn = ref<Set<'qualified' | 'disqualified' | 'new' | 'overdue'>>(new Set())
function toggleFiltersStatus(s: 'qualified' | 'disqualified' | 'new' | 'overdue') {
  const n = new Set(filtersStatusOn.value)
  n.has(s) ? n.delete(s) : n.add(s)
  filtersStatusOn.value = n
}
const allJobCandidates = computed(() => stages.value.flatMap(s => s.candidates.map(c => ({ ...c, stage: s.label, stageDot: s.dot }))))
const filtersRows = computed(() => {
  const term = filtersSearch.value.trim().toLowerCase()
  return allJobCandidates.value.filter((c) => {
    if (term && !c.name.toLowerCase().includes(term)) return false
    if (filtersStatusOn.value.has('new') && !c.isNew) return false
    // qualified/disqualified/overdue stubs are visual-only for now
    return true
  })
})
const filtersStatusCounts = computed(() => ({
  qualified:    allJobCandidates.value.length,
  disqualified: 0,
  new:          allJobCandidates.value.filter(c => c.isNew).length,
  overdue:      0,
}))

// Column collapse — Set of stage keys currently collapsed.
const collapsedStages = ref<Set<string>>(new Set())
function toggleColumn(key: string) {
  const next = new Set(collapsedStages.value)
  next.has(key) ? next.delete(key) : next.add(key)
  collapsedStages.value = next
}

// Bulk selection — Set of candidate ids across all columns.
const selectedIds = ref<Set<string>>(new Set())
const selectedCount = computed(() => selectedIds.value.size)

function isSelected(id: string) { return selectedIds.value.has(id) }
function toggleCandidate(id: string) {
  const next = new Set(selectedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedIds.value = next
}
function columnAllSelected(stage: PipelineStage) {
  return stage.candidates.length > 0 && stage.candidates.every(c => selectedIds.value.has(c.id))
}
function toggleAllInColumn(stage: PipelineStage, next: boolean) {
  const s = new Set(selectedIds.value)
  for (const c of stage.candidates) next ? s.add(c.id) : s.delete(c.id)
  selectedIds.value = s
}
function clearSelection() { selectedIds.value = new Set() }
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--brand-surface-listview)] overflow-hidden">
    <div class="flex-1 flex flex-col overflow-hidden px-7 pt-6 bg-white">

      <!-- Missing job (bad id) -->
      <div v-if="!job" class="text-center py-16 text-[14px] text-[var(--brand-text-quiet)]">
        Job not found —
        <NuxtLink to="/jobs" class="text-[var(--brand-teal)] font-semibold hover:underline">back to jobs</NuxtLink>
      </div>

      <template v-else>
        <!-- ─────────── HEADER ─────────── -->
        <div class="flex items-start gap-3.5 mb-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2.5">
              <span class="w-[9px] h-[9px] rounded-full shrink-0" :style="{ background: STATUS_DOT[job.status] }" />
              <h1 class="m-0 text-[22px] font-bold tracking-tight text-[var(--brand-text)]">{{ job.title }}</h1>
            </div>
            <div class="flex items-center gap-4 mt-2 text-[13.5px] text-[var(--brand-text-quiet)]">
              <span v-if="job.location" class="inline-flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5" stroke-width="1.5" />
                {{ job.location }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <Briefcase class="w-3.5 h-3.5" stroke-width="1.5" />
                {{ WORK_MODEL_LABEL[job.workModel] }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <Popover>
              <PopoverTrigger as-child>
                <button class="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-[9px] text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint-hover)] transition" aria-label="Share job">
                  <Share2 class="w-4 h-4" stroke-width="1.5" />
                  Share
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                :side-offset="6"
                class="w-[320px] p-[18px] rounded-[14px] border border-[var(--brand-border-light)] shadow-[0_12px_34px_rgba(0,20,18,0.16)]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="font-bold text-[13px] text-[var(--brand-text)] mb-1.5">Job URL</div>
                    <div class="text-[13px] leading-[1.5] text-[var(--brand-text-quiet)] break-all">{{ jobUrl }}</div>
                  </div>
                  <button
                    class="shrink-0 w-[34px] h-[34px] rounded-[9px] inline-flex items-center justify-center text-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint-hover)] transition"
                    :aria-label="copied ? 'Copied' : 'Copy job URL'"
                    :title="copied ? 'Copied' : 'Copy link'"
                    @click="copyJobUrl"
                  >
                    <Copy class="w-[17px] h-[17px]" stroke-width="1.7" />
                  </button>
                </div>
                <div class="h-px bg-[var(--brand-border-fade)] my-4" />
                <div class="font-bold text-[13px] text-[var(--brand-text)] mb-3">Share Job on Social Media</div>
                <div class="flex items-center gap-2.5">
                  <!-- Social buttons keep their canonical brand colors (external IP) -->
                  <a href="#" title="Facebook" aria-label="Share on Facebook" class="w-6 h-6 rounded-md inline-flex items-center justify-center" style="background:#1877F2" @click.prevent>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M14 8.5V7c0-.7.5-.9.9-.9H16V3.2l-2.2-.01c-2.5 0-3.1 1.86-3.1 3.06V8.5H9v3h1.7V21h3.3v-9.5h2.3l.35-3H14z" /></svg>
                  </a>
                  <a href="#" title="X" aria-label="Share on X" class="w-6 h-6 rounded-md inline-flex items-center justify-center" style="background:#000" @click.prevent>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-6.07l-4.76-6.22L5.48 21H2.46l7.06-8.07L2.25 3h6.23l4.3 5.69L17.53 3zm-1.06 16.2h1.67L7.6 4.7H5.8l10.67 14.5z" /></svg>
                  </a>
                  <a href="#" title="LinkedIn" aria-label="Share on LinkedIn" class="w-6 h-6 rounded-md inline-flex items-center justify-center" style="background:#0A66C2" @click.prevent>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M6.94 5A1.94 1.94 0 1 1 3.06 5a1.94 1.94 0 0 1 3.88 0zM3.3 8.4h3.28V21H3.3V8.4zm5.5 0h3.14v1.72h.05c.44-.83 1.5-1.72 3.1-1.72 3.31 0 3.92 2.18 3.92 5.02V21h-3.28v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.15 1.45-2.15 2.96V21H8.8V8.4z" /></svg>
                  </a>
                </div>
              </PopoverContent>
            </Popover>
            <button class="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-[9px] text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint-hover)] transition" aria-label="Preview job posting">
              <Eye class="w-4 h-4" stroke-width="1.5" />
              Preview
            </button>
            <button class="w-[34px] h-[34px] rounded-full border border-dashed border-[var(--brand-border)] text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint-hover)] inline-flex items-center justify-center transition" aria-label="Add collaborator">
              <Plus class="w-4 h-4" stroke-width="1.5" />
            </button>
            <span class="w-[34px] h-[34px] rounded-full bg-[var(--brand-teal)] text-white inline-flex items-center justify-center font-bold text-[13px]" aria-label="Assigned to MS">MS</span>
            <BrandButton variant="outline" size="sm" class="ml-1">
              <Pencil class="w-3.5 h-3.5 mr-1.5" stroke-width="1.5" />
              Edit
            </BrandButton>
          </div>
        </div>

        <!-- ─────────── TABS ─────────── -->
        <div class="flex items-center gap-7 border-b border-[var(--brand-border-fade)] mb-4">
          <button
            v-for="tab in TABS"
            :key="tab"
            class="relative pb-3 text-[14px] transition"
            :class="activeTab === tab
              ? 'text-[var(--brand-text)] font-bold'
              : 'text-[var(--brand-text-quiet)] font-semibold hover:text-[var(--brand-text-secondary)]'"
            @click="activeTab = tab"
          >
            <span class="inline-flex items-center gap-1.5">
              {{ tab }}
              <span
                v-if="tab === 'Notes'"
                class="text-[11px] font-bold text-[var(--brand-text-secondary)] bg-[var(--brand-lime-tint)] rounded-md px-1.5 py-px"
              >2</span>
            </span>
            <span v-if="activeTab === tab" class="absolute left-0 right-0 bottom-0 h-[3px] bg-[var(--brand-teal)] rounded-t-[3px]" />
          </button>
        </div>

        <!-- ─────────── SUB-TOOLBAR (Pipeline tab only) ─────────── -->
        <div v-if="activeTab === 'Pipeline'" class="flex items-center gap-3 mb-4 flex-wrap">
          <!-- Bulk-action bar (replaces segmented toggle when items selected) -->
          <template v-if="selectedCount > 0">
            <span class="text-[14px] font-semibold text-[var(--brand-text)] whitespace-nowrap">
              <span class="text-[var(--brand-teal)] font-bold">{{ selectedCount }}</span> selected
            </span>
            <span class="w-px h-[22px] bg-[var(--brand-border)]" />
            <button class="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-[9px] bg-white border border-[var(--brand-border)] text-[13px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)] transition whitespace-nowrap">
              <Mail class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
              Send Email
            </button>
            <button class="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-[9px] bg-white border border-[var(--brand-border)] text-[13px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)] transition whitespace-nowrap">
              <ArrowLeftRight class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
              Change Stage
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button class="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-[9px] bg-white border border-[var(--brand-border)] text-[13px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)] transition whitespace-nowrap">
                  More…
                  <ChevronRight class="w-3 h-3 text-[var(--brand-text-quiet)] rotate-90" stroke-width="2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" class="w-[210px] p-1">
                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 text-[14px] cursor-pointer">
                  <Download class="w-4 h-4 text-[var(--brand-teal)]" stroke-width="1.7" />
                  Export As CSV
                </DropdownMenuItem>
                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 text-[14px] cursor-pointer">
                  <Ban class="w-4 h-4 text-[var(--brand-teal)]" stroke-width="1.7" />
                  Disqualify
                </DropdownMenuItem>
                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 text-[14px] cursor-pointer">
                  <Users class="w-4 h-4 text-[var(--brand-teal)]" stroke-width="1.7" />
                  Add to talent pool
                </DropdownMenuItem>
                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 text-[14px] cursor-pointer">
                  <Copy class="w-4 h-4 text-[var(--brand-teal)]" stroke-width="1.7" />
                  Add to job
                </DropdownMenuItem>
                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 text-[14px] cursor-pointer">
                  <Share class="w-4 h-4 text-[var(--brand-teal)]" stroke-width="1.7" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 text-[14px] text-[var(--brand-danger)] cursor-pointer">
                  <Trash2 class="w-4 h-4" stroke-width="1.7" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              class="w-[34px] h-[34px] rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-danger)] transition"
              aria-label="Clear selection"
              @click="clearSelection"
            >
              <X class="w-4 h-4" stroke-width="1.9" />
            </button>
          </template>

          <!-- Segmented Qualified/Disqualified (default) -->
          <template v-else>
            <div class="inline-flex items-center bg-[var(--brand-canvas)] rounded-[10px] p-[3px] h-[37px]">
              <button
                class="inline-flex items-center gap-2 rounded-[8px] px-3.5 py-[7px] text-[13px] font-semibold transition"
                :class="segment === 'qual'
                  ? 'bg-white text-[var(--brand-text)] shadow-[0_0_1px_rgba(0,20,18,0.10)]'
                  : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'"
                @click="segment = 'qual'"
              >
                Qualified
                <span
                  class="text-[11px] font-bold rounded-md px-1.5 py-px"
                  :class="segment === 'qual'
                    ? 'text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)]'
                    : 'text-[var(--brand-text-quiet)] bg-[var(--brand-border-fade)]'"
                >{{ qualifiedCount }}</span>
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-[8px] px-3.5 py-[7px] text-[13px] font-semibold transition"
                :class="segment === 'disq'
                  ? 'bg-white text-[var(--brand-text)] shadow-[0_0_1px_rgba(0,20,18,0.10)]'
                  : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'"
                @click="segment = 'disq'"
              >
                Disqualified
                <span
                  class="text-[11px] font-bold rounded-md px-1.5 py-px"
                  :class="segment === 'disq'
                    ? 'text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)]'
                    : 'text-[var(--brand-text-quiet)] bg-[var(--brand-border-fade)]'"
                >{{ disqualifiedCount }}</span>
              </button>
            </div>
          </template>

          <span class="flex-1" />

          <!-- Scope toggles + Add candidates -->
          <div class="inline-flex items-center gap-4 mr-3">
            <label class="inline-flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <span class="relative inline-flex w-[34px] h-5 rounded-full transition-colors" :style="{ background: myOn ? 'var(--brand-teal)' : 'var(--brand-border)' }">
                <span class="absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-[0_1px_2px_rgba(0,20,18,0.25)] transition-[left]" :style="{ left: myOn ? '16px' : '2px' }" />
              </span>
              <input v-model="myOn" type="checkbox" class="sr-only">
              <span class="text-[14px] font-semibold text-[var(--brand-text)]">My candidates</span>
            </label>
            <span class="w-px h-5 bg-[var(--brand-border)]" />
            <label class="inline-flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <span class="relative inline-flex w-[34px] h-5 rounded-full transition-colors" :style="{ background: sharedOn ? 'var(--brand-teal)' : 'var(--brand-border)' }">
                <span class="absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-[0_1px_2px_rgba(0,20,18,0.25)] transition-[left]" :style="{ left: sharedOn ? '16px' : '2px' }" />
              </span>
              <input v-model="sharedOn" type="checkbox" class="sr-only">
              <span class="text-[14px] font-semibold text-[var(--brand-text)]">Shared with me</span>
            </label>
          </div>

          <!-- Shared Add-candidates flow (same component as /candidates).
               preselectedJobId pre-checks THIS job in Step 3's Assign list
               so the user knows the candidate will land in this pipeline. -->
          <AddCandidatesModal :preselected-job-id="jobId" />

          <div class="inline-flex items-center gap-1.5">
            <button class="w-9 h-9 rounded-[10px] bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] inline-flex items-center justify-center hover:bg-[var(--brand-lime-tint)] transition" aria-label="Sort candidates">
              <ArrowUpDown class="w-4 h-4" stroke-width="1.5" />
            </button>
            <button class="w-9 h-9 rounded-[10px] bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] inline-flex items-center justify-center hover:bg-[var(--brand-lime-tint)] transition" aria-label="Change view">
              <Kanban class="w-4 h-4" stroke-width="1.5" />
            </button>
          </div>
        </div>

        <!-- ─────────── PIPELINE BOARD ─────────── -->
        <div v-if="activeTab === 'Pipeline'" class="flex-1 min-h-0 flex gap-4 overflow-x-auto overflow-y-hidden pb-4 items-stretch">

          <!-- Collapsed rail — 40px, rotated label + dot + count -->
          <template v-for="stage in stages" :key="stage.key">
            <section
              v-if="collapsedStages.has(stage.key)"
              class="flex-none w-10 flex flex-col items-center gap-2 rounded-[14px] py-3 min-h-[420px] bg-[var(--brand-surface-listview)]"
              :aria-label="`${stage.label} column (collapsed, ${stage.candidates.length} candidates)`"
            >
              <button
                class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
                :aria-label="`Expand ${stage.label} column`"
                @click="toggleColumn(stage.key)"
              >
                <ChevronRight class="w-4 h-4" stroke-width="2" />
              </button>
              <span
                class="text-[11px] font-bold rounded-md px-1.5 py-px inline-flex items-center h-[19px] bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)]"
              >{{ stage.candidates.length }}</span>
              <div
                class="flex-1 flex items-center justify-center"
                style="writing-mode: vertical-rl; transform: rotate(180deg)"
              >
                <span class="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--brand-text)] whitespace-nowrap">
                  <span class="w-[8px] h-[8px] rounded-full" :style="{ background: stage.dot }" />
                  {{ stage.label }}
                </span>
              </div>
            </section>

            <!-- Full column — 288px -->
            <section
              v-else
              class="flex-none w-[288px] flex flex-col rounded-[14px] px-3 pt-3.5 pb-3 min-h-[420px]"
              :style="{ background: 'linear-gradient(180deg, var(--brand-surface-listview) 0%, transparent 95%)' }"
            >
              <header class="flex items-center gap-2 px-1 pb-3">
                <!-- Select-all in this column -->
                <BrandLimeCheckbox
                  v-if="stage.candidates.length > 0"
                  :model-value="columnAllSelected(stage)"
                  :aria-label="`Select all candidates in ${stage.label}`"
                  @update:model-value="(v) => toggleAllInColumn(stage, v)"
                />
                <span class="w-[9px] h-[9px] rounded-full shrink-0" :style="{ background: stage.dot }" />
                <span class="text-[14px] font-semibold text-[var(--brand-text)]">{{ stage.label }}</span>
                <span
                  class="text-[12px] font-bold rounded-md px-2 inline-flex items-center h-[19px] bg-[var(--brand-canvas)]"
                  :class="stage.candidates.length > 0 ? 'text-[var(--brand-text-secondary)]' : 'text-[var(--brand-text-quiet)]'"
                >{{ stage.candidates.length }}</span>
                <span class="flex-1" />
                <!-- Collapse chevron -->
                <button
                  class="w-6 h-6 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
                  :aria-label="`Collapse ${stage.label} column`"
                  @click="toggleColumn(stage.key)"
                >
                  <ChevronLeft class="w-3.5 h-3.5" stroke-width="2" />
                </button>
                <!-- Automation -->
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <button
                      class="w-6 h-6 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
                      :aria-label="`Automate ${stage.label} stage`"
                    >
                      <Zap class="w-4 h-4" stroke-width="0" fill="currentColor" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-[220px] p-1">
                    <div class="px-3 py-2 text-[12px] font-bold uppercase tracking-wider text-[var(--brand-text-quiet)]">
                      Stage automation
                    </div>
                    <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 text-[14px] cursor-pointer">
                      <Mail class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                      Send email on move-in
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 text-[14px] cursor-pointer">
                      <ArrowLeftRight class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                      Auto-move to next stage
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 text-[14px] cursor-pointer">
                      <Users class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                      Notify recruiter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>

              <!-- Candidate cards -->
              <div class="flex flex-col gap-3">
                <article
                  v-for="cand in stage.candidates"
                  :key="cand.id"
                  class="border rounded-[12px] overflow-hidden hover:shadow-[0_2px_8px_rgba(0,20,18,0.06)] transition-shadow cursor-pointer"
                  :class="isSelected(cand.id)
                    ? 'bg-[var(--brand-lime-tint)] border-[var(--brand-teal)]/40'
                    : 'bg-white border-[var(--brand-border-light)]'"
                >
                  <div class="flex items-start gap-2.5 px-3.5 py-3">
                    <BrandLimeCheckbox
                      :model-value="isSelected(cand.id)"
                      :aria-label="`Select ${cand.name}`"
                      class="mt-0.5"
                      @update:model-value="() => toggleCandidate(cand.id)"
                    />
                    <span
                      class="w-6 h-6 rounded-full bg-[var(--brand-teal)] text-white inline-flex items-center justify-center font-bold text-[10px] shrink-0"
                      :aria-label="`${cand.name} avatar`"
                    >{{ cand.initials }}</span>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5">
                        <span class="text-[14px] font-semibold text-[var(--brand-text)] truncate">{{ cand.name }}</span>
                        <span
                          v-if="cand.isNew"
                          class="text-[10px] font-bold tracking-wider text-[var(--brand-pipeline-blue)] border border-[color-mix(in_srgb,var(--brand-pipeline-blue)_30%,white)] bg-[color-mix(in_srgb,var(--brand-pipeline-blue)_10%,white)] rounded px-1.5 py-px shrink-0"
                        >NEW</span>
                      </div>
                      <div class="flex items-center gap-3 mt-1.5 text-[12.5px] text-[var(--brand-text-quiet)]">
                        <span class="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)] rounded px-1.5 py-0.5">
                          AI SCORE
                          <span class="text-[10px] text-[var(--brand-text)]">{{ cand.aiScore }}%</span>
                        </span>
                        <span class="inline-flex items-center gap-1">
                          <MessageSquare class="w-3.5 h-3.5" stroke-width="1.5" />
                          {{ cand.notes }}
                        </span>
                        <span class="inline-flex items-center gap-1">
                          <CornerUpLeft class="w-3.5 h-3.5" stroke-width="1.5" />
                          {{ cand.replies }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-if="cand.location" class="border-t border-[var(--brand-border-fade)] px-3.5 py-2 flex items-center gap-3.5 text-[12.5px] text-[var(--brand-text-quiet)]">
                    <span class="inline-flex items-center gap-1.5">
                      <MapPin class="w-3.5 h-3.5" stroke-width="1.5" />
                      {{ cand.location }}
                    </span>
                  </div>
                </article>

                <div v-if="!stage.candidates.length" class="text-center text-[12.5px] text-[var(--brand-text-faint)] py-8">
                  No candidates yet
                </div>
              </div>
            </section>
          </template>
        </div>

        <!-- ─────────── FILTERS TAB — candidates scoped to this job ─────────── -->
        <div v-else-if="activeTab === 'Filters'" class="flex-1 min-h-0 flex gap-6 overflow-hidden">
          <!-- Left filter sidebar -->
          <aside class="w-[240px] shrink-0 flex flex-col gap-6 pt-1">
            <div>
              <div class="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)] mb-2.5">
                Filters
              </div>
              <div class="text-[13px] font-semibold text-[var(--brand-text)] mb-1.5 inline-flex items-center gap-1.5">
                Candidate status
                <button
                  v-if="filtersStatusOn.size"
                  class="text-[var(--brand-text-faint)] hover:text-[var(--brand-danger)]"
                  aria-label="Clear candidate status filter"
                  @click="filtersStatusOn = new Set()"
                >
                  <X class="w-3 h-3" stroke-width="2" />
                </button>
              </div>
              <div class="flex flex-col gap-1">
                <label
                  v-for="[key, label] in ([['qualified','Qualified'],['disqualified','Disqualified'],['new','New'],['overdue','Overdue']] as const)"
                  :key="key"
                  class="flex items-center gap-2.5 px-1 py-1.5 rounded-md cursor-pointer text-[13.5px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] transition"
                >
                  <BrandLimeCheckbox
                    :model-value="filtersStatusOn.has(key)"
                    @update:model-value="() => toggleFiltersStatus(key)"
                  />
                  <span class="flex-1">{{ label }}</span>
                  <span class="text-[12px] text-[var(--brand-text-quiet)] tabular-nums">{{ filtersStatusCounts[key] }}</span>
                </label>
              </div>
            </div>

            <div>
              <div class="text-[13px] font-semibold text-[var(--brand-text)] mb-1.5">In stage</div>
              <button class="w-full text-left text-[13px] text-[var(--brand-text-quiet)] border border-dashed border-[var(--brand-border)] rounded-[8px] px-3 py-2 hover:bg-[var(--brand-lime-tint-hover)] transition">
                Add stage…
              </button>
            </div>

            <div>
              <div class="text-[13px] font-semibold text-[var(--brand-text)] mb-1.5">Has tag</div>
              <button class="w-full text-left text-[13px] text-[var(--brand-text-quiet)] border border-dashed border-[var(--brand-border)] rounded-[8px] px-3 py-2 hover:bg-[var(--brand-lime-tint-hover)] transition">
                Add tag…
              </button>
            </div>

            <BrandButton variant="outline" size="sm" class="w-full">
              <Plus class="w-3.5 h-3.5 mr-1" stroke-width="2" />
              Add filter
            </BrandButton>
          </aside>

          <!-- Table area -->
          <div class="flex-1 min-w-0 flex flex-col">
            <h2 class="text-[20px] font-bold text-[var(--brand-text)] mb-3">Candidates</h2>
            <div class="mb-3 flex items-center gap-2 h-10 rounded-[10px] border border-[var(--brand-border)] bg-white px-3.5">
              <Search class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
              <input
                v-model="filtersSearch"
                type="text"
                placeholder="Search candidates by anything or use keywords e.g. John AND manager"
                class="flex-1 bg-transparent outline-none text-[13.5px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]"
              >
            </div>

            <div class="text-[13px] text-[var(--brand-text-quiet)] mb-2">
              <span class="text-[var(--brand-text)] font-semibold">1 – {{ filtersRows.length }}</span>
              of <span class="text-[var(--brand-text)] font-semibold">{{ filtersRows.length }}</span> candidate{{ filtersRows.length === 1 ? '' : 's' }}
            </div>

            <div class="flex-1 min-h-0 overflow-auto rounded-[12px] border border-[var(--brand-border-light)] bg-white">
              <table class="w-full border-collapse text-[13px]">
                <thead class="bg-[var(--brand-surface-listview)] sticky top-0 z-10">
                  <tr class="border-b border-[var(--brand-border)]">
                    <th class="text-left font-semibold text-[var(--brand-text)] px-4 py-2.5">Name</th>
                    <th class="text-left font-semibold text-[var(--brand-text)] px-4 py-2.5">Job</th>
                    <th class="text-left font-semibold text-[var(--brand-text)] px-4 py-2.5">Stage</th>
                    <th class="text-left font-semibold text-[var(--brand-text)] px-4 py-2.5">AI Score</th>
                    <th class="text-left font-semibold text-[var(--brand-text)] px-4 py-2.5">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(c, i) in filtersRows"
                    :key="c.id"
                    class="border-b border-[var(--brand-border-light)] hover:bg-[var(--brand-lime-tint)]/40 cursor-pointer"
                    :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
                  >
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2.5">
                        <span class="w-6 h-6 rounded-full bg-[var(--brand-teal)] text-white inline-flex items-center justify-center font-bold text-[10px] shrink-0">{{ c.initials }}</span>
                        <span class="font-semibold text-[var(--brand-text)]">{{ c.name }}</span>
                        <span v-if="c.isNew" class="text-[10px] font-bold tracking-wider text-[var(--brand-pipeline-blue)] border border-[color-mix(in_srgb,var(--brand-pipeline-blue)_30%,white)] bg-[color-mix(in_srgb,var(--brand-pipeline-blue)_10%,white)] rounded px-1.5 py-px">NEW</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1.5 text-[var(--brand-text)]">
                        <span class="w-[7px] h-[7px] rounded-full" :style="{ background: STATUS_DOT[job.status] }" />
                        {{ job.title }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1.5 text-[var(--brand-text-muted)]">
                        <span class="w-[7px] h-[7px] rounded-full" :style="{ background: c.stageDot }" />
                        {{ c.stage }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-[var(--brand-text-muted)] tabular-nums">{{ c.aiScore }}%</td>
                    <td class="px-4 py-3 text-[var(--brand-text-muted)]">{{ c.location ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>

              <div v-if="!filtersRows.length" class="py-14 text-center text-[13.5px] text-[var(--brand-text-quiet)]">
                No candidates match this filter.
              </div>
            </div>
          </div>
        </div>

        <!-- Other tabs — placeholder while we build them -->
        <div v-else class="flex-1 flex items-center justify-center text-[13.5px] text-[var(--brand-text-quiet)]">
          {{ activeTab }} — coming soon
        </div>
      </template>
    </div>
  </div>
</template>
