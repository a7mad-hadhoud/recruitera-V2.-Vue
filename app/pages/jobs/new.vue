<!--
  Job editor — full-page form that opens after "Create job" in the
  AddJobModal chooser (Blank flow) or Continue (Template flow).

  Layout matches the Recruitera Jobs Standalone reference (`je-*`
  classes in the HTML dump):
    ┌────────────────────────────────────────────────────────┐
    │  header — title + status + Share / Preview / Save / Publish / ⋯ / × │
    ├──────────┬─────────────────────────────────────────────┤
    │ sidenav  │  scroll — Job details tab body              │
    │  Job det │    · Work mode                              │
    │  App     │    · Basic info (title, department, tags)   │
    │  Team    │    · Location                               │
    │  Work    │    · About the role (desc + reqs + benefits)│
    │  Social  │    · Work model (on-site/remote/hybrid)     │
    │  Cross   │    · Career level + years of experience     │
    │          │    · Employment details                     │
    │          │    · Salary                                 │
    └──────────┴─────────────────────────────────────────────┘

  Deep tabs (Application / Team / Workflow / Social Sharing / Cross
  Posting) render "coming soon" placeholders — they're on the sidenav
  so the shape reads right; we'll fill them in follow-ups.

  Colors: --brand-* tokens only, no hex.
-->
<script setup lang="ts">
import { X, Share2, Eye, MoreHorizontal, ChevronDown, Plus, Info, Pencil,
         Trash2, Briefcase, Wrench, Sparkles, ArrowRight,
         Building2, ClipboardList, Users, Layers, Share, Send, ChevronUp, Copy, Check } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { ArrowLeft } from 'lucide-vue-next'
import { useDepartments } from '~/composables/useDepartments'
import { useLocations } from '~/composables/useLocations'
import type { Location } from '~/types'
import JobEditorApplicationTab from '~/components/jobs/JobEditorApplicationTab.vue'
import JobEditorTeamTab from '~/components/jobs/JobEditorTeamTab.vue'
import JobEditorSocialSharingTab from '~/components/jobs/JobEditorSocialSharingTab.vue'
import JobEditorCrossPostingTab from '~/components/jobs/JobEditorCrossPostingTab.vue'
import JobEditorRichTextField from '~/components/jobs/JobEditorRichTextField.vue'
import JobEditorWorkflowTab from '~/components/jobs/JobEditorWorkflowTab.vue'
import JobDetailsFieldsModal from '~/components/jobs/JobDetailsFieldsModal.vue'

definePageMeta({ layout: 'default' })

const route = useRoute()

// Pre-fill from ?title= / ?collar= supplied by the AddJobModal.
const jobTitle = ref<string>(String(route.query.title ?? ''))
const collar   = ref<'white' | 'blue'>((String(route.query.collar ?? 'white') === 'blue') ? 'blue' : 'white')

// Sidenav — Job details is the only tab with real content in v1.
const NAV: Array<{ key: string; label: string; icon: any }> = [
  { key: 'details',  label: 'Job details',    icon: Pencil       },
  { key: 'app',      label: 'Application',    icon: ClipboardList },
  { key: 'team',     label: 'Team',           icon: Users        },
  { key: 'workflow', label: 'Workflow',       icon: Layers       },
  { key: 'social',   label: 'Social Sharing', icon: Share        },
  { key: 'cross',    label: 'Cross Posting',  icon: Send         },
]
const activeNav = ref<string>('details')

// Prev/Next sidenav step — used by the shared footer nav so every tab
// gets consistent [← Prev] [Next →] navigation without duplicating
// buttons inside each tab body.
const navIndex = computed(() => NAV.findIndex(n => n.key === activeNav.value))
const prevNav = computed(() => navIndex.value > 0 ? NAV[navIndex.value - 1]! : null)
const nextNav = computed(() => navIndex.value >= 0 && navIndex.value < NAV.length - 1 ? NAV[navIndex.value + 1]! : null)

// ─── Job details form state ──────────────────────────────
const form = reactive({
  department: '' as string,
  subDepartment: '' as string,
  showSubDept: false,
  tags: ['Sample', 'Mid-level', 'Remote'] as string[],
  locations: ['loc-amsterdam'] as string[],
  description: 'We are searching for a professional Marketeer. You will contribute to a variety of projects from content and graphics to publishing final materials.',
  requirements: '' as string,
  benefits: '' as string,
  keywords: ['Marketing', 'Content', 'Branding'] as string[],
  workModel: 'on-site' as 'on-site' | 'remote' | 'hybrid',
  employmentType: '',
  category: '',
  requiredEducation: '',
  requiredExperience: '',
  salaryMin: '',
  salaryMax: '',
  salaryPeriod: collar.value === 'blue' ? 'Daily' : 'Monthly',
  currency: '',
})

// Departments / locations from settings composables so job editor stays
// in lockstep with what /settings/departments and /settings/locations show.
const { data: departmentsData } = useDepartments()
const { data: locationsData } = useLocations()
const departments = computed(() => departmentsData.value?.data ?? [])
const locations   = computed(() => locationsData.value?.data ?? [])
const departmentSubs = computed(() =>
  departments.value.find(d => d.id === form.department)?.subDepartments ?? [],
)

// ── Location as a single dropdown (mirrors the Department field) ──
// Newly-created locations live in `addedLocations` so they show up in
// the dropdown immediately, prepended ahead of the workspace list.
const addedLocations = ref<Location[]>([])
const allLocations = computed(() => [...addedLocations.value, ...locations.value])
// Single-select bridge over the (still array-shaped) form.locations, so
// the rest of the payload keeps working unchanged.
const selectedLocationId = computed<string>({
  get: () => form.locations[0] ?? '',
  set: (v) => { form.locations = v ? [v] : [] },
})

// Inline "+ Add new location" — same affordance as "+ Add Department".
const showAddLocation = ref(false)
const newLocName = ref('')
const newLocCountry = ref('')
const newLocCity = ref('')
const canAddLocation = computed(() => newLocName.value.trim().length > 0)
function addLocation() {
  if (!canAddLocation.value) return
  const loc: Location = {
    id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: newLocName.value.trim(),
    country: newLocCountry.value.trim(),
    city: newLocCity.value.trim(),
    jobCount: 0,
  }
  addedLocations.value = [loc, ...addedLocations.value]
  selectedLocationId.value = loc.id
  newLocName.value = ''
  newLocCountry.value = ''
  newLocCity.value = ''
  showAddLocation.value = false
}

// Work models — same three that show on kanban stage/location filters.
const WORK_MODELS = [
  { key: 'on-site', label: 'On-site', hint: 'Employees work from a dedicated workspace.' },
  { key: 'remote',  label: 'Remote',  hint: 'Employees can work from anywhere.' },
  { key: 'hybrid',  label: 'Hybrid',  hint: 'Employees work partly remotely and partly on-site.' },
] as const

// Tag ops (Basic info) — one entry point for both remove + add so future
// tag-suggest hooks in one place.
function removeTag(t: string) { form.tags = form.tags.filter(x => x !== t) }
function removeKeyword(k: string) { form.keywords = form.keywords.filter(x => x !== k) }
const keywordDraft = ref('')
function commitKeyword() {
  const v = keywordDraft.value.trim()
  if (!v) return
  if (!form.keywords.includes(v)) form.keywords = [...form.keywords, v]
  keywordDraft.value = ''
}

// Persist toast state so "Job saved as draft" shows on Save changes.
const savedToast = ref(false)
let savedTimer: ReturnType<typeof setTimeout> | null = null
function saveDraft() {
  savedToast.value = true
  if (savedTimer) clearTimeout(savedTimer)
  savedTimer = setTimeout(() => (savedToast.value = false), 2500)
}

// ─── Header status pill ────────────────────────────────────────
// Matches the Recruitee/Tellent status dropdown next to the Publish
// button — 'internal' | 'closed' | 'archived' with distinct dots.
type PublishStatus = 'internal' | 'closed' | 'archived'
const publishStatus = ref<PublishStatus>('internal')
const STATUS_OPTIONS: Array<{ key: PublishStatus; label: string; hint?: string; dot: string }> = [
  { key: 'internal', label: 'Use internally',           hint: 'Anyone with the link can view.', dot: 'var(--brand-status-approved-text)' },
  { key: 'closed',   label: 'Close for new candidates', hint: 'Candidates cannot apply.',       dot: 'var(--brand-status-closed-text)' },
  { key: 'archived', label: 'Archive',                  dot: 'var(--brand-text-quiet)' },
]
const statusLabel = computed(() => {
  const l = STATUS_OPTIONS.find(o => o.key === publishStatus.value)?.label
  return publishStatus.value === 'internal' ? 'Published' : (l ?? 'Draft')
})
const statusDot = computed(() =>
  STATUS_OPTIONS.find(o => o.key === publishStatus.value)?.dot ?? 'var(--brand-text-quiet)',
)

// Short id for the header chip. Stable per pageload so it doesn't
// bounce on every render (was Math.random() in the template previously).
const shortId = computed(() => String(route.params.id ?? '').slice(-5) || Math.random().toString(36).slice(2, 7))

// AI Generate — tone options (Neutral / Friendly / Formal), matching the
// reference "AI Regenerate" dropdown but in our tokens. `aiGenerated`
// flips the label to "AI Regenerate" once a description exists.
const AI_TONES = ['Neutral', 'Friendly', 'Formal'] as const
const aiTone = ref<typeof AI_TONES[number]>('Neutral')
const aiGenerated = computed(() => form.description.trim().length > 0)
function generateWithTone(tone: typeof AI_TONES[number]) {
  aiTone.value = tone
  // eslint-disable-next-line no-console
  console.info('[job-editor] AI generate description —', tone)
}

// Modals launched from Job details cards
const fieldsModalOpen = ref(false)
function onApplyCustomFields(ids: string[]) {
  // eslint-disable-next-line no-console
  console.info('[job-editor] custom fields applied', ids)
}

// Share popover — matches the one on /jobs/[id]. Job URL + Copy.
const jobUrl = computed(() =>
  `https://recruitera.ai/o/${(jobTitle.value || 'new-job').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
)
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null
async function copyJobUrl() {
  try { await navigator.clipboard.writeText(jobUrl.value) } catch {}
  copied.value = true
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (copied.value = false), 1600)
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--brand-text)_68%,transparent)]" style="--page-gutter: 32px;">
    <!-- Modal sheet — dimmed backdrop behind; the sheet drops from a thin
         top gap that lets the app peek through and curves its top corners.
         Header sticky inside; sidebar + content each own their scroll. -->
    <div class="absolute inset-x-0 bottom-0 top-0 md:top-[52px] flex flex-col rounded-none md:rounded-t-[18px] bg-[var(--brand-canvas)] shadow-[0_-10px_44px_rgba(0,20,18,0.20)] overflow-hidden">

      <!-- Header — sticky, h-20, border-b. Title + short id + timestamp on
           the left; Share / Preview / status / Publish + close on the right. -->
      <div class="sticky top-0 z-10 h-20 flex items-center gap-4 pl-[var(--page-gutter)] pr-[var(--page-gutter)] border-b border-[var(--brand-border-fade)] bg-white shrink-0">
        <div class="min-w-0 flex-1 mr-auto">
          <div class="flex items-center gap-2 min-w-0">
            <h1 class="text-[22px] font-extrabold text-[var(--brand-text)] leading-tight truncate min-w-0">{{ jobTitle || 'Untitled job' }}</h1>
            <span class="text-[13px] font-semibold text-[var(--brand-text-quiet)] tabular-nums whitespace-nowrap shrink-0">#{{ shortId }}</span>
          </div>
          <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-1 whitespace-nowrap">Saved just now</div>
        </div>

        <!-- Share popover — reuses the same shape as the kanban Share (see
             /jobs/[id]). Job URL + copy + social buttons. -->
        <Popover>
          <PopoverTrigger as-child>
            <button
              class="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint-hover)] transition"
              aria-label="Share job"
            >
              <Share2 class="w-4 h-4" stroke-width="1.5" />
              Share
              <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)]" stroke-width="2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            :side-offset="6"
            class="w-[320px] p-[18px] rounded-[14px] border border-[var(--brand-border-light)] shadow-[0_12px_34px_rgba(0,20,18,0.16)]"
          >
            <div class="flex items-start justify-between gap-4">
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
                <Check v-if="copied" class="w-[17px] h-[17px]" stroke-width="2.2" />
                <Copy v-else class="w-[17px] h-[17px]" stroke-width="1.7" />
              </button>
            </div>
            <div class="h-px bg-[var(--brand-border-fade)] my-4" />
            <div class="font-bold text-[13px] text-[var(--brand-text)] mb-4">Share Job on Social Media</div>
            <!-- eslint-disable local/no-hex-colors -- third-party brand marks -->
            <div class="flex items-center gap-2">
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
            <!-- eslint-enable local/no-hex-colors -->
          </PopoverContent>
        </Popover>

        <button
          class="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint-hover)] transition"
        >
          <Eye class="w-4 h-4" stroke-width="1.5" />
          Preview
        </button>

        <!-- Status pill dropdown (● Published / Use internally / Close for
             new candidates / Archive). Matches the Recruitee ref. -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition"
              aria-label="Change status"
            >
              <span class="w-2 h-2 rounded-full" :style="{ background: statusDot }" />
              {{ statusLabel }}
              <ChevronUp class="w-3 h-3 text-[var(--brand-text-quiet)]" stroke-width="2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" :side-offset="6" class="w-[280px] p-2 rounded-[14px]">
            <DropdownMenuItem
              v-for="opt in STATUS_OPTIONS"
              :key="opt.key"
              class="flex items-start gap-2 px-2.5 py-2 rounded-[9px] cursor-pointer"
              @select="publishStatus = opt.key"
            >
              <span class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ background: opt.dot }" />
              <div class="min-w-0">
                <div class="text-[13.5px] font-bold text-[var(--brand-text)]">{{ opt.label }}</div>
                <div v-if="opt.hint" class="text-[12px] text-[var(--brand-text-quiet)] mt-0.5">{{ opt.hint }}</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <BrandButton variant="primary-teal" @click="saveDraft">Publish changes</BrandButton>

        <button class="w-9 h-9 rounded-[8px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition" aria-label="More actions">
          <MoreHorizontal class="w-4 h-4" stroke-width="1.8" />
        </button>

        <!-- Close — last item in the header action row (no longer floating).
             Right edge resolves to the page gutter via the header pr. -->
        <NuxtLink
          to="/jobs"
          class="w-9 h-9 rounded-[8px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition"
          aria-label="Close editor"
        >
          <X class="w-4 h-4" stroke-width="2" />
        </NuxtLink>
      </div>

      <!-- Body: sidenav + content -->
      <div class="flex-1 min-h-0 flex overflow-hidden">
        <!-- Sidenav -->
        <aside class="w-64 shrink-0 border-r border-[var(--brand-border-fade)] bg-white flex flex-col overflow-y-auto">
          <nav class="flex-1 p-3">
            <button
              v-for="n in NAV"
              :key="n.key"
              class="w-full text-left flex items-center gap-4 px-3.5 h-11 rounded-[9px] text-[14px] font-semibold transition"
              :class="activeNav === n.key
                ? 'bg-[var(--brand-lime-tint)] text-[var(--brand-text)]'
                : 'text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)]'"
              @click="activeNav = n.key"
            >
              <component :is="n.icon" class="w-4 h-4 shrink-0" stroke-width="1.8" />
              {{ n.label }}
            </button>
          </nav>
          <div class="p-3 border-t border-[var(--brand-border-fade)]">
            <button class="w-full inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] transition">
              <ArrowRight class="w-3.5 h-3.5" stroke-width="1.8" />
              Give feedback
            </button>
          </div>
        </aside>

        <!-- Content — own scroll, canvas bg, 96px scroll-padding so anchored
             jumps clear the sticky header. -->
        <div class="flex-1 min-h-0 overflow-y-auto bg-[var(--brand-canvas)]" style="scroll-padding-top: 96px;">
          <div v-if="activeNav === 'details'" class="max-w-3xl mx-auto pt-8 flex flex-col gap-4">
            <!-- Basic info -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <div class="flex items-start justify-between mb-1">
                <h2 class="text-[16px] font-bold text-[var(--brand-text)]">Basic info</h2>
                <button
                  class="inline-flex items-center gap-1.5 px-3 h-8 rounded-[8px] text-[12.5px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
                  @click="fieldsModalOpen = true"
                >
                  <Pencil class="w-3.5 h-3.5" stroke-width="1.8" />
                  Manage fields
                </button>
              </div>

              <!-- Row 1 — Job title (left) + Job type toggle (right), 50/50 so
                   the right edge aligns with Location in row 2. -->
              <div class="mt-4 grid grid-cols-2 gap-4 items-end">
                <div class="min-w-0">
                  <label for="jd-job-title" class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
                    Job title <span class="text-[var(--brand-status-closed-text)]">*</span>
                  </label>
                  <input
                    id="jd-job-title"
                    v-model="jobTitle"
                    type="text"
                    required
                    aria-required="true"
                    class="w-full h-11 px-3.5 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
                  >
                </div>
                <div class="min-w-0">
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Job type</label>
                  <div role="radiogroup" aria-label="Job type" class="flex w-full p-0.5 rounded-[9px] bg-[var(--brand-canvas)] border border-[var(--brand-border-fade)] h-11 items-center">
                    <button
                      type="button"
                      role="radio"
                      :aria-checked="collar === 'white'"
                      class="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-[7px] text-[13px] font-semibold transition"
                      :class="collar === 'white' ? 'bg-white text-[var(--brand-text)] shadow-[0_1px_3px_rgba(0,20,18,0.10)]' : 'text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]'"
                      @click="collar = 'white'"
                    >
                      <Briefcase class="w-3.5 h-3.5" stroke-width="1.8" />
                      White collar
                    </button>
                    <button
                      type="button"
                      role="radio"
                      :aria-checked="collar === 'blue'"
                      class="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-[7px] text-[13px] font-semibold transition"
                      :class="collar === 'blue' ? 'bg-white text-[var(--brand-text)] shadow-[0_1px_3px_rgba(0,20,18,0.10)]' : 'text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]'"
                      @click="collar = 'blue'"
                    >
                      <Wrench class="w-3.5 h-3.5" stroke-width="1.8" />
                      Blue collar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Row 2 — Department + Location (side by side) -->
              <div class="grid grid-cols-2 gap-4 mt-4 items-start">
                <div>
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
                    Department <span class="text-[var(--brand-status-closed-text)]">*</span>
                  </label>
                  <div class="relative">
                    <select
                      v-model="form.department"
                      required
                      aria-required="true"
                      class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition"
                    >
                      <option value="">Select department</option>
                      <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                  </div>
                  <button
                    class="mt-1.5 text-[11.5px] font-bold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)] transition"
                    @click="form.showSubDept = !form.showSubDept"
                  >+ Add department</button>
                  <div v-if="form.showSubDept && departmentSubs.length" class="mt-2">
                    <label class="block text-[12px] font-bold text-[var(--brand-text-quiet)] mb-1">Sub-department</label>
                    <div class="relative">
                      <select
                        v-model="form.subDepartment"
                        class="w-full h-10 pl-3 pr-9 text-[13.5px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition"
                      >
                        <option value="">Select sub-department</option>
                        <option v-for="s in departmentSubs" :key="s" :value="s">{{ s }}</option>
                      </select>
                      <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Location</label>
                  <div class="relative">
                    <select
                      v-model="selectedLocationId"
                      class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition"
                    >
                      <option value="">Select location</option>
                      <option v-for="l in allLocations" :key="l.id" :value="l.id">
                        {{ l.name }}<template v-if="l.city || l.country"> — {{ [l.city, l.country].filter(Boolean).join(', ') }}</template>
                      </option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                  </div>
                  <button
                    class="mt-1.5 text-[11.5px] font-bold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)] transition"
                    @click="showAddLocation = !showAddLocation"
                  >+ Add location</button>

                  <!-- Inline add-location mini-form (mirrors the sub-department
                       inline pattern under Department). -->
                  <div v-if="showAddLocation" class="mt-2 rounded-[10px] border border-[var(--brand-border-fade)] bg-[var(--brand-canvas)] p-3">
                    <input
                      v-model="newLocName"
                      type="text"
                      placeholder="Location name (e.g. Amsterdam HQ)"
                      class="w-full h-9 px-3 text-[13px] rounded-[8px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
                    >
                    <div class="grid grid-cols-2 gap-2 mt-2">
                      <input
                        v-model="newLocCity"
                        type="text"
                        placeholder="City"
                        class="w-full h-9 px-3 text-[13px] rounded-[8px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
                      >
                      <input
                        v-model="newLocCountry"
                        type="text"
                        placeholder="Country"
                        class="w-full h-9 px-3 text-[13px] rounded-[8px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
                      >
                    </div>
                    <div class="flex items-center justify-end gap-2 mt-2">
                      <button
                        class="text-[12.5px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text-secondary)] px-2 h-8"
                        @click="showAddLocation = false; newLocName = ''; newLocCity = ''; newLocCountry = ''"
                      >Cancel</button>
                      <button
                        class="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[12.5px] font-bold text-white bg-[var(--brand-teal)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                        :disabled="!canAddLocation"
                        @click="addLocation"
                      >
                        <Plus class="w-3.5 h-3.5" stroke-width="2.4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Row 3 — Tags (full width) -->
              <div class="mt-4">
                <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2">Tags</label>
                <div class="flex flex-wrap items-center gap-1.5">
                  <span v-for="t in form.tags" :key="t" class="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)] rounded-md px-2 py-1">
                    {{ t }}
                    <button class="text-[var(--brand-text-faint)] hover:text-[var(--brand-text-secondary)]" :aria-label="`Remove ${t}`" @click="removeTag(t)">
                      <X class="w-3 h-3" stroke-width="2" />
                    </button>
                  </span>
                  <button class="inline-flex items-center gap-1 h-7 px-2.5 rounded-[6px] border-[1.5px] border-dashed border-[var(--brand-border)] bg-white text-[12px] font-semibold text-[var(--brand-text-quiet)] hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)] transition">
                    <Plus class="w-3 h-3" stroke-width="2.4" />
                    Add tag
                  </button>
                </div>
              </div>
            </section>

            <!-- About the role -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <div class="flex items-start justify-between mb-1">
                <div>
                  <h2 class="text-[16px] font-bold text-[var(--brand-text)]">About the role</h2>
                  <p class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Description of the role and responsibilities.</p>
                </div>
                <!-- AI Generate — dropdown of tone options (Neutral / Friendly
                     / Formal), same shape as the reference "AI Regenerate"
                     menu but styled with our tokens. -->
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <button class="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-[9px] border-[1.5px] border-[var(--brand-teal)] bg-[var(--brand-lime-tint)] text-[13px] font-bold text-[var(--brand-teal)] hover:brightness-95 transition">
                      <Sparkles class="w-3.5 h-3.5" stroke-width="1.8" />
                      {{ aiGenerated ? 'AI Regenerate' : 'AI Generate' }}
                      <ChevronDown class="w-3 h-3" stroke-width="2.2" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" :side-offset="6" class="w-[200px] p-1.5 rounded-[12px]">
                    <div class="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)]">Writing tone</div>
                    <DropdownMenuItem
                      v-for="tone in AI_TONES"
                      :key="tone"
                      class="flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[13.5px] font-semibold text-[var(--brand-text)] cursor-pointer"
                      @select="generateWithTone(tone)"
                    >
                      <Sparkles class="w-3.5 h-3.5 text-[var(--brand-teal-secondary)]" stroke-width="1.8" />
                      <span class="flex-1">{{ tone }}</span>
                      <Check v-if="aiTone === tone" class="w-3.5 h-3.5 text-[var(--brand-teal)]" stroke-width="2.4" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div class="mt-4">
                <JobEditorRichTextField
                  v-model="form.description"
                  label="Description"
                  required
                  min-height="150px"
                />
              </div>

              <div class="mt-4">
                <JobEditorRichTextField
                  v-model="form.requirements"
                  label="Requirements"
                  placeholder="List the must-haves for this role…"
                  min-height="110px"
                />
              </div>

              <div class="mt-4">
                <div class="flex items-center justify-between mb-2">
                  <label class="text-[13px] font-bold text-[var(--brand-text-secondary)]">Benefits</label>
                  <button class="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-[7px] border border-[var(--brand-border)] bg-white text-[12.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition">
                    Import package
                    <ChevronDown class="w-3 h-3" stroke-width="2.2" />
                  </button>
                </div>
                <textarea
                  v-model="form.benefits"
                  placeholder="Add benefits or import a package…"
                  class="w-full min-h-[80px] px-4 py-3 text-[13.5px] leading-relaxed rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none resize-y transition italic"
                />
              </div>

              <div class="mt-4">
                <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2">Keywords</label>
                <div class="flex flex-wrap items-center gap-1.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white px-3 py-2.5 min-h-[44px]">
                  <span v-for="k in form.keywords" :key="k" class="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)] rounded-md px-2 py-1">
                    {{ k }}
                    <button class="text-[var(--brand-text-faint)] hover:text-[var(--brand-text-secondary)]" :aria-label="`Remove ${k}`" @click="removeKeyword(k)">
                      <X class="w-3 h-3" stroke-width="2" />
                    </button>
                  </span>
                  <input
                    v-model="keywordDraft"
                    type="text"
                    placeholder="Add keyword…"
                    class="flex-1 min-w-[100px] text-[13.5px] bg-transparent focus:outline-none text-[var(--brand-text)]"
                    @keydown.enter.prevent="commitKeyword"
                    @keydown.tab.prevent="commitKeyword"
                  >
                </div>
                <div class="text-[12px] text-[var(--brand-text-quiet)] mt-1.5">Keywords improve discoverability on job boards and AI recommendations.</div>
              </div>
            </section>

            <!-- Work model -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <h2 class="text-[16px] font-bold text-[var(--brand-text)] mb-1">Work model</h2>
              <p class="text-[13px] text-[var(--brand-text-quiet)] mb-4">Applicants will see the selected work model on the careers site.</p>
              <div class="grid grid-cols-3 gap-4">
                <button
                  v-for="wm in WORK_MODELS"
                  :key="wm.key"
                  type="button"
                  class="relative text-left flex flex-col rounded-[10px] border-[1.5px] p-4 transition focus:outline-none"
                  :class="form.workModel === wm.key
                    ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]'
                    : 'border-[var(--brand-border)] bg-white hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]'"
                  @click="form.workModel = wm.key"
                >
                  <span
                    class="absolute top-3 right-3 w-5 h-5 rounded-md inline-flex items-center justify-center"
                    :class="form.workModel === wm.key ? 'bg-[var(--brand-teal)] text-[var(--brand-lime)]' : 'border-[1.5px] border-[var(--brand-border)]'"
                  >
                    <svg v-if="form.workModel === wm.key" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  <Building2 class="w-5 h-5 mb-2 text-[var(--brand-text-secondary)]" stroke-width="1.7" />
                  <span class="text-[14px] font-semibold text-[var(--brand-text)] mb-0.5">{{ wm.label }}</span>
                  <span class="text-[12px] text-[var(--brand-text-quiet)]">{{ wm.hint }}</span>
                </button>
              </div>
            </section>

            <!-- Employment details -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <h2 class="text-[16px] font-bold text-[var(--brand-text)] mb-1">Employment details</h2>
              <p class="text-[13px] text-[var(--brand-text-quiet)] mb-6">Visible to candidates on the careers site and job boards.</p>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Employment type</label>
                  <div class="relative">
                    <select v-model="form.employmentType" class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition">
                      <option value="">Select</option>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                  </div>
                </div>
                <div>
                  <label class="flex items-center gap-1.5 text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
                    Category
                    <span class="text-[11px] font-bold text-[var(--brand-pipeline-purple)]">AI recommended</span>
                  </label>
                  <div class="relative">
                    <select v-model="form.category" class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition">
                      <option value="">Select</option>
                      <option>Engineering</option><option>Marketing</option><option>Design</option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                  </div>
                </div>
                <div>
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Required education</label>
                  <div class="relative">
                    <select v-model="form.requiredEducation" class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition">
                      <option value="">Select</option>
                      <option>Bachelor's</option><option>Master's</option><option>PhD</option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                  </div>
                </div>
                <div>
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Required experience</label>
                  <div class="relative">
                    <select v-model="form.requiredExperience" class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition">
                      <option value="">Select</option>
                      <option>0–1 years</option><option>1–3 years</option><option>3–5 years</option><option>5+ years</option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                  </div>
                </div>
              </div>
            </section>

            <!-- Salary -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <h2 class="text-[16px] font-bold text-[var(--brand-text)] mb-1">Salary</h2>
              <p class="text-[13px] text-[var(--brand-text-quiet)] mb-6">The salary range will be visible to candidates on the careers site and job boards.</p>
              <div class="grid grid-cols-[1fr_auto_1fr_1fr_1fr] items-end gap-4">
                <div>
                  <label class="flex items-center gap-1 text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
                    Min <Info class="w-3 h-3 text-[var(--brand-text-faint)]" stroke-width="1.8" />
                  </label>
                  <input v-model="form.salaryMin" type="number" placeholder="Min" class="w-full h-11 px-3.5 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition" >
                </div>
                <div class="pb-3 text-[13px] text-[var(--brand-text-quiet)]">to</div>
                <div>
                  <label class="flex items-center gap-1 text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
                    Max <Info class="w-3 h-3 text-[var(--brand-text-faint)]" stroke-width="1.8" />
                  </label>
                  <input v-model="form.salaryMax" type="number" placeholder="Max" class="w-full h-11 px-3.5 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition" >
                </div>
                <div>
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Salary period</label>
                  <div class="relative">
                    <select v-model="form.salaryPeriod" class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition">
                      <option value="">Select</option><option>Monthly</option><option>Annual</option><option>Daily</option><option>Hourly</option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                  </div>
                </div>
                <div>
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Currency</label>
                  <div class="relative">
                    <select v-model="form.currency" class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition">
                      <option value="">Select</option><option>USD</option><option>EUR</option><option>GBP</option><option>EGP</option><option>SAR</option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                  </div>
                </div>
              </div>
            </section>

          </div>

          <JobEditorWorkflowTab v-else-if="activeNav === 'workflow'" />

          <JobEditorApplicationTab v-else-if="activeNav === 'app'" />

          <JobEditorTeamTab v-else-if="activeNav === 'team'" />

          <JobEditorSocialSharingTab v-else-if="activeNav === 'social'" :job-title="jobTitle" />

          <JobEditorCrossPostingTab v-else-if="activeNav === 'cross'" />

          <div v-else class="max-w-3xl mx-auto pt-8 px-16 text-center text-[14px] text-[var(--brand-text-quiet)]">
            {{ NAV.find(n => n.key === activeNav)?.label }} — coming soon
          </div>

          <!-- Shared step nav — same [← Prev] [Next →] pair under every
               tab body, driven by the sidenav order. Bottom pad gives the
               last element ~128px clearance from the viewport edge. -->
          <div class="max-w-3xl mx-auto mt-8 pb-32 flex items-center justify-between gap-2">
            <button
              v-if="prevNav"
              class="inline-flex items-center gap-2 px-5 h-10 rounded-[9px] border border-[var(--brand-border)] bg-white text-[13.5px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
              @click="activeNav = prevNav.key"
            >
              <ArrowLeft class="w-4 h-4" stroke-width="2" />
              {{ prevNav.label }}
            </button>
            <span v-else />
            <button
              v-if="nextNav"
              class="inline-flex items-center gap-2 px-5 h-10 rounded-[9px] border border-[var(--brand-border)] bg-white text-[13.5px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
              @click="activeNav = nextNav.key"
            >
              {{ nextNav.label }}
              <ArrowRight class="w-4 h-4" stroke-width="2" />
            </button>
            <span v-else />
          </div>
        </div>
      </div>

      <!-- Manage custom fields (Basic info → Manage fields) -->
      <JobDetailsFieldsModal v-model:open="fieldsModalOpen" @apply="onApplyCustomFields" />

      <!-- Saved-draft toast -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="savedToast" class="absolute left-1/2 -translate-x-1/2 bottom-6 inline-flex items-center gap-4 bg-[var(--brand-text)] text-white rounded-[10px] px-4 py-2.5 shadow-[0_4px_14px_rgba(0,20,18,0.25)]">
          <span class="w-5 h-5 rounded-full bg-[var(--brand-lime)] text-[var(--brand-teal)] inline-flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          <div>
            <div class="text-[13.5px] font-bold">Job saved as draft</div>
            <div class="text-[12px] opacity-70">Publish to let candidates apply.</div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
