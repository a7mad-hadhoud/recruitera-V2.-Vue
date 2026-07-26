<!--
  Evaluations tab of the Home dashboard. Data via MSW (useDashboardEvaluations)
  filtered by Requested/Completed/Dismissed. Completed shows a filled result
  card; the others reuse BrandEmptyState. Colors are --brand-* tokens only.
-->
<script setup lang="ts">
import { Play, X, Filter, ThumbsUp, ThumbsDown, Pencil, Trash2, ChevronDown } from 'lucide-vue-next'
import { BrandAvatarInitials, BrandEmptyState } from '~/components/brand'
import { useDashboardEvaluations } from '~/composables/useDashboard'
import type { DashboardEvaluation } from '~/types'

const { data } = useDashboardEvaluations()
const all = computed<DashboardEvaluation[]>(() => data.value?.data ?? [])
const counts = computed(() => ({
  requested: all.value.filter(e => e.status === 'requested').length,
  completed: all.value.filter(e => e.status === 'completed').length,
  dismissed: all.value.filter(e => e.status === 'dismissed').length,
}))
const TABS = computed(() => [
  { key: 'requested', label: 'Requested', count: counts.value.requested },
  { key: 'completed', label: 'Completed', count: counts.value.completed },
  { key: 'dismissed', label: 'Dismissed', count: counts.value.dismissed },
])
const active = ref<'requested' | 'completed' | 'dismissed'>('completed')
const visible = computed(() => all.value.filter(e => e.status === active.value))
const showPromo = ref(true)

const expanded = ref<Record<string, boolean>>({})
function answersFor(e: DashboardEvaluation) {
  return expanded.value[e.id] ? e.answers : e.answers.slice(0, 2)
}

const AVATAR_TEXT = 'var(--brand-avatar-text)'
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-6 py-6">
    <h2 class="text-[22px] font-bold text-[var(--brand-text)] mb-4">Evaluations</h2>

    <!-- Did you know? -->
    <div v-if="showPromo" class="flex items-center gap-4 rounded-[12px] border border-[var(--brand-border-fade)] bg-[color-mix(in_srgb,var(--brand-pipeline-blue)_7%,var(--brand-surface-white))] px-4 py-3.5 mb-5">
      <span class="w-12 h-12 rounded-[10px] inline-flex items-center justify-center shrink-0" style="background:linear-gradient(135deg,var(--brand-pipeline-purple),var(--brand-teal-secondary))">
        <Play class="w-5 h-5 text-[var(--brand-avatar-text)]" fill="currentColor" stroke-width="1" />
      </span>
      <div class="flex-1 min-w-0">
        <div class="text-[14px] font-bold text-[var(--brand-text)]">Did you know?</div>
        <div class="text-[13px] text-[var(--brand-text-muted)]">With evaluation forms it's easier to compare applicants and quickly find the best standout candidate.</div>
      </div>
      <button type="button" class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-surface-white)] transition" aria-label="Dismiss" @click="showPromo = false"><X class="w-4 h-4" stroke-width="2" /></button>
    </div>

    <!-- Filters row -->
    <div class="flex items-center justify-between gap-3 mb-6">
      <div class="inline-flex items-center gap-1 p-1 rounded-[10px] bg-[var(--brand-canvas)]">
        <button v-for="t in TABS" :key="t.key" type="button" class="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-semibold transition" :class="active === t.key ? 'bg-[var(--brand-surface-white)] text-[var(--brand-text)] shadow-sm' : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'" @click="active = t.key as typeof active">
          {{ t.label }} <span class="text-[var(--brand-text-faint)]">{{ t.count }}</span>
        </button>
      </div>
      <button type="button" class="inline-flex items-center gap-2 h-9 px-3 text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]">
        <Filter class="w-4 h-4" stroke-width="1.8" /> My evaluations <ChevronDown class="w-3.5 h-3.5" stroke-width="2" />
      </button>
    </div>

    <!-- Result cards -->
    <div v-if="visible.length" class="flex flex-col gap-4">
      <div v-for="e in visible" :key="e.id" class="rounded-[14px] border border-[var(--brand-border-light)] overflow-hidden">
        <div class="flex items-center gap-2.5 px-5 py-3.5 bg-[var(--brand-canvas)] border-b border-[var(--brand-border-fade)]">
          <BrandAvatarInitials :initials="e.candidate.initial" :bg="e.candidate.bg" :color="AVATAR_TEXT" size="md" />
          <span class="text-[14px] font-bold text-[var(--brand-text)]">{{ e.candidate.name }}</span>
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--brand-success)]" />
          <span class="text-[13.5px] text-[var(--brand-text-secondary)]">{{ e.job }}</span>
        </div>

        <div class="flex items-center gap-4 px-5 py-4 border-b border-[var(--brand-border-fade)]">
          <div class="flex items-center gap-2.5 w-[160px] shrink-0">
            <span class="w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0" style="background:color-mix(in_srgb,var(--brand-warning) 18%,var(--brand-surface-white))">
              <ThumbsDown class="w-4 h-4 text-[var(--brand-warning)]" stroke-width="1.9" />
            </span>
            <div class="min-w-0">
              <div class="text-[14px] font-bold text-[var(--brand-text)]">{{ e.verdict }}</div>
              <div class="text-[12.5px] italic text-[var(--brand-text-quiet)]">{{ e.stage }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2.5 flex-1 min-w-0 border-l border-[var(--brand-border-fade)] pl-4">
            <BrandAvatarInitials :initials="e.evaluator.initials" :bg="e.evaluator.bg" :color="AVATAR_TEXT" size="md" />
            <div class="min-w-0">
              <div class="text-[14px] font-bold text-[var(--brand-text)]">{{ e.evaluator.name }}</div>
              <div class="text-[12.5px] text-[var(--brand-text-quiet)] truncate">{{ e.template }} · {{ e.when }}</div>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button type="button" class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition" aria-label="Edit"><Pencil class="w-4 h-4" stroke-width="1.8" /></button>
            <button type="button" class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-danger)] transition" aria-label="Delete"><Trash2 class="w-4 h-4" stroke-width="1.8" /></button>
          </div>
        </div>

        <div class="px-5 py-4 flex flex-col gap-5">
          <div>
            <div class="text-[13.5px] font-bold text-[var(--brand-text)] mb-1">Summary</div>
            <div class="text-[14px] text-[var(--brand-text-secondary)]">{{ e.summary }}</div>
          </div>
          <div v-for="(qa, i) in answersFor(e)" :key="i">
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">{{ qa.q }}</div>
            <div class="text-[14px] text-[var(--brand-text-secondary)]">{{ qa.a }}</div>
          </div>
        </div>

        <button v-if="e.answers.length > 2" type="button" class="w-full h-12 border-t border-[var(--brand-border-fade)] text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition" @click="expanded[e.id] = !expanded[e.id]">
          {{ expanded[e.id] ? 'Show less' : 'Show more' }}
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <BrandEmptyState v-else :icon="ThumbsUp" :title="`No ${active} evaluations`" :description="active === 'requested' ? 'Evaluations that you are requested to do will appear here.' : 'Evaluations that were dismissed will appear here.'">
      <a v-if="active === 'requested'" href="#" class="text-[14px] font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]">How to request evaluations?</a>
    </BrandEmptyState>
  </div>
</template>
