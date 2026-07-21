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
</script>

<template>
  <div class="flex flex-col min-h-0 h-full bg-white relative">
    <!-- Warm gradient behind the action row + header — matches Wuzzuf/
         Recruitee reference. Kept low-opacity so brand palette stays lead. -->
    <div
      class="pointer-events-none absolute top-0 left-0 right-0 h-[220px]"
      aria-hidden="true"
      :style="{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--brand-lime-tint) 60%, white) 0%, color-mix(in srgb, var(--brand-pipeline-purple) 6%, white) 55%, transparent 100%)' }"
    />

    <!-- Action row (top) -->
    <div class="relative flex items-center gap-2 px-6 pt-5">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="w-9 h-9 rounded-[10px] bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] inline-flex items-center justify-center hover:bg-[var(--brand-lime-tint)] hover:text-[var(--brand-text)] transition"
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
      <button
        class="w-9 h-9 rounded-[10px] bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] inline-flex items-center justify-center hover:bg-[var(--brand-lime-tint)] hover:text-[var(--brand-text)] transition"
        aria-label="Send email"
      ><Mail class="w-4 h-4" stroke-width="1.7" /></button>
      <button
        class="w-9 h-9 rounded-[10px] bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] inline-flex items-center justify-center hover:bg-[var(--brand-lime-tint)] hover:text-[var(--brand-text)] transition"
        aria-label="Schedule event"
      ><Calendar class="w-4 h-4" stroke-width="1.7" /></button>
      <button
        class="w-9 h-9 rounded-[10px] bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] inline-flex items-center justify-center hover:bg-[var(--brand-lime-tint)] hover:text-[var(--brand-text)] transition"
        aria-label="Add comment"
      ><MessageSquare class="w-4 h-4" stroke-width="1.7" /></button>

      <span class="flex-1" />

      <!-- Disqualify split-button (icon + chevron for reasons) -->
      <div class="inline-flex items-stretch rounded-[10px] overflow-hidden border border-[var(--brand-border)] bg-white">
        <button
          class="inline-flex items-center gap-1.5 px-3 h-9 text-[13px] font-semibold text-[var(--brand-status-closed-text)] hover:bg-[var(--brand-status-closed-bg)] transition"
          @click="emit('disqualify', props.candidate.id)"
        >
          <Hand class="w-3.5 h-3.5" stroke-width="1.8" />
          Disqualify
        </button>
      </div>

      <!-- Move-to-<next> split-button. `truncate` + `max-w-[220px]` keeps
           long stage names ("Phone interview") on a single line even when
           the right pane is narrow. -->
      <div class="inline-flex items-stretch rounded-[10px] overflow-hidden bg-[var(--brand-teal)] min-w-0">
        <button
          v-if="primaryTarget"
          class="inline-flex items-center gap-1.5 px-4 h-9 text-[13px] font-bold text-white hover:bg-[color-mix(in_srgb,var(--brand-teal)_92%,white)] transition whitespace-nowrap max-w-[220px]"
          @click="emit('move', props.candidate.id, props.currentStage.key, primaryTarget.key)"
        >
          <span class="truncate">Move to {{ primaryTarget.label }}</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="inline-flex items-center px-2 h-9 text-white border-l border-white/15 hover:bg-[color-mix(in_srgb,var(--brand-teal)_88%,white)] transition"
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
         (read-mostly here; deep edits happen on the full page). -->
    <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 bg-[var(--brand-canvas)]">
      <template v-if="activeTab === 'Overview'">
        <!-- Tags row -->
        <div class="flex items-center flex-wrap gap-2 mb-4">
          <span class="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[var(--brand-text)]">
            <span class="w-4 h-4 inline-flex items-center justify-center text-[var(--brand-text-quiet)]">🏷</span>
            Tags
          </span>
          <span
            v-for="tag in props.tags"
            :key="tag"
            class="inline-flex items-center gap-1.5 rounded-full bg-white border border-[var(--brand-border)] px-2.5 h-7 text-[12.5px] font-semibold text-[var(--brand-text)]"
          >
            {{ tag }}
            <button class="text-[var(--brand-text-faint)] hover:text-[var(--brand-text-secondary)]" aria-label="Remove tag">
              <Ban class="w-3 h-3 rotate-45" stroke-width="2" />
            </button>
          </span>
          <button
            class="inline-flex items-center justify-center rounded-full w-7 h-7 bg-white border border-dashed border-[var(--brand-border)] text-[var(--brand-text-quiet)] hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)] transition"
            aria-label="Add tag"
          >
            <Plus class="w-3.5 h-3.5" stroke-width="2" />
          </button>
        </div>

        <!-- Details -->
        <CandidateCollapsibleCard title="Details" class="mb-4">
          <div class="grid grid-cols-[110px_1fr] gap-y-3 text-[13.5px]">
            <span class="text-[var(--brand-text-quiet)]">Date created</span>
            <span class="text-[var(--brand-text)]">{{ props.profile?.dateCreated ?? '—' }}</span>
            <span class="text-[var(--brand-text-quiet)]">Source</span>
            <span>
              <span
                v-if="props.profile?.source"
                class="inline-flex items-center h-6 rounded-md bg-[var(--brand-lime-tint)] text-[var(--brand-teal-secondary)] px-2 text-[12.5px] font-semibold"
              >{{ props.profile.source }}</span>
              <span v-else class="text-[var(--brand-text-quiet)]">—</span>
            </span>
            <span class="text-[var(--brand-text-quiet)]">Last activity</span>
            <span class="text-[var(--brand-text)]">
              <template v-if="props.profile?.lastActivityDetail">
                <strong class="font-semibold">{{ props.profile.lastActivityDetail.actor }}</strong>
                {{ ' ' + props.profile.lastActivityDetail.action }}
              </template>
              <template v-else>—</template>
            </span>
          </div>
        </CandidateCollapsibleCard>

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
              v-if="props.profile?.email"
              :href="`mailto:${props.profile.email}`"
              class="text-[var(--brand-teal-secondary)] hover:underline truncate"
            >{{ props.profile.email }}</a>
            <span v-else class="text-[var(--brand-text-quiet)]">—</span>
            <button
              v-if="props.profile?.email"
              class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
              aria-label="Copy email"
              @click="props.profile?.email && navigator.clipboard.writeText(props.profile.email)"
            ><Copy class="w-3.5 h-3.5" stroke-width="1.8" /></button>
            <span v-else />

            <span class="text-[var(--brand-text-quiet)]">Phone</span>
            <span class="text-[var(--brand-text)]">{{ props.profile?.phone ?? '—' }}</span>
            <button
              v-if="props.profile?.phone"
              class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition"
              aria-label="Copy phone"
              @click="props.profile?.phone && navigator.clipboard.writeText(props.profile.phone)"
            ><Copy class="w-3.5 h-3.5" stroke-width="1.8" /></button>
            <span v-else />

            <span class="text-[var(--brand-text-quiet)]">Location</span>
            <span class="text-[var(--brand-text)]">{{ props.profile?.location ?? props.candidate.location ?? '—' }}</span>
            <span />
          </div>
        </CandidateCollapsibleCard>

        <!-- Profile fields -->
        <CandidateCollapsibleCard title="Profile fields" class="mb-4">
          <div class="grid grid-cols-[130px_1fr] gap-y-2.5 text-[13.5px]">
            <span class="text-[var(--brand-text-secondary)]">University</span>
            <span :class="props.profile?.profileFields?.university ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-quiet)] italic'">{{ props.profile?.profileFields?.university || 'empty' }}</span>
            <span class="text-[var(--brand-text-secondary)]">Faculty</span>
            <span :class="props.profile?.profileFields?.faculty ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-quiet)] italic'">{{ props.profile?.profileFields?.faculty || 'empty' }}</span>
            <span class="text-[var(--brand-text-secondary)]">Years of experience</span>
            <span :class="props.profile?.profileFields?.yearsOfExperience ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-quiet)] italic'">{{ props.profile?.profileFields?.yearsOfExperience ?? 'empty' }}</span>
            <span class="text-[var(--brand-text-secondary)]">Industry-relevant</span>
            <span :class="props.profile?.profileFields?.industryRelevant !== null && props.profile?.profileFields?.industryRelevant !== undefined ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-quiet)] italic'">
              {{ props.profile?.profileFields?.industryRelevant === true ? 'Yes' : props.profile?.profileFields?.industryRelevant === false ? 'No' : 'empty' }}
            </span>
            <span class="text-[var(--brand-text-secondary)]">Languages</span>
            <span :class="props.profile?.profileFields?.languages ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-quiet)] italic'">{{ props.profile?.profileFields?.languages || 'empty' }}</span>
            <span class="text-[var(--brand-text-secondary)]">Gender</span>
            <span :class="props.profile?.profileFields?.gender ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-quiet)] italic'">{{ props.profile?.profileFields?.gender || 'empty' }}</span>
          </div>
        </CandidateCollapsibleCard>

        <!-- AI Summary -->
        <CandidateCollapsibleCard title="AI Summary" class="mb-4">
          <template #icon>
            <Sparkles class="w-4 h-4 text-[var(--brand-ai-accent)]" stroke-width="1.7" />
          </template>
          <p v-if="props.summary" class="text-[13.5px] text-[var(--brand-text-secondary)] leading-relaxed">
            {{ props.summary }}
          </p>
          <p v-else class="text-[13px] text-[var(--brand-text-quiet)] italic">
            No AI summary generated yet.
          </p>
        </CandidateCollapsibleCard>

        <!-- Screening answers — kept from the earlier triage layout since
             they're specific to this job's application flow. -->
        <CandidateCollapsibleCard v-if="props.answers?.length" title="Screening answers" class="mb-4">
          <ul class="space-y-3">
            <li v-for="(qa, i) in props.answers" :key="i" class="border border-[var(--brand-border-fade)] rounded-[10px] px-4 py-3 bg-white">
              <div class="text-[12.5px] text-[var(--brand-text-secondary)]">{{ qa.q }}</div>
              <div class="text-[13.5px] font-semibold text-[var(--brand-text)] mt-1">{{ qa.a }}</div>
            </li>
          </ul>
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
  </div>
</template>
