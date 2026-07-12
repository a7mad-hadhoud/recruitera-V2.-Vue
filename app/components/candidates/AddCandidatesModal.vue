<!--
  "Add candidates" flow, ported from the design (Recruitera Candidates.dc.html
  .add-menu). Three steps:
   1. Choose method — CV upload / Manually / Import CSV / Browser extension
   2. Collar type — White / Blue (skipped for the browser-extension method)
   3. Assign to job/pool (optional) — search + checkbox lists, Skip/Continue
  Steps 2 and 3 are mocked (no upload/assign wiring yet) — this ports the
  interaction shell so the flow matches the design pixel-for-pixel.
-->
<script setup lang="ts">
import { Plus, ChevronRight, ChevronLeft, FileText, Pencil, FileSpreadsheet, Globe, Search, User, Shirt } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { BrandLimeCheckbox } from '~/components/brand'

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

const JOBS = ['Backend Engineer', 'Product Designer', 'Developer']
const POOLS = ['Leadership Pipeline', 'Data & ML']

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

watch(open, (next) => { if (!next) reset() })
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        size="sm"
        class="h-9 rounded-lg font-semibold bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90 shrink-0"
      >
        <Plus class="w-4 h-4 mr-1" />
        Add candidates
      </Button>
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
          <div class="flex items-center gap-2 border-[1.5px] border-[var(--brand-border)] rounded-[9px] px-3 py-2 mb-2.5">
            <Search class="w-[15px] h-[15px] text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.7" />
            <input
              type="text"
              placeholder="Search jobs and talent pools…"
              class="flex-1 border-none outline-none bg-transparent text-[13.5px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]"
            />
          </div>
          <div class="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--brand-text-quiet)] mb-1.5">Jobs</div>
          <div class="flex flex-col gap-px mb-3">
            <label
              v-for="j in JOBS"
              :key="j"
              class="flex items-center gap-2.5 px-1 py-2 rounded-md cursor-pointer text-[13.5px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] transition-colors"
            >
              <BrandLimeCheckbox />
              {{ j }}
            </label>
          </div>
          <div class="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--brand-text-quiet)] mb-1.5">Talent pools</div>
          <div class="flex flex-col gap-px mb-1">
            <label
              v-for="p in POOLS"
              :key="p"
              class="flex items-center gap-2.5 px-1 py-2 rounded-md cursor-pointer text-[13.5px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] transition-colors"
            >
              <BrandLimeCheckbox />
              {{ p }}
            </label>
          </div>
        </div>
        <div class="flex items-center gap-2 px-4 py-3 border-t border-[var(--brand-border-fade)]">
          <button
            class="flex-1 font-semibold text-[13.5px] text-[var(--brand-text-subtle)] bg-white border border-[var(--brand-border)] rounded-[9px] py-[9px] hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
            @click="open = false"
          >
            Skip
          </button>
          <button
            class="flex-[2] font-bold text-[13.5px] text-[var(--brand-teal)] bg-[var(--brand-lime)] border-none rounded-[9px] py-[9px] hover:brightness-105 transition-[filter]"
            @click="open = false"
          >
            Continue
          </button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
