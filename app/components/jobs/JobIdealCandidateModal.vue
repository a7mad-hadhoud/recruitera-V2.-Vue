<!--
  "Ideal candidate profile" modal — opened from the Workflow tab's
  "Screening and matching candidates" (AI) card. Lets the recruiter
  fine-tune the AI screening criteria: per criterion mark Must have /
  Disqualify if missing and toggle Show in job post; add/remove criteria
  per group.

  Reuses the shadcn Dialog primitive + BrandLimeCheckbox; --brand-*
  tokens only, no new deps. Criteria are seeded from a fixture today —
  swap for the job's saved criteria when the API lands.
-->
<script setup lang="ts">
import { FileText, X, Plus, Trash2, Eye, EyeOff } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { BrandButton, BrandLimeCheckbox } from '~/components/brand'

interface Criterion {
  id: string
  text: string
  mustHave: boolean
  disqualify: boolean
  showInPost: boolean
}
interface CriteriaGroup {
  id: string
  title: string
  criteria: Criterion[]
}

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ save: [groups: CriteriaGroup[]] }>()

function cid(p: string) { return `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }

// Seed — mirrors the reference. Replace with the job's saved criteria.
const groups = ref<CriteriaGroup[]>([
  {
    id: 'grp-work',
    title: 'Work Experience',
    criteria: [
      { id: cid('c'), text: '2 - 4 years in FP&A/financial analysis; preference for SaaS or subscription business models.', mustHave: true, disqualify: false, showInPost: true },
      { id: cid('c'), text: 'Monthly close & forecast, variance analysis, KPI dashboards, stakeholder communication.', mustHave: true, disqualify: false, showInPost: true },
      { id: cid('c'), text: 'Owns models end-to-end; built dashboards used in exec meetings; shipped at least one forecasting improvement that reduced variance or cycle time.', mustHave: true, disqualify: true, showInPost: true },
      { id: cid('c'), text: 'Excel modeling (advanced), SQL (intermediate+), Power BI or Looker, financial statements fluency (P&L, CF, BS).', mustHave: true, disqualify: false, showInPost: false },
    ],
  },
  {
    id: 'grp-edu',
    title: 'Educational Qualifications',
    criteria: [
      { id: cid('c'), text: "Bachelor's degree in Computer Science, Electrical Engineering, Mathematics or a closely related field", mustHave: true, disqualify: false, showInPost: true },
    ],
  },
])

function addCriterion(group: CriteriaGroup) {
  group.criteria.push({ id: cid('c'), text: '', mustHave: false, disqualify: false, showInPost: true })
}
function deleteAll(group: CriteriaGroup) {
  group.criteria = []
}
function toggleShow(c: Criterion) { c.showInPost = !c.showInPost }

function onSave() {
  emit('save', groups.value)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-0 rounded-[18px] max-w-[900px] w-[94vw] max-h-[88vh] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-white overflow-hidden flex flex-col"
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
        <p class="text-[13.5px] text-[var(--brand-text-quiet)] leading-relaxed mb-6">
          Fine-tune your ideal candidate profile. Mark must-haves, add disqualifiers, and choose what to show in the job post.
          The Agent will use this to refine your shortlist and surface the best-fit candidates.
          <a href="#" class="font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]">Learn how it works.</a>
        </p>

        <div class="flex flex-col gap-4">
          <section
            v-for="group in groups"
            :key="group.id"
            class="rounded-[14px] border border-[var(--brand-border-fade)] bg-white p-5"
          >
            <!-- Group header: title + column labels -->
            <div class="flex items-center gap-4 pb-3 border-b border-[var(--brand-border-fade)]">
              <div class="flex-1 min-w-0 text-[15px] font-bold text-[var(--brand-text)]">{{ group.title }}</div>
              <div class="w-[84px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Must have</div>
              <div class="w-[84px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Disqualify<br>if missing</div>
              <div class="w-[84px] shrink-0 text-center text-[12px] font-semibold text-[var(--brand-text-secondary)] leading-tight">Show<br>in job post</div>
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
                <BrandLimeCheckbox v-model="c.mustHave" :aria-label="`Must have: ${c.text.slice(0, 24)}`" />
              </div>
              <div class="w-[84px] shrink-0 flex justify-center">
                <BrandLimeCheckbox v-model="c.disqualify" :aria-label="`Disqualify if missing: ${c.text.slice(0, 24)}`" />
              </div>
              <div class="w-[84px] shrink-0 flex justify-center">
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
      <div class="flex items-center justify-end gap-2 px-7 py-4 border-t border-[var(--brand-border-fade)] bg-white shrink-0">
        <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" @click="onSave">Save criteria</BrandButton>
      </div>
    </DialogContent>
  </Dialog>
</template>
