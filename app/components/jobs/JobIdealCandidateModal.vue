<!--
  Ideal candidate profile (ICP) modal — opened from the Workflow tab's
  "Screening and matching candidates" (AI) card.

  Per criterion (checkbox columns, matching the reference):
    · Fully met            — checkbox
    · Partially met        — checkbox
    · Disqualify if missing— checkbox
    · Show in job post     — eye toggle

  Each SECTION carries a weight; the section weights sum to 100% (shown
  in the header, not enforced on save). Reuses shadcn Dialog +
  BrandLimeCheckbox + BrandButton; --brand-* tokens only, no new deps.
  Seeded with the recommended criteria; swap for the job's saved ICP
  when the API lands. On a live job, changes apply to NEW applicants
  only — existing scores are preserved.
-->
<script setup lang="ts">
import { FileText, X, Plus, Trash2, Eye, EyeOff, Check, AlertTriangle } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { BrandButton, BrandLimeCheckbox } from '~/components/brand'

interface Criterion { id: string; text: string; fullyMet: boolean; partiallyMet: boolean; disqualify: boolean; showInPost: boolean }
interface CriteriaGroup { id: string; title: string; weight: number; criteria: Criterion[] }

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ save: [groups: CriteriaGroup[]] }>()

function cid(p: string) { return `${p}-${Math.random().toString(36).slice(2, 7)}` }
// `level`: 'full' seeds Fully-met, 'partial' seeds Partially-met.
function crit(text: string, level: 'full' | 'partial', disqualify = false): Criterion {
  return { id: cid('c'), text, fullyMet: level === 'full', partiallyMet: level === 'partial', disqualify, showInPost: true }
}

// Recommended defaults + section weights (spec AI Weights).
function defaultGroups(): CriteriaGroup[] {
  return [
    { id: cid('g'), title: 'Work Experience', weight: 25, criteria: [
      crit("Minimum years of relevant experience in the role's field", 'full'),
      crit('Experience in the same or closely related industry', 'full'),
      crit('Prior experience in a similar role or job title', 'full', true),
    ] },
    { id: cid('g'), title: 'Education', weight: 10, criteria: [
      crit('Minimum educational qualification (degree, diploma, or equivalent)', 'full'),
      crit('Relevant field of study or major', 'partial'),
      crit('Professional certifications or licenses required for the role', 'full'),
    ] },
    { id: cid('g'), title: 'Skills', weight: 20, criteria: [
      crit('Core technical skills required to perform the job', 'full'),
      crit('Proficiency in required tools, software, or platforms', 'full'),
      crit('Language proficiency (if required for the role)', 'full'),
    ] },
    { id: cid('g'), title: 'Keywords', weight: 20, criteria: [
      crit('Key role-specific terms present in CV or application', 'full'),
      crit('Industry-specific terminology that signals domain knowledge', 'partial'),
      crit('Job title keywords aligned with seniority level', 'full'),
    ] },
    { id: cid('g'), title: 'Achievements', weight: 15, criteria: [
      crit('Quantifiable results or impact demonstrated in past roles', 'partial'),
      crit('Evidence of exceeding targets or above-average performance', 'partial'),
      crit('Awards, recognitions, or notable projects relevant to the role', 'partial'),
    ] },
    { id: cid('g'), title: 'Relevance to Job Description', weight: 10, criteria: [
      crit("Overall alignment between candidate background and this job's requirements", 'full'),
      crit("Alignment with the role's seniority level and scope", 'full'),
      crit('Location or work model compatibility', 'partial'),
    ] },
  ]
}

const groups = ref<CriteriaGroup[]>(defaultGroups())

const weightTotal = computed(() => groups.value.reduce((s, g) => s + (Number(g.weight) || 0), 0))
const weightValid = computed(() => weightTotal.value === 100)

function addCriterion(group: CriteriaGroup) {
  group.criteria.push(crit('', 'full'))
}
function removeCriterion(group: CriteriaGroup, id: string) {
  group.criteria = group.criteria.filter(c => c.id !== id)
}
function deleteAll(group: CriteriaGroup) {
  group.criteria = []
}
function toggleShow(c: Criterion) { c.showInPost = !c.showInPost }
function resetDefaults() { groups.value = defaultGroups() }
function onSave() {
  emit('save', groups.value)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-0 rounded-[18px] max-w-[960px] w-[95vw] max-h-[90vh] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-white overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 px-7 h-[68px] border-b border-[var(--brand-border-fade)] shrink-0">
        <FileText class="w-[18px] h-[18px] text-[var(--brand-text-secondary)]" stroke-width="1.7" />
        <DialogTitle class="flex-1 text-[18px] font-bold text-[var(--brand-text)]">Ideal candidate profile</DialogTitle>
        <span
          class="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[12px] font-bold"
          :class="weightValid
            ? 'text-[var(--brand-status-approved-text)] bg-[var(--brand-status-approved-bg)]'
            : 'text-[var(--brand-status-closed-text)] bg-[var(--brand-status-closed-bg)]'"
          title="Section weights should sum to 100%"
        >
          <component :is="weightValid ? Check : AlertTriangle" class="w-3.5 h-3.5" stroke-width="2.2" />
          Weights {{ weightTotal }}%
        </span>
        <button
          type="button"
          class="w-8 h-8 rounded-[8px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition"
          aria-label="Close"
          @click="open = false"
        >
          <X class="w-4 h-4" stroke-width="2" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-7 py-6">
        <p class="text-[13.5px] text-[var(--brand-text-quiet)] leading-relaxed">
          Fine-tune your ideal candidate profile. For each criterion mark how it must be met, add disqualifiers, and choose what to show in the job post.
          Set a weight per section to steer how the Agent scores applicants.
          <a href="#" class="font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]">Learn how it works.</a>
        </p>
        <p class="text-[12.5px] text-[var(--brand-text-quiet)] mt-1.5">
          On a live job, changes apply to <span class="font-semibold text-[var(--brand-text-secondary)]">new applicants only</span> — already-scored candidates keep their scores.
        </p>

        <div class="mt-6 flex flex-col gap-4">
          <section
            v-for="group in groups"
            :key="group.id"
            class="rounded-[14px] border border-[var(--brand-border-fade)] bg-white p-5"
          >
            <!-- Group header: title + section weight + column labels -->
            <div class="flex items-end gap-4 pb-3 border-b border-[var(--brand-border-fade)]">
              <div class="flex-1 min-w-0">
                <div class="text-[15px] font-bold text-[var(--brand-text)] truncate">{{ group.title }}</div>
                <label class="inline-flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-[var(--brand-text-secondary)]">
                  Weight
                  <span class="inline-flex items-center rounded-[8px] border-[1.5px] border-[var(--brand-border)] bg-white overflow-hidden focus-within:border-[var(--brand-teal)] transition">
                    <input
                      v-model.number="group.weight"
                      type="number"
                      min="0"
                      max="100"
                      class="w-[48px] h-7 px-2 text-[13px] text-right tabular-nums bg-transparent focus:outline-none"
                      :aria-label="`Weight for ${group.title}`"
                      @wheel="($event.target as HTMLInputElement).blur()"
                    >
                    <span class="px-1.5 text-[12px] text-[var(--brand-text-quiet)] border-l border-[var(--brand-border-fade)] self-stretch inline-flex items-center">%</span>
                  </span>
                </label>
              </div>
              <div class="w-[84px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Fully met</div>
              <div class="w-[84px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Partially<br>met</div>
              <div class="w-[92px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Disqualify<br>if missing</div>
              <div class="w-[76px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Show<br>in job post</div>
              <div class="w-7 shrink-0" />
            </div>

            <!-- Criteria rows -->
            <div
              v-for="c in group.criteria"
              :key="c.id"
              class="flex items-center gap-4 py-4 border-b border-[var(--brand-border-fade)] last:border-b-0"
            >
              <div class="flex-1 min-w-0">
                <textarea
                  v-model="c.text"
                  rows="1"
                  placeholder="Describe the criterion…"
                  class="w-full resize-none text-[13.5px] leading-relaxed text-[var(--brand-text-secondary)] bg-transparent focus:outline-none focus:text-[var(--brand-text)]"
                />
              </div>
              <div class="w-[84px] shrink-0 flex justify-center">
                <BrandLimeCheckbox v-model="c.fullyMet" :aria-label="`Fully met: ${c.text.slice(0, 24)}`" />
              </div>
              <div class="w-[84px] shrink-0 flex justify-center">
                <BrandLimeCheckbox v-model="c.partiallyMet" :aria-label="`Partially met: ${c.text.slice(0, 24)}`" />
              </div>
              <div class="w-[92px] shrink-0 flex justify-center">
                <BrandLimeCheckbox v-model="c.disqualify" :aria-label="`Disqualify if missing: ${c.text.slice(0, 24)}`" />
              </div>
              <div class="w-[76px] shrink-0 flex justify-center">
                <button
                  type="button"
                  class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center transition"
                  :class="c.showInPost
                    ? 'bg-[var(--brand-lime-tint)] text-[var(--brand-teal)]'
                    : 'bg-white border border-[var(--brand-border-fade)] text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)]'"
                  :aria-label="c.showInPost ? 'Shown in job post' : 'Hidden from job post'"
                  :aria-pressed="c.showInPost"
                  @click="toggleShow(c)"
                >
                  <component :is="c.showInPost ? Eye : EyeOff" class="w-[18px] h-[18px]" stroke-width="1.8" />
                </button>
              </div>
              <button
                type="button"
                class="w-7 h-7 shrink-0 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:text-[var(--brand-status-closed-text)] hover:bg-[var(--brand-canvas)] transition"
                aria-label="Remove criterion"
                @click="removeCriterion(group, c.id)"
              >
                <X class="w-3.5 h-3.5" stroke-width="2" />
              </button>
            </div>

            <div v-if="!group.criteria.length" class="py-4 text-[13px] text-[var(--brand-text-quiet)] italic">
              No criteria yet.
            </div>

            <!-- Group footer -->
            <div class="flex items-center gap-4 pt-3.5">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)] transition"
                @click="addCriterion(group)"
              >
                <Plus class="w-4 h-4" stroke-width="2.2" />
                Add criterion
              </button>
              <span class="w-px h-4 bg-[var(--brand-border-fade)]" />
              <button
                type="button"
                class="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-status-closed-text)] transition"
                @click="deleteAll(group)"
              >
                <Trash2 class="w-3.5 h-3.5" stroke-width="1.8" />
                Delete all criteria
              </button>
            </div>
          </section>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center gap-3 px-7 py-4 border-t border-[var(--brand-border-fade)] bg-white shrink-0">
        <button
          type="button"
          class="text-[13px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text-secondary)] transition mr-auto"
          @click="resetDefaults"
        >Reset to defaults</button>
        <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" @click="onSave">Save criteria</BrandButton>
      </div>
    </DialogContent>
  </Dialog>
</template>
