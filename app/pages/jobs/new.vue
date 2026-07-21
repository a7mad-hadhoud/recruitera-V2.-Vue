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
         Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2, Image,
         MapPin, Building2, ClipboardList, Users, Layers, Share, Send } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import { useDepartments } from '~/composables/useDepartments'
import { useLocations } from '~/composables/useLocations'
import JobEditorApplicationTab from '~/components/jobs/JobEditorApplicationTab.vue'
import JobEditorTeamTab from '~/components/jobs/JobEditorTeamTab.vue'

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
  careerLevel: 'experienced' as 'experienced' | 'manager' | 'senior' | 'entry' | 'student',
  yearsOfExperience: '' as string,
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
const assignedLocations = computed(() =>
  locations.value.filter(l => form.locations.includes(l.id)),
)

// Career level options — reference labels.
const CAREER_LEVELS = [
  { key: 'experienced', label: 'Experienced'       },
  { key: 'manager',     label: 'Manager'           },
  { key: 'senior',      label: 'Senior Management' },
  { key: 'entry',       label: 'Entry Level'       },
  { key: 'student',     label: 'Student'           },
] as const

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
</script>

<template>
  <div class="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--brand-text)_45%,transparent)]">
    <div class="absolute inset-6 md:inset-14 flex flex-col rounded-[14px] bg-[var(--brand-canvas)] shadow-[0_24px_64px_rgba(0,20,18,0.22)] overflow-hidden">
      <!-- Sample-data banner -->
      <div class="flex items-center justify-center gap-2 h-9 bg-[var(--brand-text)] text-white text-[12.5px] shrink-0">
        Sample data active —
        <button class="underline underline-offset-2 font-semibold" @click="() => {}">remove it</button>
        before entering your real data.
        <button class="ml-2 opacity-70 hover:opacity-100" aria-label="Dismiss banner"><X class="w-3.5 h-3.5" stroke-width="2" /></button>
      </div>

      <!-- Header -->
      <div class="flex items-center gap-3 px-6 py-4 border-b border-[var(--brand-border-fade)] bg-white shrink-0">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h1 class="text-[17px] font-bold text-[var(--brand-text)] leading-tight truncate">{{ jobTitle || 'Untitled job' }}</h1>
            <span class="text-[11.5px] font-semibold rounded-md px-1.5 py-0.5 tabular-nums bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)]">#{{ Math.random().toString(36).slice(2, 7) }}</span>
          </div>
          <div class="text-[11.5px] text-[var(--brand-text-quiet)] mt-0.5">Saved just now</div>
        </div>
        <BrandButton variant="outline">
          <Share2 class="w-3.5 h-3.5 mr-1.5" stroke-width="1.8" />
          Share
          <ChevronDown class="w-3 h-3 ml-1 text-[var(--brand-text-quiet)]" stroke-width="2" />
        </BrandButton>
        <BrandButton variant="outline">
          <Eye class="w-3.5 h-3.5 mr-1.5" stroke-width="1.8" />
          Preview
        </BrandButton>
        <BrandButton variant="outline" @click="saveDraft">Save changes</BrandButton>
        <div class="inline-flex items-stretch h-9 rounded-[9px] overflow-hidden bg-[var(--brand-teal)]">
          <button class="inline-flex items-center px-4 h-full text-[13px] font-bold text-white hover:bg-[color-mix(in_srgb,var(--brand-teal)_92%,white)] transition">Publish</button>
          <button class="inline-flex items-center px-2 h-full text-white border-l border-white/15 hover:bg-[color-mix(in_srgb,var(--brand-teal)_88%,white)] transition" aria-label="More publish options">
            <ChevronDown class="w-4 h-4" stroke-width="2" />
          </button>
        </div>
        <button class="w-9 h-9 rounded-[8px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition" aria-label="More actions">
          <MoreHorizontal class="w-4 h-4" stroke-width="1.8" />
        </button>
        <NuxtLink to="/jobs" class="w-9 h-9 rounded-[8px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition" aria-label="Close editor">
          <X class="w-4 h-4" stroke-width="2" />
        </NuxtLink>
      </div>

      <!-- Body: sidenav + content -->
      <div class="flex-1 min-h-0 flex overflow-hidden">
        <!-- Sidenav -->
        <aside class="w-[220px] shrink-0 border-r border-[var(--brand-border-fade)] bg-white flex flex-col">
          <nav class="flex-1 p-2">
            <button
              v-for="n in NAV"
              :key="n.key"
              class="w-full text-left flex items-center gap-2.5 px-3 h-10 rounded-[8px] text-[13.5px] font-semibold transition"
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

        <!-- Content -->
        <div class="flex-1 min-h-0 overflow-y-auto">
          <div v-if="activeNav === 'details'" class="max-w-[880px] mx-auto p-6 flex flex-col gap-4">
            <!-- Work mode -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <h2 class="text-[16px] font-bold text-[var(--brand-text)] mb-1">Work mode</h2>
              <p class="text-[13px] text-[var(--brand-text-quiet)] mb-4">Select the collar type. This determines the form language, AI generation, and career level options.</p>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="relative text-left flex flex-col rounded-[10px] border-[1.5px] p-4 transition focus:outline-none"
                  :class="collar === 'white'
                    ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]'
                    : 'border-[var(--brand-border)] bg-white hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]'"
                  @click="collar = 'white'"
                >
                  <span
                    class="absolute top-3 right-3 w-5 h-5 rounded-md inline-flex items-center justify-center"
                    :class="collar === 'white' ? 'bg-[var(--brand-teal)] text-[var(--brand-lime)]' : 'border-[1.5px] border-[var(--brand-border)]'"
                  >
                    <svg v-if="collar === 'white'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  <Briefcase class="w-5 h-5 mb-2 text-[var(--brand-text-secondary)]" stroke-width="1.7" />
                  <span class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">White Collar</span>
                  <span class="text-[12px] text-[var(--brand-text-quiet)]">English LTR · AI in English · Monthly salary</span>
                </button>
                <button
                  type="button"
                  class="relative text-left flex flex-col rounded-[10px] border-[1.5px] p-4 transition focus:outline-none"
                  :class="collar === 'blue'
                    ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]'
                    : 'border-[var(--brand-border)] bg-white hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]'"
                  @click="collar = 'blue'"
                >
                  <span
                    class="absolute top-3 right-3 w-5 h-5 rounded-md inline-flex items-center justify-center"
                    :class="collar === 'blue' ? 'bg-[var(--brand-teal)] text-[var(--brand-lime)]' : 'border-[1.5px] border-[var(--brand-border)]'"
                  >
                    <svg v-if="collar === 'blue'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  <Wrench class="w-5 h-5 mb-2 text-[var(--brand-text-secondary)]" stroke-width="1.7" />
                  <span class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">Blue Collar</span>
                  <span class="text-[12px] text-[var(--brand-text-quiet)]">Arabic RTL · AI in Arabic · Daily salary</span>
                </button>
              </div>
            </section>

            <!-- Basic info -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <div class="flex items-start justify-between mb-1">
                <div>
                  <h2 class="text-[16px] font-bold text-[var(--brand-text)]">Basic info</h2>
                  <p class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Define basic information about the job.</p>
                </div>
                <button class="inline-flex items-center gap-1.5 px-3 h-8 rounded-[8px] text-[12.5px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition">
                  <Pencil class="w-3.5 h-3.5" stroke-width="1.8" />
                  Manage fields
                </button>
              </div>
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
                    Job title <span class="text-[var(--brand-status-closed-text)]">*</span>
                  </label>
                  <input
                    v-model="jobTitle"
                    type="text"
                    class="w-full h-11 px-3.5 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
                  >
                </div>
                <div>
                  <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
                    Department <span class="text-[var(--brand-status-closed-text)]">*</span>
                  </label>
                  <div class="relative">
                    <select
                      v-model="form.department"
                      class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition"
                    >
                      <option value="">Select</option>
                      <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
                  </div>
                  <button
                    class="mt-1.5 text-[11.5px] font-bold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)] transition"
                    @click="form.showSubDept = !form.showSubDept"
                  >+ Add Department</button>
                  <div v-if="form.showSubDept && departmentSubs.length" class="mt-2.5">
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
              </div>
              <div class="mt-4">
                <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2">Tags</label>
                <div class="flex flex-wrap items-center gap-1.5">
                  <span v-for="t in form.tags" :key="t" class="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)] rounded-md px-2 py-1">
                    {{ t }}
                    <button class="text-[var(--brand-text-faint)] hover:text-[var(--brand-text-secondary)]" :aria-label="`Remove ${t}`" @click="removeTag(t)">
                      <X class="w-3 h-3" stroke-width="2" />
                    </button>
                  </span>
                  <button class="w-7 h-7 rounded-[6px] border-[1.5px] border-[var(--brand-border)] bg-white text-[var(--brand-text-quiet)] hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)] transition inline-flex items-center justify-center">
                    <Plus class="w-3.5 h-3.5" stroke-width="2.2" />
                  </button>
                </div>
              </div>
            </section>

            <!-- Location -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-[16px] font-bold text-[var(--brand-text)]">Location</h2>
                  <p class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Assigned locations are displayed on the careers site.</p>
                </div>
                <BrandButton variant="outline">
                  <Plus class="w-3.5 h-3.5 mr-1.5" stroke-width="2.2" />
                  Assign location
                </BrandButton>
              </div>
              <div v-for="loc in assignedLocations" :key="loc.id"
                   class="flex items-center gap-3 rounded-[10px] border border-[var(--brand-border-fade)] px-4 py-3.5 bg-white">
                <MapPin class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.8" />
                <div class="flex-1 min-w-0">
                  <div class="text-[14px] font-bold text-[var(--brand-text)]">{{ loc.name }}</div>
                  <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ loc.country }}, {{ loc.city }}</div>
                </div>
                <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition" aria-label="Edit location"><Pencil class="w-3.5 h-3.5" stroke-width="1.8" /></button>
                <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-status-closed-text)] transition" aria-label="Remove location" @click="form.locations = form.locations.filter(id => id !== loc.id)"><X class="w-3.5 h-3.5" stroke-width="2" /></button>
              </div>
              <div v-if="!assignedLocations.length" class="text-[13px] text-[var(--brand-text-quiet)] italic py-2">No locations assigned yet.</div>
            </section>

            <!-- About the role -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <div class="flex items-start justify-between mb-1">
                <div>
                  <h2 class="text-[16px] font-bold text-[var(--brand-text)]">About the role</h2>
                  <p class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Description of the role and responsibilities.</p>
                </div>
                <button class="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-[9px] border-[1.5px] border-[var(--brand-teal)] bg-[var(--brand-lime-tint)] text-[13px] font-bold text-[var(--brand-teal)] hover:brightness-95 transition">
                  <Sparkles class="w-3.5 h-3.5" stroke-width="1.8" />
                  AI Generate
                  <ChevronDown class="w-3 h-3" stroke-width="2.2" />
                </button>
              </div>

              <div class="mt-4">
                <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2">Description</label>
                <div class="rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white">
                  <textarea
                    v-model="form.description"
                    class="w-full min-h-[140px] px-4 py-3 text-[13.5px] leading-relaxed bg-transparent focus:outline-none resize-y"
                  />
                  <div class="flex items-center gap-1 px-2 h-9 border-t border-[var(--brand-border-fade)]">
                    <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"><Bold class="w-3.5 h-3.5" stroke-width="2" /></button>
                    <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"><Italic class="w-3.5 h-3.5" stroke-width="2" /></button>
                    <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"><Underline class="w-3.5 h-3.5" stroke-width="2" /></button>
                    <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"><Strikethrough class="w-3.5 h-3.5" stroke-width="2" /></button>
                    <span class="w-px h-4 mx-1 bg-[var(--brand-border-fade)]" />
                    <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"><List class="w-3.5 h-3.5" stroke-width="2" /></button>
                    <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"><ListOrdered class="w-3.5 h-3.5" stroke-width="2" /></button>
                    <span class="w-px h-4 mx-1 bg-[var(--brand-border-fade)]" />
                    <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"><Link2 class="w-3.5 h-3.5" stroke-width="2" /></button>
                    <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"><Image class="w-3.5 h-3.5" stroke-width="2" /></button>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2">Requirements</label>
                <textarea
                  v-model="form.requirements"
                  placeholder="List the must-haves for this role…"
                  class="w-full min-h-[100px] px-4 py-3 text-[13.5px] leading-relaxed rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none resize-y transition"
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
              <div class="grid grid-cols-3 gap-3">
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

            <!-- Career level -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <h2 class="text-[16px] font-bold text-[var(--brand-text)] mb-1">Career level <span class="text-[var(--brand-status-closed-text)]">*</span></h2>
              <p class="text-[13px] text-[var(--brand-text-quiet)] mb-4">Select the career level for this position.</p>
              <div class="flex flex-wrap items-center gap-2 mb-4">
                <button
                  v-for="lv in CAREER_LEVELS"
                  :key="lv.key"
                  type="button"
                  class="px-4 h-9 rounded-[8px] border-[1.5px] text-[13px] font-semibold transition"
                  :class="form.careerLevel === lv.key
                    ? 'bg-[var(--brand-teal)] border-[var(--brand-teal)] text-white'
                    : 'bg-white border-[var(--brand-border)] text-[var(--brand-text-secondary)] hover:border-[var(--brand-teal)] hover:text-[var(--brand-text)]'"
                  @click="form.careerLevel = lv.key"
                >{{ lv.label }}</button>
              </div>
              <div class="max-w-[240px]">
                <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
                  Years of experience <span class="text-[var(--brand-status-closed-text)]">*</span>
                </label>
                <input
                  v-model="form.yearsOfExperience"
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                  class="w-full h-11 px-3.5 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
                >
              </div>
            </section>

            <!-- Employment details -->
            <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-6">
              <h2 class="text-[16px] font-bold text-[var(--brand-text)] mb-1">Employment details</h2>
              <p class="text-[13px] text-[var(--brand-text-quiet)] mb-5">Visible to candidates on the careers site and job boards.</p>
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
              <p class="text-[13px] text-[var(--brand-text-quiet)] mb-5">The salary range will be visible to candidates on the careers site and job boards.</p>
              <div class="grid grid-cols-[1fr_auto_1fr_1fr_1fr] items-end gap-3">
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

            <!-- Next → Application -->
            <div class="flex justify-end pb-2">
              <button
                class="inline-flex items-center gap-2 px-5 h-10 rounded-[9px] border border-[var(--brand-border)] bg-white text-[13.5px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
                @click="activeNav = 'app'"
              >
                Application
                <ArrowRight class="w-4 h-4" stroke-width="2" />
              </button>
            </div>
          </div>

          <JobEditorApplicationTab v-else-if="activeNav === 'app'" />

          <JobEditorTeamTab v-else-if="activeNav === 'team'" />

          <div v-else class="max-w-[880px] mx-auto p-16 text-center text-[14px] text-[var(--brand-text-quiet)]">
            {{ NAV.find(n => n.key === activeNav)?.label }} — coming soon
          </div>
        </div>
      </div>

      <!-- Saved-draft toast -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="savedToast" class="absolute left-1/2 -translate-x-1/2 bottom-6 inline-flex items-center gap-3 bg-[var(--brand-text)] text-white rounded-[10px] px-4 py-2.5 shadow-[0_4px_14px_rgba(0,20,18,0.25)]">
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
