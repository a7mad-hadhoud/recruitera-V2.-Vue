<!--
  Right pane in Pipeline → Screening view.
  Triage-optimized profile:
    • header (avatar + name + headline + follow/count)
    • action row (email / schedule / comment / ⋯   +   Disqualify + Move split)
    • 5 tabs (Profile / Timeline / Communication / Review / Comments)
    • Profile body: Summary → Answers → Resume placeholder
      (real profile is one click away via "View full profile")

  Emits `move` and `disqualify` for the container to wire into
  useJobPipeline. Emits `open-full` for the "View full profile" link.
-->
<script setup lang="ts">
import { Mail, Calendar, MessageSquare, MoreHorizontal, Hand, ChevronDown, ArrowRight, Ban, MapPin, Phone, Plus, Copy, Sparkles } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import CandidateCollapsibleCard from '~/components/candidates/CandidateCollapsibleCard.vue'
import type { PipelineCandidate, PipelineStage, CandidateProfile } from '~/types'

const props = defineProps<{
  candidate: PipelineCandidate
  currentStage: PipelineStage
  moveTargets: PipelineStage[]
  /** Next-stage shortcut for the primary action (usually stages[i+1]). Falls back to first moveTarget. */
  nextStage?: PipelineStage | null
  headline?: string
  tags?: string[]
  source?: string
  summary?: string
  answers?: Array<{ q: string; a: string }>
  contact?: { location?: string; phone?: string; email?: string }
  /** Optional CV/resume structured content (mockup structure). If provided,
   *  we render experience + skills inline in the Resume section instead of
   *  the placeholder box. */
  cv?: {
    contactLine?: string
    experience?: Array<{ role: string; company: string; period: string; description?: string }>
    skills?: string[]
  } | null
  /** Full candidate profile — powers the Overview tab sections (Tags,
   *  Details, Contact, Profile fields, AI Summary). Read-mostly here;
   *  editing lives on the standalone /candidates/[id] page. */
  profile?: CandidateProfile | null
}>()

const emit = defineEmits<{
  'move':        [id: string, fromKey: string, toKey: string]
  'disqualify':  [id: string]
  'open-full':   [id: string]
}>()

// Tabs mirror the standalone /candidates/[id] profile page so the two
// surfaces read as one system (Overview / Emails / WhatsApp / Events /
// Evaluation / Files / Activity). Only Overview has real content in
// the triage pane — the deeper tabs redirect to the full profile.
const TABS = ['Overview', 'Emails', 'WhatsApp', 'Events', 'Evaluation', 'Files', 'Activity'] as const
type Tab = typeof TABS[number]
const activeTab = ref<Tab>('Overview')
const primaryTarget = computed(() => props.nextStage ?? props.moveTargets[0] ?? null)

// Fallback dummy content so every section has something to render even
// for candidates whose profile fetch returned sparse data. Never replaces
// real data — only fills gaps.
const DUMMY_SUMMARY = 'Motivated candidate with a strong track record in their field. Communicates clearly, ships consistently, and enjoys collaborating across teams. Currently looking for a role that combines execution with product ownership.'
const DUMMY_ANSWERS = [
  { q: 'Why are you interested in this role?', a: 'The scope of the position aligns with the direction I want to take my career, and I admire the product.' },
  { q: 'Notice period (weeks)?', a: '4' },
  { q: 'Salary expectation range?', a: 'Open to discussion around the posted band.' },
]
const DUMMY_EXPERIENCE = [
  { role: 'Senior Marketer', company: 'Northwind Labs', period: '2022 – Present', description: 'Led lifecycle and paid programs; grew qualified pipeline 2.4× in 18 months.' },
  { role: 'Marketing Manager', company: 'Beta Studio',    period: '2019 – 2022',   description: 'Built the content engine from zero; owned SEO end-to-end.' },
  { role: 'Marketing Analyst', company: 'Cirrus Group',   period: '2016 – 2019',   description: 'Attribution and reporting foundation for a Series B startup.' },
]
const DUMMY_SKILLS = ['Growth', 'Lifecycle', 'SEO', 'Analytics', 'Positioning', 'Copywriting', 'Attribution']

// Effective values — real when present, dummy otherwise.
const effectiveSummary   = computed(() => props.summary || DUMMY_SUMMARY)
const effectiveAnswers   = computed(() => props.answers && props.answers.length ? props.answers : DUMMY_ANSWERS)
const effectiveCvExperience = computed(() => props.cv?.experience?.length ? props.cv!.experience! : DUMMY_EXPERIENCE)
const effectiveCvSkills     = computed(() => props.cv?.skills?.length ? props.cv!.skills! : DUMMY_SKILLS)
const effectiveContactLine = computed(() => {
  if (props.cv?.contactLine) return props.cv.contactLine
  const joined = [props.headline, props.contact?.email, props.contact?.phone].filter(Boolean).join(' · ')
  return joined || 'senior.marketer@example.com · +1 (555) 019-2837'
})
const effectiveProfileFields = computed(() => ({
  university:        props.profile?.profileFields?.university        ?? 'Boston University',
  faculty:           props.profile?.profileFields?.faculty           ?? 'Finance',
  yearsOfExperience: props.profile?.profileFields?.yearsOfExperience ?? 6,
  industryRelevant:  props.profile?.profileFields?.industryRelevant  ?? true,
  languages:         props.profile?.profileFields?.languages         ?? 'English (native), Spanish (fluent)',
  gender:            props.profile?.profileFields?.gender            ?? 'Prefer not to say',
}))
</script>

<template>
  <div class="flex flex-col min-h-0 h-full bg-white relative">
    <!-- Whole pane is ONE scroll container so header/tags/AI-score
         scroll away and only the sticky action bar stays pinned. -->
    <div class="flex-1 min-h-0 overflow-y-auto relative">
      <!-- Warm gradient behind the header — sits inside the scroll
           container so it moves with the hero content on scroll. -->
      <div
        class="pointer-events-none absolute top-0 left-0 right-0 h-[220px]"
        aria-hidden="true"
        :style="{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--brand-lime-tint) 60%, white) 0%, color-mix(in srgb, var(--brand-pipeline-purple) 6%, white) 55%, transparent 100%)' }"
      />

      <!-- Sticky action row. ALL actions live inside ONE white pill
           (r=14) with vertical dividers between semantic groups and the
           Move-to CTA as a solid teal tail-cap. Reference sc2: single
           connected pill, teal Move button rides the right end. -->
      <div class="sticky top-0 z-20 flex justify-center px-6 pt-4 pb-3">
        <div class="inline-flex items-stretch h-11 rounded-[14px] bg-white shadow-[0_1px_3px_rgba(0,20,18,0.10),0_8px_24px_rgba(0,20,18,0.10)] border border-[var(--brand-border-fade)] overflow-hidden">
          <!-- Overflow menu -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button
                class="inline-flex items-center justify-center w-11 h-full text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
                aria-label="More actions"
              >
                <MoreHorizontal class="w-4 h-4" stroke-width="1.8" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-[200px] p-1">
              <DropdownMenuItem class="flex items-center gap-2.5 px-2 py-1.5 text-[13.5px] cursor-pointer" @select="emit('open-full', props.candidate.id)">
                <ArrowRight class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" />
                View full profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span class="w-px my-2 bg-[var(--brand-border-fade)]" aria-hidden="true" />

          <!-- Communication -->
          <button
            class="inline-flex items-center justify-center w-11 h-full text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
            aria-label="Send email"
          ><Mail class="w-4 h-4" stroke-width="1.7" /></button>
          <button
            class="inline-flex items-center justify-center w-11 h-full text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
            aria-label="Schedule event"
          ><Calendar class="w-4 h-4" stroke-width="1.7" /></button>

          <span class="w-px my-2 bg-[var(--brand-border-fade)]" aria-hidden="true" />

          <!-- Collaboration -->
          <button
            class="inline-flex items-center justify-center w-11 h-full text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition"
            aria-label="Add comment"
          ><MessageSquare class="w-4 h-4" stroke-width="1.7" /></button>

          <span class="w-px my-2 bg-[var(--brand-border-fade)]" aria-hidden="true" />

          <!-- Disqualify — icon + text + reasons chevron. Red on hover
               so destructive intent reads at rest calmly. -->
          <button
            class="inline-flex items-center gap-1.5 px-3.5 h-full text-[13px] font-bold text-[var(--brand-status-closed-text)] hover:bg-[var(--brand-status-closed-bg)] transition"
            @click="emit('disqualify', props.candidate.id)"
          >
            <Hand class="w-3.5 h-3.5" stroke-width="1.9" />
            Disqualify
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button
                class="inline-flex items-center justify-center w-8 h-full text-[var(--brand-status-closed-text)] hover:bg-[var(--brand-status-closed-bg)] transition border-l border-[var(--brand-border-fade)]"
                aria-label="Disqualify with reason"
              >
                <ChevronDown class="w-3.5 h-3.5" stroke-width="2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-[220px] p-1">
              <div class="px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)]">
                Disqualify reason
              </div>
              <DropdownMenuItem
                v-for="reason in ['Knockout question', 'Not a fit', 'Withdrew', 'Ghosted', 'Other']"
                :key="reason"
                class="flex items-center gap-2.5 px-2 py-1.5 text-[13.5px] cursor-pointer"
                @select="emit('disqualify', props.candidate.id)"
              >
                {{ reason }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span class="w-px my-2 bg-[var(--brand-border-fade)]" aria-hidden="true" />

          <!-- Move-to primary — teal solid inside the same pill (tail
               cap). truncate + max-w keeps long stage names on one line. -->
          <button
            v-if="primaryTarget"
            class="inline-flex items-center gap-1.5 px-4 h-full text-[13px] font-bold text-white bg-[var(--brand-teal)] hover:bg-[color-mix(in_srgb,var(--brand-teal)_92%,white)] transition whitespace-nowrap max-w-[220px]"
            @click="emit('move', props.candidate.id, props.currentStage.key, primaryTarget.key)"
          >
            <span class="truncate">Move to {{ primaryTarget.label }}</span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button
                class="inline-flex items-center px-2.5 h-full text-white bg-[var(--brand-teal)] border-l border-white/15 hover:bg-[color-mix(in_srgb,var(--brand-teal)_88%,white)] transition"
                aria-label="Move to another stage"
              >
                <ChevronDown class="w-4 h-4" stroke-width="2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-[220px] p-1">
              <div class="px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)]">
                Move to
              </div>
              <DropdownMenuItem
                v-for="target in props.moveTargets"
                :key="target.key"
                class="flex items-center gap-2.5 px-2 py-1.5 text-[13.5px] cursor-pointer"
                @select="emit('move', props.candidate.id, props.currentStage.key, target.key)"
              >
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: target.dot }" />
                <span class="flex-1">{{ target.label }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

    <!-- Header -->
    <div class="relative flex items-start gap-4 px-6 pt-5">
      <span class="relative inline-flex w-16 h-16 shrink-0">
        <img
          v-if="props.candidate.avatarUrl"
          :src="props.candidate.avatarUrl"
          :alt="props.candidate.name"
          class="w-16 h-16 rounded-full object-cover bg-[var(--brand-canvas)]"
        >
        <span
          v-else
          class="absolute inset-0 rounded-full bg-[var(--brand-teal)] text-white inline-flex items-center justify-center font-bold text-[22px]"
        >
          {{ props.candidate.initials }}
        </span>
      </span>
      <div class="min-w-0 flex-1">
        <h2 class="text-[20px] font-bold text-[var(--brand-text)] leading-tight truncate">
          {{ props.candidate.name }}
        </h2>
        <div v-if="props.headline" class="text-[13.5px] text-[var(--brand-text-secondary)] mt-0.5 truncate">
          {{ props.headline }}
        </div>
        <div class="flex items-center gap-2 mt-3 flex-wrap">
          <span v-if="props.contact?.location"
                class="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-canvas)] px-2.5 h-6 text-[12px] text-[var(--brand-text-secondary)]">
            <MapPin class="w-3 h-3" stroke-width="2" />
            {{ props.contact.location }}
          </span>
          <span v-if="props.contact?.phone"
                class="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-canvas)] px-2.5 h-6 text-[12px] text-[var(--brand-text-secondary)]">
            <Phone class="w-3 h-3" stroke-width="2" />
            {{ props.contact.phone }}
          </span>
          <span v-if="props.source"
                class="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-canvas)] px-2.5 h-6 text-[12px] text-[var(--brand-text-secondary)]">
            via <strong class="font-semibold text-[var(--brand-text)]">{{ props.source }}</strong>
          </span>
        </div>
        <div v-if="props.tags?.length" class="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <span v-for="tag in props.tags" :key="tag"
                class="text-[11.5px] font-semibold text-[var(--brand-teal-secondary)] bg-[var(--brand-canvas)] rounded px-1.5 py-[3px]">
            #{{ tag }}
          </span>
          <button class="inline-flex items-center gap-1 text-[11.5px] text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] transition rounded px-1.5 py-[3px]">
            <Plus class="w-3 h-3" stroke-width="2" />
            add tag
          </button>
        </div>
      </div>

      <!-- AI SCORE badge — large lime tile pinned top-right of the header,
           mirrors the mockup. -->
      <div class="shrink-0 text-center rounded-[10px] bg-[var(--brand-lime)] px-3.5 py-1.5">
        <div class="text-[9.5px] font-bold tracking-[0.08em] text-[var(--brand-teal)]">AI SCORE</div>
        <div class="text-[22px] font-bold text-[var(--brand-teal)] leading-tight tabular-nums">{{ props.candidate.aiScore }}%</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 px-6 mt-5 border-b border-[var(--brand-border-fade)]">
      <button
        v-for="t in TABS"
        :key="t"
        role="tab"
        :aria-selected="activeTab === t"
        class="relative px-3 h-10 text-[13px] font-semibold transition"
        :class="activeTab === t ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-subtle)] hover:text-[var(--brand-text)]'"
        @click="activeTab = t"
      >
        {{ t }}
        <span v-if="activeTab === t" class="absolute left-3 right-3 -bottom-px h-[2px] bg-[var(--brand-teal)] rounded-full" />
      </button>
    </div>

    <!-- Tab bodies. Overview mirrors the standalone /candidates/[id]
         Overview tab: Tags, Details, Contact, Profile fields, AI Summary
         (read-mostly here; deep edits happen on the full page).
         No independent overflow — the OUTER pane container is the single
         scroll surface, so the header/tags/AI-score scroll off screen and
         only the sticky action row stays pinned. -->
    <div class="px-6 py-5 bg-[var(--brand-canvas)]">
      <template v-if="activeTab === 'Overview'">
        <!-- Order (per Wuzzuf-parity spec):
             Contact → AI Summary → Application form → CV → Profile fields
             (Tags row + Details removed per feedback; every section has
             dummy content when the profile fetch is sparse so the layout
             never reads as "empty"). -->

        <!-- Contact -->
        <CandidateCollapsibleCard title="Contact" class="mb-4">
          <template #actions>
            <button class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)] transition">
              <MessageSquare class="w-3.5 h-3.5" stroke-width="1.8" />
              Send message
            </button>
          </template>
          <div class="grid grid-cols-[80px_1fr_auto] gap-y-3 gap-x-3 items-center text-[13.5px]">
            <span class="text-[var(--brand-text-quiet)]">Email</span>
            <a
              :href="`mailto:${props.profile?.email ?? 'candidate@example.com'}`"
              class="text-[var(--brand-teal-secondary)] hover:underline truncate"
            >{{ props.profile?.email ?? 'candidate@example.com' }}</a>
            <button
              class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
              aria-label="Copy email"
              @click="navigator.clipboard.writeText(props.profile?.email ?? 'candidate@example.com')"
            ><Copy class="w-3.5 h-3.5" stroke-width="1.8" /></button>

            <span class="text-[var(--brand-text-quiet)]">Phone</span>
            <span class="text-[var(--brand-text)]">{{ props.profile?.phone ?? '+1 (555) 019-2837' }}</span>
            <button
              class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
              aria-label="Copy phone"
              @click="navigator.clipboard.writeText(props.profile?.phone ?? '+1 (555) 019-2837')"
            ><Copy class="w-3.5 h-3.5" stroke-width="1.8" /></button>

            <span class="text-[var(--brand-text-quiet)]">Location</span>
            <span class="text-[var(--brand-text)]">{{ props.profile?.location ?? props.candidate.location ?? 'Remote' }}</span>
            <span />
          </div>
        </CandidateCollapsibleCard>

        <!-- AI Summary -->
        <CandidateCollapsibleCard title="AI Summary" class="mb-4">
          <template #icon>
            <Sparkles class="w-4 h-4 text-[var(--brand-ai-accent)]" stroke-width="1.7" />
          </template>
          <p class="text-[13.5px] text-[var(--brand-text-secondary)] leading-relaxed">
            {{ effectiveSummary }}
          </p>
        </CandidateCollapsibleCard>

        <!-- Application form (previously "Screening answers"). Renamed
             to match /candidates/[id] terminology; content is the same
             job-specific Q/A list. -->
        <CandidateCollapsibleCard title="Application form" class="mb-4">
          <ul class="space-y-3">
            <li v-for="(qa, i) in effectiveAnswers" :key="i" class="border border-[var(--brand-border-fade)] rounded-[10px] px-4 py-3 bg-white">
              <div class="text-[12.5px] text-[var(--brand-text-secondary)]">{{ qa.q }}</div>
              <div class="text-[13.5px] font-semibold text-[var(--brand-text)] mt-1">{{ qa.a }}</div>
            </li>
          </ul>
        </CandidateCollapsibleCard>

        <!-- CV -->
        <CandidateCollapsibleCard title="CV" class="mb-4">
          <div class="rounded-[10px] border border-[var(--brand-border-fade)] bg-white p-5">
            <div class="text-[16px] font-bold text-[var(--brand-text)]">{{ props.candidate.name }}</div>
            <div class="text-[12.5px] text-[var(--brand-text-secondary)] mt-0.5">
              {{ effectiveContactLine }}
            </div>

            <div class="h-px bg-[var(--brand-border-fade)] my-4" />

            <div class="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-secondary)] mb-2">Experience</div>
            <div v-for="(exp, i) in effectiveCvExperience" :key="i" class="mb-3.5 last:mb-0">
              <div class="text-[13px] font-bold text-[var(--brand-text)]">{{ exp.role }} — {{ exp.company }}</div>
              <div class="text-[11.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ exp.period }}</div>
              <div v-if="exp.description" class="text-[12.5px] text-[var(--brand-text-secondary)] leading-relaxed mt-1">
                {{ exp.description }}
              </div>
            </div>

            <div class="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-secondary)] mt-4 mb-2">Skills</div>
            <div class="text-[12.5px] text-[var(--brand-text-secondary)]">
              {{ effectiveCvSkills.join(' · ') }}
            </div>
          </div>
        </CandidateCollapsibleCard>

        <!-- Profile fields -->
        <CandidateCollapsibleCard title="Profile fields" class="mb-4">
          <div class="grid grid-cols-[130px_1fr] gap-y-2.5 text-[13.5px]">
            <span class="text-[var(--brand-text-secondary)]">University</span>
            <span class="text-[var(--brand-text)]">{{ effectiveProfileFields.university }}</span>
            <span class="text-[var(--brand-text-secondary)]">Faculty</span>
            <span class="text-[var(--brand-text)]">{{ effectiveProfileFields.faculty }}</span>
            <span class="text-[var(--brand-text-secondary)]">Years of experience</span>
            <span class="text-[var(--brand-text)]">{{ effectiveProfileFields.yearsOfExperience }}</span>
            <span class="text-[var(--brand-text-secondary)]">Industry-relevant</span>
            <span class="text-[var(--brand-text)]">{{ effectiveProfileFields.industryRelevant ? 'Yes' : 'No' }}</span>
            <span class="text-[var(--brand-text-secondary)]">Languages</span>
            <span class="text-[var(--brand-text)]">{{ effectiveProfileFields.languages }}</span>
            <span class="text-[var(--brand-text-secondary)]">Gender</span>
            <span class="text-[var(--brand-text)]">{{ effectiveProfileFields.gender }}</span>
          </div>
        </CandidateCollapsibleCard>

        <button
          class="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] border border-[var(--brand-border)] bg-white text-[13px] font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] transition"
          @click="emit('open-full', props.candidate.id)"
        >
          Open full profile
          <ArrowRight class="w-3.5 h-3.5" stroke-width="2" />
        </button>
      </template>
      <template v-else>
        <div class="text-center py-16 text-[13px] text-[var(--brand-text-quiet)]">
          <Ban class="w-5 h-5 mx-auto mb-2 opacity-40" stroke-width="1.5" />
          {{ activeTab }} — coming soon
        </div>
      </template>
    </div>
    </div><!-- /outer scroll container -->
  </div>
</template>
