<!--
  Ideal candidate profile (ICP) modal — opened from the Workflow tab's
  "Screening and matching candidates" (AI) card. One surface to define
  the screening criteria across the 6 ICP sections.

  Per criterion the recruiter sets:
    · Must have    — checkbox
    · Requirement  — Fully met / Partially met / Not met / Auto-disqualify
    · Show in job post — eye toggle

  Reuses shadcn Dialog + BrandLimeCheckbox + BrandButton; --brand-*
  tokens only, no new deps. Seeded with the recommended criteria; swap
  for the job's saved ICP when the API lands. On a live job, changes
  apply to NEW applicants only — existing scores are preserved.
-->
<script setup lang="ts">
import { FileText, X, Plus, Trash2, Eye, EyeOff, ChevronDown } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { BrandButton, BrandLimeCheckbox } from '~/components/brand'

type MatchLevel = 'fully' | 'partially' | 'not' | 'disqualify'
interface Criterion { id: string; text: string; mustHave: boolean; match: MatchLevel; showInPost: boolean }
interface CriteriaGroup { id: string; title: string; criteria: Criterion[] }

const MATCH_OPTIONS: { value: MatchLevel; label: string }[] = [
  { value: 'fully',      label: 'Fully met' },
  { value: 'partially',  label: 'Partially met' },
  { value: 'not',        label: 'Not met' },
  { value: 'disqualify', label: 'Auto-disqualify' },
]

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ save: [groups: CriteriaGroup[]] }>()

function cid(p: string) { return `${p}-${Math.random().toString(36).slice(2, 7)}` }
function crit(text: string, mustHave: boolean): Criterion {
  return { id: cid('c'), text, mustHave, match: 'fully', showInPost: true }
}

// Recommended defaults across the 6 ICP sections (spec).
function defaultGroups(): CriteriaGroup[] {
  return [
    { id: cid('g'), title: 'Work Experience', criteria: [
      crit("Minimum years of relevant experience in the role's field", true),
      crit('Experience in the same or closely related industry', true),
      crit('Prior experience in a similar role or job title', true),
    ] },
    { id: cid('g'), title: 'Education', criteria: [
      crit('Minimum educational qualification (degree, diploma, or equivalent)', true),
      crit('Relevant field of study or major', false),
      crit('Professional certifications or licenses required for the role', true),
    ] },
    { id: cid('g'), title: 'Skills', criteria: [
      crit('Core technical skills required to perform the job', true),
      crit('Proficiency in required tools, software, or platforms', true),
      crit('Language proficiency (if required for the role)', true),
    ] },
    { id: cid('g'), title: 'Keywords', criteria: [
      crit('Key role-specific terms present in CV or application', true),
      crit('Industry-specific terminology that signals domain knowledge', false),
      crit('Job title keywords aligned with seniority level', true),
    ] },
    { id: cid('g'), title: 'Achievements', criteria: [
      crit('Quantifiable results or impact demonstrated in past roles', false),
      crit('Evidence of exceeding targets or above-average performance', false),
      crit('Awards, recognitions, or notable projects relevant to the role', false),
    ] },
    { id: cid('g'), title: 'Relevance to Job Description', criteria: [
      crit("Overall alignment between candidate background and this job's requirements", true),
      crit("Alignment with the role's seniority level and scope", true),
      crit('Location or work model compatibility', false),
    ] },
  ]
}

const groups = ref<CriteriaGroup[]>(defaultGroups())

function addCriterion(group: CriteriaGroup) {
  group.criteria.push(crit('', false))
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
      class="p-0 border-0 rounded-[18px] max-w-[920px] w-[95vw] max-h-[90vh] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-white overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 px-7 h-[68px] border-b border-[var(--brand-border-fade)] shrink-0">
        <FileText class="w-[18px] h-[18px] text-[var(--brand-text-secondary)]" stroke-width="1.7" />
        <DialogTitle class="flex-1 text-[18px] font-bold text-[var(--brand-text)]">Ideal candidate profile</DialogTitle>
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
          Fine-tune your ideal candidate profile. Mark must-haves, set how each criterion must be met, and choose what to show in the job post.
          The Agent uses this to refine your shortlist and surface the best-fit candidates.
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
            <!-- Group header: title + column labels -->
            <div class="flex items-center gap-4 pb-3 border-b border-[var(--brand-border-fade)]">
              <div class="flex-1 min-w-0 text-[15px] font-bold text-[var(--brand-text)] truncate">{{ group.title }}</div>
              <div class="w-[76px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Must have</div>
              <div class="w-[168px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Requirement</div>
              <div class="w-[76px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Show<br>in job post</div>
              <div class="w-7 shrink-0" />
            </div>

            <!-- Criteria rows -->
            <div
              v-for="c in group.criteria"
              :key="c.id"
              class="flex items-center gap-4 py-3.5 border-b border-[var(--brand-border-fade)] last:border-b-0"
            >
              <div class="flex-1 min-w-0">
                <textarea
                  v-model="c.text"
                  rows="1"
                  placeholder="Describe the criterion…"
                  class="w-full resize-none text-[13.5px] leading-relaxed text-[var(--brand-text-secondary)] bg-transparent focus:outline-none focus:text-[var(--brand-text)]"
                />
              </div>

              <!-- Must have -->
              <div class="w-[76px] shrink-0 flex justify-center">
                <BrandLimeCheckbox v-model="c.mustHave" :aria-label="`Must have: ${c.text.slice(0, 24)}`" />
              </div>

              <!-- Requirement dropdown (Fully / Partially / Not met / Auto-disqualify) -->
              <div class="w-[168px] shrink-0 relative">
                <select
                  v-model="c.match"
                  class="w-full h-9 pl-3 pr-8 text-[13px] rounded-[8px] border border-[var(--brand-border-fade)] bg-white appearance-none focus:border-[var(--brand-teal)] focus:outline-none transition"
                  :class="c.match === 'disqualify' ? 'text-[var(--brand-status-closed-text)] font-semibold' : 'text-[var(--brand-text)]'"
                  :aria-label="`Requirement for ${c.text.slice(0, 24)}`"
                >
                  <option v-for="o in MATCH_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
                <ChevronDown class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
              </div>

              <!-- Show in job post -->
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

              <!-- Remove -->
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
