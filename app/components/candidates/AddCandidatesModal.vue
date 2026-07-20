<!--
  "Add candidates" flow, ported from the design (Recruitera Candidates.dc.html
  .add-menu). Three steps:
   1. Choose method — CV upload / Manually / Import CSV / Browser extension
   2. Collar type — White / Blue (skipped for the browser-extension method)
   3. Assign to job/pool (optional) — search + checkbox lists, Skip/Continue

  Shared by the Candidates page toolbar AND the Job Detail (/jobs/[id])
  page's "Add candidates" button. When opened from a job context, pass
  the jobId via `preselectedJobId` — Step 3 pre-checks that job so the
  user sees where the candidate will land.

  ─── Sync path (once the API lands) ─────────────────────────────────────
  Continue → POST /candidates with { …candidate, assignments: { jobIds } }.
  The mutation's onSuccess invalidates BOTH:
    queryClient.invalidateQueries({ queryKey: ['candidates'] })
    queryClient.invalidateQueries({ queryKey: ['pipeline'] })      // any job
  Any surface listening on either key refetches automatically — the
  candidate shows up in /candidates AND in /jobs/[id] pipelines that
  contain it, no extra plumbing required.

  Steps 2 and 3 are visual today (no upload/assign wiring yet) — this
  ports the interaction shell so the flow matches the design.
-->
<script setup lang="ts">
import { Plus, ChevronRight, ChevronLeft, FileText, Pencil, FileSpreadsheet, Globe, User, Shirt } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { BrandLimeCheckbox, BrandSearchBar, BrandButton } from '~/components/brand'
import { useJobs } from '~/composables/useJobs'

const props = defineProps<{
  /** When present, Step 3 pre-checks this job so the user knows the
   *  candidate will land in the current job's pipeline. */
  preselectedJobId?: string
}>()

type Step = 'method' | 'collar' | 'assign'
type Method = 'cv' | 'manual' | 'csv' | 'extension'

const open = ref(false)
const step = ref<Step>('method')
const method = ref<Method | null>(null)

const METHODS: { key: Method; icon: unknown; label: string; desc: string; external?: boolean }[] = [
  { key: 'cv', icon: FileText, label: 'CV file upload', desc: 'Upload one or many files or a folder.' },
  { key: 'manual', icon: Pencil, label: 'Manually', desc: 'Type in candidate information manually.' },
  { key: 'csv', icon: FileSpreadsheet, label: 'Import from CSV', desc: 'Add multiple candidates from a CSV file.' },
  { key: 'extension', icon: Globe, label: 'Browser sourcing extension', desc: 'Source candidates via Recruitera Talent Sourcing.', external: true },
]

// Real jobs from the shared store (used to be a hardcoded 3-item array).
const { jobs } = useJobs()
const POOLS = ['Leadership Pipeline', 'Data & ML']

// Which jobs/pools are checked in Step 3 — seeded with the caller's
// preselectedJobId so the user opening from /jobs/[id] sees it ticked.
const selectedJobIds = ref<Set<string>>(new Set())
const selectedPools  = ref<Set<string>>(new Set())

// Reseed selection whenever the popover opens (fresh flow each time).
watch(open, (next) => {
  if (next) {
    selectedJobIds.value = new Set(props.preselectedJobId ? [props.preselectedJobId] : [])
    selectedPools.value  = new Set()
  } else {
    reset()
  }
})

function toggleJob(id: string) {
  const s = new Set(selectedJobIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selectedJobIds.value = s
}
function togglePool(p: string) {
  const s = new Set(selectedPools.value)
  s.has(p) ? s.delete(p) : s.add(p)
  selectedPools.value = s
}

function pickMethod(m: Method) {
  method.value = m
  // The browser extension opens externally — no further steps in this flow.
  if (m === 'extension') { open.value = false; return }
  step.value = 'collar'
}

function reset() {
  step.value = 'method'
  method.value = null
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <BrandButton
        variant="primary-teal"
        size="md"
        class="shrink-0"
      >
        <Plus class="w-4 h-4 mr-1" />
        Add candidates
      </BrandButton>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      :side-offset="6"
      class="w-[340px] p-0 rounded-[14px] border-[var(--brand-border-light)] shadow-[0_16px_48px_rgba(0,20,18,0.22)] overflow-hidden"
    >
      <!-- Step 1: Choose method -->
      <div v-if="step === 'method'">
        <div class="text-center font-bold text-[14px] text-[var(--brand-text)] py-[11px] px-4 border-b border-[var(--brand-border-fade)] bg-[var(--brand-canvas)]">
          Choose method
        </div>
        <button
          v-for="m in METHODS"
          :key="m.key"
          class="w-full flex items-start gap-3 px-4 py-[13px] text-left border-b border-[var(--brand-border-fade)] last:border-b-0 hover:bg-[var(--brand-lime-tint)] transition-colors"
          @click="pickMethod(m.key)"
        >
          <component :is="m.icon" class="w-[19px] h-[19px] text-[var(--brand-teal)] mt-px shrink-0" stroke-width="1.7" />
          <span class="flex-1">
            <span class="block font-bold text-[13.5px] text-[var(--brand-text)]">{{ m.label }}</span>
            <span class="block text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ m.desc }}</span>
          </span>
          <ChevronRight
            v-if="!m.external"
            class="w-3.5 h-3.5 text-[var(--brand-text-faint)] mt-0.5 shrink-0"
            stroke-width="1.8"
          />
          <svg v-else class="w-[13px] h-[13px] text-[var(--brand-text-faint)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </button>
      </div>

      <!-- Step 2: Collar type -->
      <div v-else-if="step === 'collar'">
        <div class="flex items-center gap-2 py-[11px] px-4 border-b border-[var(--brand-border-fade)] bg-[var(--brand-canvas)]">
          <button
            class="w-7 h-7 rounded-lg inline-flex items-center justify-center text-[var(--brand-text-subtle)] hover:bg-[var(--brand-border-divider)] transition-colors shrink-0"
            aria-label="Back"
            @click="step = 'method'"
          >
            <ChevronLeft class="w-[15px] h-[15px]" stroke-width="2" />
          </button>
          <span class="flex-1 text-center font-bold text-[14px] text-[var(--brand-text)]">Collar type</span>
          <span class="w-7 shrink-0" />
        </div>
        <div class="p-4 flex flex-col gap-2.5">
          <p class="m-0 mb-1.5 text-[13px] text-[var(--brand-text-subtle)]">
            Select the collar type to apply the correct profile and deduplication logic.
          </p>
          <button
            class="flex items-center gap-3.5 px-4 py-3.5 rounded-[11px] border-[1.5px] border-[var(--brand-border)] bg-white text-left transition-colors hover:border-[var(--brand-lime)] hover:bg-[var(--brand-lime-tint-hover)]"
            @click="step = 'assign'"
          >
            <span class="w-9 h-9 rounded-full bg-[var(--brand-lime-tint-hover)] flex items-center justify-center shrink-0">
              <User class="w-[18px] h-[18px] text-[var(--brand-teal)]" stroke-width="1.7" />
            </span>
            <span>
              <span class="block font-bold text-[13.5px] text-[var(--brand-text)]">White collar</span>
              <span class="block text-[12px] text-[var(--brand-text-quiet)] mt-px">Merged by email or phone number</span>
            </span>
          </button>
          <button
            class="flex items-center gap-3.5 px-4 py-3.5 rounded-[11px] border-[1.5px] border-[var(--brand-border)] bg-white text-left transition-colors hover:border-[var(--brand-lime)] hover:bg-[var(--brand-lime-tint-hover)]"
            @click="step = 'assign'"
          >
            <span class="w-9 h-9 rounded-full bg-[var(--brand-lime-tint-hover)] flex items-center justify-center shrink-0">
              <Shirt class="w-[18px] h-[18px] text-[var(--brand-teal)]" stroke-width="1.7" />
            </span>
            <span>
              <span class="block font-bold text-[13.5px] text-[var(--brand-text)]">Blue collar</span>
              <span class="block text-[12px] text-[var(--brand-text-quiet)] mt-px">Merged by national or system ID</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Step 3: Assign to job / pool (optional) -->
      <div v-else>
        <div class="flex items-center gap-2 py-[11px] px-4 border-b border-[var(--brand-border-fade)] bg-[var(--brand-canvas)]">
          <button
            class="w-7 h-7 rounded-lg inline-flex items-center justify-center text-[var(--brand-text-subtle)] hover:bg-[var(--brand-border-divider)] transition-colors shrink-0"
            aria-label="Back"
            @click="step = 'collar'"
          >
            <ChevronLeft class="w-[15px] h-[15px]" stroke-width="2" />
          </button>
          <span class="flex-1 text-center font-bold text-[14px] text-[var(--brand-text)]">
            Assign to… <span class="font-normal text-[var(--brand-text-quiet)] text-[12px]">(optional)</span>
          </span>
          <span class="w-7 shrink-0" />
        </div>
        <div class="px-4 py-3">
          <div class="mb-2.5">
            <BrandSearchBar size="sm" placeholder="Search jobs and talent pools…" />
          </div>
          <div class="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--brand-text-quiet)] mb-1.5">Jobs</div>
          <div class="flex flex-col gap-px mb-3 max-h-[160px] overflow-y-auto">
            <label
              v-for="j in jobs"
              :key="j.id"
              class="flex items-center gap-2.5 px-1 py-2 rounded-md cursor-pointer text-[13.5px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] transition-colors"
            >
              <BrandLimeCheckbox
                :model-value="selectedJobIds.has(j.id)"
                @update:model-value="() => toggleJob(j.id)"
              />
              {{ j.title }}
            </label>
          </div>
          <div class="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--brand-text-quiet)] mb-1.5">Talent pools</div>
          <div class="flex flex-col gap-px mb-1">
            <label
              v-for="p in POOLS"
              :key="p"
              class="flex items-center gap-2.5 px-1 py-2 rounded-md cursor-pointer text-[13.5px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] transition-colors"
            >
              <BrandLimeCheckbox
                :model-value="selectedPools.has(p)"
                @update:model-value="() => togglePool(p)"
              />
              {{ p }}
            </label>
          </div>
        </div>
        <div class="flex items-center gap-2 px-4 py-3 border-t border-[var(--brand-border-fade)]">
          <BrandButton
            variant="outline"
            size="md"
            class="flex-1"
            @click="open = false"
          >
            Skip
          </BrandButton>
          <BrandButton
            variant="primary-lime"
            size="md"
            class="flex-[2]"
            @click="open = false"
          >
            Continue
          </BrandButton>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
