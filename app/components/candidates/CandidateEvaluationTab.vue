<!--
  Candidate Profile → Evaluation tab. Ported from the reference mockup's
  data-panel="evaluation", which has three sub-views local to the tab:
   1. list  — Summary / Completed / Requested segmented tables (default)
   2. picker — "Evaluate with Form" opens a categorized list of forms
   3. form  — the picked form: collapsible category (question chips + a
      1-5 category star rating) + a Final Candidate Evaluation card
      (comment + overall star rating) + Discard/Submit

  All three are local `evalView` state — there's no evaluation-forms
  backend wired up yet, so choosing a form, answering chips, and
  Submit/Discard all just navigate between these local views (mirrors the
  Notes composer's "no write endpoint yet" pattern elsewhere on this page).
-->
<script setup lang="ts">
import {
  UserPlus, ClipboardCheck, ArrowLeft, Star, Plus, X,
} from 'lucide-vue-next'
import { BrandButton, BrandAvatarInitials, BrandStatusBadge } from '~/components/brand'
import CandidateCollapsibleCard from '~/components/candidates/CandidateCollapsibleCard.vue'
import type { CandidateProfile } from '~/types'

defineProps<{ profile: CandidateProfile }>()

type Segment = 'summary' | 'completed' | 'requested'
type EvalView = 'list' | 'picker' | 'form'

const segment = ref<Segment>('summary')
const evalView = ref<EvalView>('list')

// ---- Summary ----
const STAGES = [
  { name: 'Sourced', dot: 'gray' as const, pct: 60, color: 'var(--brand-warning)' },
  { name: 'Applied', dot: 'gray' as const, pct: 100, color: 'var(--brand-success)' },
  { name: 'Phone Interview', dot: 'pipeline-blue' as const, pct: 80, color: 'var(--brand-success)' },
]
const AVG_SCORE = 80
// Semicircle gauge: r=36, circumference of the half-circle path ≈ 113.1
const GAUGE_TOTAL = 113.1
const gaugeOffset = computed(() => GAUGE_TOTAL * (1 - AVG_SCORE / 100))

// ---- Completed ----
const COMPLETED = [
  { id: 'c1', form: 'Professional Skills Review', score: 80, scoreColor: 'var(--brand-success)', stage: 'Sourced', dot: 'gray' as const, date: '18 Jun', evaluator: 'Sara Ali', initials: 'SA' },
  { id: 'c2', form: 'Culture & Team Fit Evaluation', score: 62, scoreColor: 'var(--brand-warning)', stage: 'Interview', dot: 'pipeline-blue' as const, date: '20 Jun', evaluator: 'Omar Khaled', initials: 'OK' },
  { id: 'c3', form: 'Interview Performance', score: 91, scoreColor: 'var(--brand-success)', stage: 'Offer', dot: 'teal-green' as const, date: '24 Jun', evaluator: 'Mo Salah', initials: 'MS' },
]

// ---- Requested ----
const REQUESTED = [
  { id: 'r1', form: 'Professional Skills Review', stage: 'Sourced', dot: 'gray' as const, deadline: '18 Jun', evaluator: 'Sara Ali', evalInitials: 'SA', requestedBy: 'Me', reqInitials: 'ME' },
  { id: 'r2', form: 'Culture & Team Fit Evaluation', stage: 'Interview', dot: 'pipeline-blue' as const, deadline: '22 Jun', evaluator: 'Omar Khaled', evalInitials: 'OK', requestedBy: 'Me', reqInitials: 'ME' },
  { id: 'r3', form: 'Coding & Problem Solving', stage: 'Assessment', dot: 'orange' as const, deadline: '25 Jun', evaluator: 'Mo Salah', evalInitials: 'MS', requestedBy: 'Me', reqInitials: 'ME' },
]

// ---- Form picker ----
const FORM_GROUPS = [
  {
    category: 'General Candidate Assessment',
    forms: [
      { name: 'Culture & Team Fit Evaluation', desc: 'Measures alignment with team values and work style' },
      { name: 'Full Form', desc: 'Form with all data types' },
      { name: 'Interview Performance Assessment', desc: 'Focused on how the candidate performed in the interview' },
      { name: 'Professional Skills Review', desc: 'Assesses workplace communication and professionalism' },
    ],
  },
  {
    category: 'Technical',
    forms: [
      { name: 'Coding & Problem Solving Assessment', desc: 'Evaluates logic, reasoning, and technical thinking' },
      { name: 'Engineering Competency Review', desc: 'For developers, engineers, and tech specialists' },
      { name: 'Technical Hiring Evaluation', desc: 'Comprehensive review for technical roles' },
    ],
  },
]
const selectedFormName = ref('')

function pickForm(name: string) {
  selectedFormName.value = name
  evalView.value = 'form'
}

// ---- Form questions (static — a real evaluation-forms API would drive this) ----
interface EvalQ {
  id: string
  label: string
  type: 'single' | 'multi' | 'date'
  options?: string[]
  value?: string
}
const QUESTIONS: EvalQ[] = [
  { id: 'q1', label: 'Single Choice Question', type: 'single', options: ['1', '3', '2', '4'] },
  { id: 'q2', label: 'Multi Choice Question', type: 'multi', options: ['M1', 'M2', 'M3'] },
  { id: 'q3', label: 'Yes/No question', type: 'single', options: ['Yes', 'No'] },
  { id: 'q4', label: 'Date Question', type: 'date', value: '7/12/2026' },
]
const singleAnswers = reactive<Record<string, string>>({})
const multiAnswers = reactive<Record<string, string[]>>({ q2: [] })

function toggleChip(q: EvalQ, opt: string) {
  if (q.type === 'multi') {
    const cur = multiAnswers[q.id] ?? []
    multiAnswers[q.id] = cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt]
  }
  else {
    singleAnswers[q.id] = singleAnswers[q.id] === opt ? '' : opt
  }
}
function isChipActive(q: EvalQ, opt: string) {
  return q.type === 'multi' ? (multiAnswers[q.id] ?? []).includes(opt) : singleAnswers[q.id] === opt
}

const categoryRating = ref(0)
const categoryHover = ref(0)
const finalRating = ref(0)
const finalHover = ref(0)
const finalComment = ref('')

const spotOpen = ref(false)
const spotQuestion = ref('')
const spotAnswer = ref('')

function resetForm() {
  selectedFormName.value = ''
  Object.keys(singleAnswers).forEach((k) => { singleAnswers[k] = '' })
  multiAnswers.q2 = []
  categoryRating.value = 0
  finalRating.value = 0
  finalComment.value = ''
  spotOpen.value = false
  spotQuestion.value = ''
  spotAnswer.value = ''
}

function startEvaluate() {
  evalView.value = 'picker'
}
function backToPicker() {
  evalView.value = 'picker'
}
function discardForm() {
  evalView.value = 'list'
  resetForm()
}
function submitForm() {
  evalView.value = 'list'
  segment.value = 'completed'
  resetForm()
}
</script>

<template>
  <div class="p-6 pb-9 w-full">
    <!-- Top bar (list view only) -->
    <div v-if="evalView === 'list'" class="flex items-center justify-between gap-3.5 flex-wrap mb-6">
      <div class="inline-flex bg-[var(--brand-surface-hover)] rounded-[10px] p-[3px]">
        <button
          v-for="s in (['summary', 'completed', 'requested'] as const)"
          :key="s"
          type="button"
          class="text-[13.5px] font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer capitalize"
          :class="segment === s
            ? 'bg-[var(--brand-surface-white)] text-[var(--brand-teal)] shadow-[0_1px_2px_rgba(0,20,18,0.08)]'
            : 'text-[var(--brand-text-secondary)]'"
          @click="segment = s"
        >{{ s }}</button>
      </div>
      <div class="flex items-center gap-3">
        <button type="button" class="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--brand-text-secondary)] cursor-pointer">
          <span class="w-7 h-7 rounded-full border-[1.6px] border-dashed border-[var(--brand-border-mid)] inline-flex items-center justify-center text-[var(--brand-text-disabled)]">
            <UserPlus class="w-[15px] h-[15px]" stroke-width="1.8" />
          </span>Assign to
        </button>
        <BrandButton variant="primary-teal" size="md" @click="startEvaluate">
          <ClipboardCheck class="w-4 h-4" stroke-width="1.9" />Evaluate with Form
        </BrandButton>
      </div>
    </div>

    <!-- ============ LIST VIEW ============ -->
    <template v-if="evalView === 'list'">
      <!-- Summary -->
      <div v-if="segment === 'summary'" class="flex flex-col gap-2.5">
        <div class="border border-[var(--brand-border-light)] rounded-[14px] px-[22px] py-5 bg-[var(--brand-surface-white)]">
          <div class="flex items-center gap-5">
            <div class="relative w-[88px] h-[52px] shrink-0">
              <svg width="88" height="52" viewBox="0 0 88 52">
                <path d="M8 48 A36 36 0 0 1 80 48" fill="none" stroke="var(--brand-track)" stroke-width="8" stroke-linecap="round" />
                <path d="M8 48 A36 36 0 0 1 80 48" fill="none" stroke="var(--brand-success)" stroke-width="6" stroke-linecap="round" :stroke-dasharray="GAUGE_TOTAL" :stroke-dashoffset="gaugeOffset" />
              </svg>
              <div class="absolute inset-x-0 bottom-0 text-center font-mono font-bold text-[16px] text-[var(--brand-text)]">{{ AVG_SCORE }}%</div>
            </div>
            <div>
              <div class="text-[15px] font-semibold text-[var(--brand-text)]">Average Evaluation Score</div>
              <div class="text-[13.5px] text-[var(--brand-text-muted)] mt-0.5">
                Evaluation score based on <span class="text-[var(--brand-teal-secondary)] font-semibold">3 evaluation(s)</span> from <span class="text-[var(--brand-teal-secondary)] font-semibold">1 interviewer(s)</span>
              </div>
              <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Last one completed a few seconds ago</div>
            </div>
          </div>
        </div>

        <div class="border border-[var(--brand-border-light)] rounded-[14px] bg-[var(--brand-surface-white)] overflow-hidden">
          <div v-for="st in STAGES" :key="st.name" class="px-[18px] py-4 border-b border-[var(--brand-border-hairline)] last:border-b-0">
            <div class="flex items-center justify-between mb-3.5">
              <BrandStatusBadge :label="st.name" :tone="st.dot" variant="dot" plain-label class="!text-[14px] !font-semibold" />
              <span class="text-[14px] font-bold tabular-nums" :style="{ color: st.color }">{{ st.pct }}%</span>
            </div>
            <div class="flex items-center gap-3.5">
              <BrandAvatarInitials initials="ME" size="sm" />
              <span class="text-[13px] font-semibold text-[var(--brand-text-muted)] shrink-0 min-w-[104px]">1 interviewer(s)</span>
              <span class="flex-1 h-[7px] rounded-full bg-[var(--brand-track)] overflow-hidden">
                <span class="block h-full rounded-full" :style="{ width: `${st.pct}%`, background: st.color }" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed -->
      <div v-else-if="segment === 'completed'" class="border border-[var(--brand-border-light)] rounded-xl bg-[var(--brand-surface-white)] overflow-hidden overflow-x-auto">
        <div class="grid grid-cols-[1.8fr_0.9fr_1.1fr_1fr_1.4fr] bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)] text-[13px] font-semibold text-[var(--brand-nav-text)] min-w-[640px]">
          <span class="px-5 py-3.5 border-r border-[var(--brand-border-hairline)]">Form name</span>
          <span class="px-5 py-3.5 border-r border-[var(--brand-border-hairline)]">Score</span>
          <span class="px-5 py-3.5 border-r border-[var(--brand-border-hairline)]">Stage</span>
          <span class="px-5 py-3.5 border-r border-[var(--brand-border-hairline)]">Date</span>
          <span class="px-5 py-3.5">Evaluator</span>
        </div>
        <div
          v-for="(row, i) in COMPLETED"
          :key="row.id"
          class="grid grid-cols-[1.8fr_0.9fr_1.1fr_1fr_1.4fr] items-center border-b border-[var(--brand-border-row)] last:border-b-0 text-[14px] text-[var(--brand-text)] min-w-[640px]"
          :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]' : ''"
        >
          <span class="px-5 py-3 border-r border-[var(--brand-border-hairline)] font-semibold">{{ row.form }}</span>
          <span class="px-5 py-3 border-r border-[var(--brand-border-hairline)] font-bold tabular-nums" :style="{ color: row.scoreColor }">{{ row.score }}%</span>
          <span class="px-5 py-3 border-r border-[var(--brand-border-hairline)]"><BrandStatusBadge :label="row.stage" :tone="row.dot" variant="dot" plain-label /></span>
          <span class="px-5 py-3 border-r border-[var(--brand-border-hairline)] text-[var(--brand-text-secondary)]">{{ row.date }}</span>
          <span class="px-5 py-3 flex items-center gap-2.5">
            <BrandAvatarInitials :initials="row.initials" size="sm" bg="var(--brand-text)" />
            <span class="font-semibold">{{ row.evaluator }}</span>
          </span>
        </div>
      </div>

      <!-- Requested -->
      <div v-else class="border border-[var(--brand-border-light)] rounded-xl bg-[var(--brand-surface-white)] overflow-hidden overflow-x-auto">
        <div class="grid grid-cols-[2fr_1.2fr_1fr_1.4fr_1.4fr] bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)] text-[13px] font-semibold text-[var(--brand-nav-text)] min-w-[680px]">
          <span class="px-5 py-3.5 border-r border-[var(--brand-border-hairline)]">Form name</span>
          <span class="px-5 py-3.5 border-r border-[var(--brand-border-hairline)]">Stage</span>
          <span class="px-5 py-3.5 border-r border-[var(--brand-border-hairline)]">Deadline</span>
          <span class="px-5 py-3.5 border-r border-[var(--brand-border-hairline)]">Evaluator</span>
          <span class="px-5 py-3.5">Requested by</span>
        </div>
        <div
          v-for="(row, i) in REQUESTED"
          :key="row.id"
          class="grid grid-cols-[2fr_1.2fr_1fr_1.4fr_1.4fr] items-center border-b border-[var(--brand-border-row)] last:border-b-0 text-[14px] text-[var(--brand-text)] min-w-[680px]"
          :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]' : ''"
        >
          <span class="px-5 py-3 border-r border-[var(--brand-border-hairline)] font-semibold">{{ row.form }}</span>
          <span class="px-5 py-3 border-r border-[var(--brand-border-hairline)]"><BrandStatusBadge :label="row.stage" :tone="row.dot" variant="dot" plain-label /></span>
          <span class="px-5 py-3 border-r border-[var(--brand-border-hairline)] text-[var(--brand-text-secondary)]">{{ row.deadline }}</span>
          <span class="px-5 py-3 border-r border-[var(--brand-border-hairline)] flex items-center gap-2.5">
            <BrandAvatarInitials :initials="row.evalInitials" size="sm" bg="var(--brand-text)" /><span class="font-semibold">{{ row.evaluator }}</span>
          </span>
          <span class="px-5 py-3 flex items-center gap-2.5">
            <BrandAvatarInitials :initials="row.reqInitials" size="sm" bg="var(--brand-text)" /><span class="font-semibold">{{ row.requestedBy }}</span>
          </span>
        </div>
      </div>
    </template>

    <!-- ============ FORM PICKER ============ -->
    <template v-else-if="evalView === 'picker'">
      <div class="flex items-center gap-2.5 mb-4 cursor-pointer" @click="evalView = 'list'">
        <span class="w-8 h-8 rounded-[10px] bg-[var(--brand-surface-hover)] inline-flex items-center justify-center text-[var(--brand-text-secondary)]">
          <ArrowLeft class="w-[17px] h-[17px]" stroke-width="2" />
        </span>
        <span class="text-[14px] font-semibold text-[var(--brand-text)]">Evaluation Forms</span>
      </div>
      <div v-for="group in FORM_GROUPS" :key="group.category" class="border border-[var(--brand-border-light)] rounded-[14px] px-4 py-3.5 mb-3.5 bg-[var(--brand-surface-white)]">
        <div class="text-[14px] font-semibold text-[var(--brand-text)] mb-1.5">{{ group.category }}</div>
        <button
          v-for="f in group.forms"
          :key="f.name"
          type="button"
          class="w-full flex items-center gap-3 py-1.5 cursor-pointer text-left"
          @click="pickForm(f.name)"
        >
          <span class="w-5 h-5 shrink-0 rounded-full border-2 border-[var(--brand-border-mid)] inline-flex items-center justify-center">
            <span v-if="selectedFormName === f.name" class="w-2.5 h-2.5 rounded-full bg-[var(--brand-teal)]" />
          </span>
          <span class="text-[14px] font-semibold text-[var(--brand-text)]">{{ f.name }}</span>
          <span class="text-[13px] text-[var(--brand-text-quiet)]">({{ f.desc }})</span>
        </button>
      </div>
    </template>

    <!-- ============ FORM ============ -->
    <template v-else>
      <div class="flex items-center gap-2.5 mb-4 cursor-pointer" @click="backToPicker">
        <span class="w-8 h-8 rounded-[10px] bg-[var(--brand-surface-hover)] inline-flex items-center justify-center text-[var(--brand-text-secondary)]">
          <ArrowLeft class="w-[17px] h-[17px]" stroke-width="2" />
        </span>
        <span class="text-[14px] font-semibold text-[var(--brand-text)]">{{ selectedFormName || 'Evaluation Forms' }}</span>
      </div>

      <CandidateCollapsibleCard title="Category 1" class="mb-4">
        <div v-for="(q, i) in QUESTIONS" :key="q.id" class="flex gap-3.5 pb-4 last:pb-0">
          <span class="w-[26px] h-[26px] shrink-0 rounded-full border-[1.5px] border-[var(--brand-border)] inline-flex items-center justify-center text-[12px] text-[var(--brand-text-quiet)] bg-[var(--brand-surface-white)]">{{ i + 1 }}</span>
          <div class="flex-1">
            <div class="text-[14px] font-semibold text-[var(--brand-text)] mb-2.5">
              {{ q.label }} <span class="text-[var(--brand-danger)]">*</span>
            </div>
            <input
              v-if="q.type === 'date'"
              type="text"
              :value="q.value"
              readonly
              class="w-full box-border border border-[var(--brand-border)] rounded-[10px] px-3.5 py-3 text-[14px] text-[var(--brand-text-secondary)] bg-[var(--brand-surface-white)] outline-none"
            >
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="opt in q.options"
                :key="opt"
                type="button"
                class="inline-flex items-center justify-center min-w-[42px] px-3.5 py-2 rounded-lg text-[13.5px] font-semibold cursor-pointer"
                :class="isChipActive(q, opt)
                  ? 'bg-[var(--brand-teal)] border border-[var(--brand-teal)] text-white'
                  : 'bg-[var(--brand-surface-white)] border border-[var(--brand-border)] text-[var(--brand-text)]'"
                @click="toggleChip(q, opt)"
              >{{ opt }}</button>
            </div>
          </div>
        </div>

        <div class="h-px bg-[var(--brand-border-light)] my-4" />
        <div class="flex items-center gap-3">
          <span class="text-[13.5px] font-semibold text-[var(--brand-text-secondary)]">Rate this category (1–5):</span>
          <span class="flex gap-0.5">
            <button
              v-for="v in 5"
              :key="v"
              type="button"
              class="cursor-pointer"
              @mouseenter="categoryHover = v"
              @mouseleave="categoryHover = 0"
              @click="categoryRating = v"
            >
              <Star
                class="w-5 h-5"
                :class="(categoryHover || categoryRating) >= v ? 'text-[var(--brand-warning)] fill-[var(--brand-warning)]' : 'text-[var(--brand-border)] fill-[var(--brand-border)]'"
                stroke-width="1.5"
              />
            </button>
          </span>
        </div>
      </CandidateCollapsibleCard>

      <!-- On-the-spot question -->
      <div v-if="spotOpen" class="border border-[var(--brand-border-light)] rounded-[14px] bg-[var(--brand-surface-white)] px-[18px] py-4 mb-4">
        <div class="flex items-center justify-between gap-3 mb-2.5">
          <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">On the spot question</div>
          <button type="button" class="w-[34px] h-[34px] inline-flex items-center justify-center rounded-[10px] bg-[var(--brand-surface-hover)] text-[var(--brand-text-secondary)] cursor-pointer" @click="spotOpen = false">
            <X class="w-4 h-4" stroke-width="2" />
          </button>
        </div>
        <input v-model="spotQuestion" type="text" placeholder="Question name" class="w-full box-border border border-[var(--brand-border)] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[var(--brand-text)] outline-none mb-2.5">
        <input v-model="spotAnswer" type="text" placeholder="Answer" class="w-full box-border border border-[var(--brand-border)] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[var(--brand-text)] outline-none">
      </div>

      <!-- Final evaluation -->
      <div class="border border-[var(--brand-border-light)] rounded-[14px] bg-[var(--brand-surface-white)] px-[18px] py-4 mb-4">
        <div class="text-[15px] font-semibold text-[var(--brand-text)]">Final Candidate Evaluation</div>
        <div class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5 mb-4">The Final Score overrides the category average and will not update automatically once set manually</div>
        <div class="text-[13.5px] font-semibold text-[var(--brand-text)] mb-2">Final Comment (Optional)</div>
        <input v-model="finalComment" type="text" placeholder="Type here…" class="w-full box-border border border-[var(--brand-border)] rounded-[10px] px-3.5 py-3 text-[14px] text-[var(--brand-text)] outline-none mb-4">
        <div class="flex items-center gap-3">
          <span class="text-[13.5px] font-semibold text-[var(--brand-text-secondary)]">Overall candidate rating:</span>
          <span class="flex gap-0.5">
            <button
              v-for="v in 5"
              :key="v"
              type="button"
              class="cursor-pointer"
              @mouseenter="finalHover = v"
              @mouseleave="finalHover = 0"
              @click="finalRating = v"
            >
              <Star
                class="w-5 h-5"
                :class="(finalHover || finalRating) >= v ? 'text-[var(--brand-warning)] fill-[var(--brand-warning)]' : 'text-[var(--brand-border)] fill-[var(--brand-border)]'"
                stroke-width="1.5"
              />
            </button>
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4 flex-wrap">
        <button v-if="!spotOpen" type="button" class="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--brand-text)] cursor-pointer" @click="spotOpen = true">
          <Plus class="w-4 h-4" stroke-width="2" />Add on the spot question
        </button>
        <span v-else />
        <span class="flex gap-3 ml-auto">
          <BrandButton variant="outline" size="lg" @click="discardForm">Discard</BrandButton>
          <BrandButton variant="primary-teal" size="lg" @click="submitForm">Submit your evaluation</BrandButton>
        </span>
      </div>
    </template>
  </div>
</template>
