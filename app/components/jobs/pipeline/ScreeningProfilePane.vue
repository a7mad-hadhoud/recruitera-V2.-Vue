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
import { Mail, Calendar, MessageSquare, MoreHorizontal, Hand, ChevronDown, ArrowRight, Ban, MapPin, Phone, Plus } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import type { PipelineCandidate, PipelineStage } from '~/types'

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
}>()

const emit = defineEmits<{
  'move':        [id: string, fromKey: string, toKey: string]
  'disqualify':  [id: string]
  'open-full':   [id: string]
}>()

const TABS = ['Profile', 'Timeline', 'Communication', 'Review', 'Comments'] as const
type Tab = typeof TABS[number]
const activeTab = ref<Tab>('Profile')
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

    <!-- Tab bodies (only Profile has real content in v1) -->
    <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5">
      <template v-if="activeTab === 'Profile'">
        <section v-if="props.summary" class="mb-6">
          <h3 class="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)] mb-2">Summary</h3>
          <p class="text-[13.5px] text-[var(--brand-text-secondary)] leading-relaxed">{{ props.summary }}</p>
        </section>

        <section v-if="props.answers?.length" class="mb-6">
          <h3 class="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)] mb-2">Screening answers</h3>
          <ul class="space-y-3">
            <li v-for="(qa, i) in props.answers" :key="i"
                class="border border-[var(--brand-border-fade)] rounded-[10px] px-4 py-3">
              <div class="text-[12.5px] text-[var(--brand-text-secondary)]">{{ qa.q }}</div>
              <div class="text-[13.5px] font-semibold text-[var(--brand-text)] mt-1">{{ qa.a }}</div>
            </li>
          </ul>
        </section>

        <section class="mb-6">
          <h3 class="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)] mb-2">Resume</h3>
          <div class="border border-[var(--brand-border-fade)] rounded-[10px] p-5 bg-white">
            <div class="text-[15px] font-bold text-[var(--brand-text)]">{{ props.candidate.name }}</div>
            <div v-if="props.cv?.contactLine || props.contact?.email"
                 class="text-[12px] text-[var(--brand-text-secondary)] mt-0.5">
              {{ props.cv?.contactLine ?? [props.headline, props.contact?.email, props.contact?.phone].filter(Boolean).join(' · ') }}
            </div>

            <div class="h-px bg-[var(--brand-border-fade)] my-4" />

            <div class="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-secondary)] mb-2">Experience</div>
            <template v-if="props.cv?.experience?.length">
              <div v-for="(exp, i) in props.cv.experience" :key="i" class="mb-3.5 last:mb-0">
                <div class="text-[13px] font-bold text-[var(--brand-text)]">{{ exp.role }} — {{ exp.company }}</div>
                <div class="text-[11.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ exp.period }}</div>
                <div v-if="exp.description" class="text-[12.5px] text-[var(--brand-text-secondary)] leading-relaxed mt-1">
                  {{ exp.description }}
                </div>
              </div>
            </template>
            <div v-else class="text-[12.5px] text-[var(--brand-text-quiet)]">
              No experience on file yet.
              <button
                class="ml-1 text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)] font-semibold transition"
                @click="emit('open-full', props.candidate.id)"
              >View full profile →</button>
            </div>

            <template v-if="props.cv?.skills?.length">
              <div class="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-secondary)] mt-4 mb-2">Skills</div>
              <div class="text-[12.5px] text-[var(--brand-text-secondary)]">
                {{ props.cv.skills.join(' · ') }}
              </div>
            </template>
          </div>
        </section>
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
