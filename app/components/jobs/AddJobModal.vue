<!--
  Add-job modal — two-step chooser ported from the Recruitera reference
  Standalone HTML. Everything reuses existing primitives:
    • shadcn Dialog (same modal wrapper used by the Referral modal on
      Job Detail and by settings modals)
    • BrandButton for CTA + ghost / outline
    • useJobTemplates() when the user picks "From template"
    • --brand-* tokens for every color (no hex)

  Flow:
    Step 1  "Choose a starting point."  →  From template  |  Blank job  |  Duplicate an existing job
    Step 2a (template)  →  search + template list  →  Continue
    Step 2b (blank)     →  title + collar (White / Blue) → Create job
    Step 2c (duplicate) →  search + existing-jobs list  →  Continue

  Emits `create` with the built payload; parent decides what to do with
  it (add to fixture today, POST /api/jobs when the API lands).
-->
<script setup lang="ts">
import { X, Search, FileText, Sparkles, Briefcase, HardHat, Check, Copy } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { useJobTemplates } from '~/composables/useTemplates'
import { useJobs } from '~/composables/useJobs'
import type { JobTemplate } from '~/types'

export type CollarType = 'white' | 'blue'
export interface AddJobPayload {
  source: 'template' | 'blank' | 'duplicate'
  title?: string
  collar?: CollarType
  templateId?: string
  sourceJobId?: string
}

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  create: [payload: AddJobPayload]
}>()

type Step = 'choose' | 'template' | 'blank' | 'duplicate'
const step = ref<Step>('choose')

// Template step state
const templateSearch = ref('')
const selectedTemplateId = ref<string | null>(null)
const { data: templatesData } = useJobTemplates()
const templates = computed<JobTemplate[]>(() => templatesData.value?.data ?? [])
const filteredTemplates = computed(() => {
  const q = templateSearch.value.trim().toLowerCase()
  if (!q) return templates.value
  return templates.value.filter(t =>
    t.name.toLowerCase().includes(q)
    || t.jobName.toLowerCase().includes(q)
    || t.department.toLowerCase().includes(q))
})

// Blank step state
const blankTitle = ref('')
const blankCollar = ref<CollarType | null>(null)

// Duplicate step state — pick an existing job to clone.
const dupSearch = ref('')
const selectedDupJobId = ref<string | null>(null)
const { jobs } = useJobs()
const filteredJobsForDup = computed(() => {
  const q = dupSearch.value.trim().toLowerCase()
  if (!q) return jobs.value
  return jobs.value.filter(j =>
    j.title.toLowerCase().includes(q)
    || j.department.toLowerCase().includes(q)
    || j.location.toLowerCase().includes(q))
})

const canContinueTemplate  = computed(() => !!selectedTemplateId.value)
const canCreateBlank       = computed(() => !!blankTitle.value.trim() && !!blankCollar.value)
const canContinueDuplicate = computed(() => !!selectedDupJobId.value)

// Reset everything whenever the modal closes so it re-opens fresh.
watch(open, (isOpen) => {
  if (!isOpen) {
    step.value = 'choose'
    selectedTemplateId.value = null
    templateSearch.value = ''
    blankTitle.value = ''
    blankCollar.value = null
    dupSearch.value = ''
    selectedDupJobId.value = null
  }
})

function submit() {
  if (step.value === 'template' && canContinueTemplate.value) {
    emit('create', { source: 'template', templateId: selectedTemplateId.value! })
    open.value = false
  } else if (step.value === 'blank' && canCreateBlank.value) {
    emit('create', { source: 'blank', title: blankTitle.value.trim(), collar: blankCollar.value! })
    open.value = false
  } else if (step.value === 'duplicate' && canContinueDuplicate.value) {
    const src = jobs.value.find(j => j.id === selectedDupJobId.value)
    emit('create', { source: 'duplicate', sourceJobId: selectedDupJobId.value!, title: src?.title, collar: src?.collar as CollarType | undefined })
    open.value = false
  }
}

// Header copy per step — keeps the JSX below tidy.
const header = computed(() => {
  if (step.value === 'template')  return { title: 'Select a template',            subtitle: 'Start from a saved template — you can still edit every field.' }
  if (step.value === 'blank')     return { title: 'Blank job',                    subtitle: 'Enter the job title and select the collar type.' }
  if (step.value === 'duplicate') return { title: 'Duplicate an existing job',    subtitle: 'Pick a job to use as your starting point.' }
  return                               { title: 'New job',                     subtitle: 'Choose a starting point.' }
})

const primaryLabel = computed(() =>
  step.value === 'template'  ? 'Continue' :
  step.value === 'blank'     ? 'Create job' :
  step.value === 'duplicate' ? 'Continue' :
                               null,
)
const primaryDisabled = computed(() =>
  step.value === 'template'  ? !canContinueTemplate.value :
  step.value === 'blank'     ? !canCreateBlank.value :
  step.value === 'duplicate' ? !canContinueDuplicate.value :
                               true,
)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-0 rounded-[20px] max-w-[680px] w-[92vw] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-white overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-start gap-3 px-7 pt-6 pb-5">
        <div class="flex-1 min-w-0">
          <DialogTitle class="text-[22px] font-bold text-[var(--brand-text)] leading-tight">{{ header.title }}</DialogTitle>
          <p class="text-[14px] text-[var(--brand-text-quiet)] mt-1">{{ header.subtitle }}</p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-[8px] inline-flex items-center justify-center bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)] hover:text-[var(--brand-text)] transition"
          aria-label="Close"
          @click="open = false"
        >
          <X class="w-4 h-4" stroke-width="2" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-7 pb-6 max-h-[68vh] overflow-y-auto">
        <!-- STEP 1: chooser -->
        <div v-if="step === 'choose'" class="grid gap-3">
          <button
            type="button"
            class="group text-left flex items-start gap-4 rounded-[12px] border-[1.5px] border-[var(--brand-border)] bg-white px-5 py-4 transition hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] focus:outline-none focus:border-[var(--brand-teal)]"
            @click="step = 'template'"
          >
            <span class="w-10 h-10 rounded-[10px] inline-flex items-center justify-center bg-[var(--brand-canvas)] text-[var(--brand-teal)] group-hover:bg-white shrink-0">
              <FileText class="w-5 h-5" stroke-width="1.8" />
            </span>
            <span class="flex-1">
              <span class="block text-[15px] font-bold text-[var(--brand-text)]">From template</span>
              <span class="block text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Use a template as a starting point. Customize it as needed.</span>
            </span>
          </button>

          <button
            type="button"
            class="group text-left flex items-start gap-4 rounded-[12px] border-[1.5px] border-[var(--brand-border)] bg-white px-5 py-4 transition hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] focus:outline-none focus:border-[var(--brand-teal)]"
            @click="step = 'blank'"
          >
            <span class="w-10 h-10 rounded-[10px] inline-flex items-center justify-center bg-[var(--brand-canvas)] text-[var(--brand-teal)] group-hover:bg-white shrink-0">
              <Sparkles class="w-5 h-5" stroke-width="1.8" />
            </span>
            <span class="flex-1">
              <span class="block text-[15px] font-bold text-[var(--brand-text)]">Blank job</span>
              <span class="block text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Start from scratch.</span>
            </span>
          </button>

          <button
            type="button"
            class="group text-left flex items-start gap-4 rounded-[12px] border-[1.5px] border-[var(--brand-border)] bg-white px-5 py-4 transition hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] focus:outline-none focus:border-[var(--brand-teal)]"
            @click="step = 'duplicate'"
          >
            <span class="w-10 h-10 rounded-[10px] inline-flex items-center justify-center bg-[var(--brand-canvas)] text-[var(--brand-teal)] group-hover:bg-white shrink-0">
              <Copy class="w-5 h-5" stroke-width="1.8" />
            </span>
            <span class="flex-1">
              <span class="block text-[15px] font-bold text-[var(--brand-text)]">Duplicate an existing job</span>
              <span class="block text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Use an existing job as your starting point.</span>
            </span>
          </button>
        </div>

        <!-- STEP 2a: template -->
        <div v-else-if="step === 'template'">
          <div class="relative mb-4">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)]" stroke-width="2" />
            <input
              v-model="templateSearch"
              type="text"
              placeholder="Search job templates"
              class="w-full h-10 pl-9 pr-3 text-[13.5px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
            >
          </div>

          <div class="flex items-center gap-2 mb-2">
            <span class="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-secondary)]">Job templates</span>
            <span class="text-[11px] font-bold rounded-md px-[7px] py-px tabular-nums text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)]">{{ filteredTemplates.length }}</span>
          </div>

          <div v-if="filteredTemplates.length" class="flex flex-col gap-1.5">
            <label
              v-for="t in filteredTemplates"
              :key="t.id"
              class="flex items-start gap-3 rounded-[10px] border border-[var(--brand-border)] bg-white px-4 py-3 cursor-pointer transition hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]"
              :class="selectedTemplateId === t.id ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]' : ''"
            >
              <input
                v-model="selectedTemplateId"
                type="radio"
                name="job-template"
                :value="t.id"
                class="mt-1 accent-[var(--brand-teal)]"
              >
              <div class="min-w-0 flex-1">
                <div class="text-[14px] font-bold text-[var(--brand-text)] truncate">{{ t.name }}</div>
                <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5 truncate">
                  {{ t.jobName }} · {{ t.department }} · {{ t.locations.join(', ') }}
                </div>
              </div>
            </label>
          </div>
          <div v-else class="text-center py-10 text-[13px] text-[var(--brand-text-quiet)]">
            No templates match “{{ templateSearch }}”.
          </div>
        </div>

        <!-- STEP 2c: duplicate an existing job -->
        <div v-else-if="step === 'duplicate'">
          <div class="relative mb-4">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)]" stroke-width="2" />
            <input
              v-model="dupSearch"
              type="text"
              placeholder="Search existing jobs"
              class="w-full h-10 pl-9 pr-3 text-[13.5px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
            >
          </div>

          <div class="flex items-center gap-2 mb-2">
            <span class="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-secondary)]">Existing jobs</span>
            <span class="text-[11px] font-bold rounded-md px-[7px] py-px tabular-nums text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)]">{{ filteredJobsForDup.length }}</span>
          </div>

          <div v-if="filteredJobsForDup.length" class="flex flex-col gap-1.5">
            <label
              v-for="j in filteredJobsForDup"
              :key="j.id"
              class="flex items-start gap-3 rounded-[10px] border border-[var(--brand-border)] bg-white px-4 py-3 cursor-pointer transition hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]"
              :class="selectedDupJobId === j.id ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]' : ''"
            >
              <input
                v-model="selectedDupJobId"
                type="radio"
                name="dup-job"
                :value="j.id"
                class="mt-1 accent-[var(--brand-teal)]"
              >
              <div class="min-w-0 flex-1">
                <div class="text-[14px] font-bold text-[var(--brand-text)] truncate">{{ j.title }}</div>
                <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5 truncate">
                  {{ j.department }} · {{ j.location }} · {{ j.workModel }}
                </div>
              </div>
            </label>
          </div>
          <div v-else class="text-center py-10 text-[13px] text-[var(--brand-text-quiet)]">
            No jobs match “{{ dupSearch }}”.
          </div>
        </div>

        <!-- STEP 2b: blank -->
        <div v-else-if="step === 'blank'">
          <div class="mb-5">
            <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-1.5">
              Title <span class="text-[var(--brand-status-closed-text)]">*</span>
            </label>
            <input
              v-model="blankTitle"
              type="text"
              placeholder="e.g. Senior Backend Engineer"
              class="w-full h-11 px-3.5 text-[14px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
            >
          </div>

          <div>
            <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-1.5">
              Collar type <span class="text-[var(--brand-status-closed-text)]">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="group relative text-left flex flex-col gap-1 rounded-[12px] border-[1.5px] px-4 py-4 transition focus:outline-none"
                :class="blankCollar === 'white'
                  ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]'
                  : 'border-[var(--brand-border)] bg-white hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]'"
                @click="blankCollar = 'white'"
              >
                <span class="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--brand-text)]">
                  <Briefcase class="w-4 h-4 text-[var(--brand-teal-secondary)]" stroke-width="1.8" />
                  White collar
                </span>
                <span class="text-[12px] text-[var(--brand-text-quiet)]">English · AI in English · Monthly salary</span>
                <span
                  v-if="blankCollar === 'white'"
                  class="absolute top-3 right-3 w-5 h-5 rounded-md bg-[var(--brand-teal)] inline-flex items-center justify-center"
                  aria-hidden="true"
                ><Check class="w-3 h-3 text-[var(--brand-lime)]" stroke-width="3" /></span>
              </button>

              <button
                type="button"
                class="group relative text-left flex flex-col gap-1 rounded-[12px] border-[1.5px] px-4 py-4 transition focus:outline-none"
                :class="blankCollar === 'blue'
                  ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]'
                  : 'border-[var(--brand-border)] bg-white hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]'"
                @click="blankCollar = 'blue'"
              >
                <span class="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--brand-text)]">
                  <HardHat class="w-4 h-4 text-[var(--brand-teal-secondary)]" stroke-width="1.8" />
                  Blue collar
                </span>
                <span class="text-[12px] text-[var(--brand-text-quiet)]">Arabic · AI in Arabic · Daily salary</span>
                <span
                  v-if="blankCollar === 'blue'"
                  class="absolute top-3 right-3 w-5 h-5 rounded-md bg-[var(--brand-teal)] inline-flex items-center justify-center"
                  aria-hidden="true"
                ><Check class="w-3 h-3 text-[var(--brand-lime)]" stroke-width="3" /></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between gap-2 px-7 py-4 border-t border-[var(--brand-border-fade)] bg-white">
        <button
          v-if="step !== 'choose'"
          type="button"
          class="text-[13.5px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text-secondary)]"
          @click="step = 'choose'"
        >Go back</button>
        <span v-else />

        <div class="inline-flex items-center gap-2">
          <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
          <BrandButton
            v-if="primaryLabel"
            variant="primary-teal"
            :disabled="primaryDisabled"
            @click="submit"
          >{{ primaryLabel }}</BrandButton>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
