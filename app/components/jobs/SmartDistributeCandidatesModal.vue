<!--
  Smart Distribute — "View assigned candidates" modal (E3). Opens from a
  recruiter row's kebab menu in JobEditorTeamTab. Read-only list + a
  per-row inline Reassign — the parent owns the actual state mutation
  (this component only emits intent), same split as JobTeamMemberModal.
-->
<script setup lang="ts">
import { X, ArrowRightLeft } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { BrandAvatarInitials } from '~/components/brand'
import { useSmartDistributeCandidates } from '~/composables/useSmartDistribute'
import type { SmartDistributeCandidate, TeamMember } from '~/types'

const props = defineProps<{
  jobId: string
  recruiter: (TeamMember & { assigned: number }) | null
  otherRecruiters: TeamMember[]
}>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  reassign: [payload: { candidateId: string; toTeamMemberId: string }]
}>()

const route = useRoute()
const recruiterId = computed(() => props.recruiter?.id ?? null)
const { data, isLoading } = useSmartDistributeCandidates(props.jobId, recruiterId)

// Local mutable copy, reseeded per recruiter, so a Reassign can remove the
// row immediately without waiting on a refetch (same pattern as
// settings/locations.vue — seed once from the query, mutate locally).
const localCandidates = ref<SmartDistributeCandidate[]>([])
watch([data, recruiterId], ([v]) => {
  localCandidates.value = v ? [...v.data] : []
})
const candidates = computed(() => localCandidates.value)

const STAGE_STYLE: Record<string, string> = {
  Applied:   'bg-[var(--brand-stage-applied-bg)] text-[var(--brand-stage-applied-text)]',
  Screened:  'bg-[var(--brand-stage-screened-bg)] text-[var(--brand-stage-screened-text)]',
  Interview: 'bg-[var(--brand-stage-screened-bg)] text-[var(--brand-stage-screened-text)]',
  Offer:     'bg-[var(--brand-stage-positive-bg)] text-[var(--brand-stage-positive-text)]',
}

function onReassign(candidateId: string, e: Event) {
  const toTeamMemberId = (e.target as HTMLSelectElement).value
  if (!toTeamMemberId) return
  localCandidates.value = localCandidates.value.filter(c => c.id !== candidateId)
  emit('reassign', { candidateId, toTeamMemberId })
}

function openProfile(candidateId: string) {
  open.value = false
  navigateTo({ path: `/candidates/${candidateId}`, query: { from: route.fullPath } })
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 gap-0 border-0 rounded-[20px] max-w-[560px] w-[92vw] max-h-[80vh] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-white overflow-hidden flex flex-col"
    >
      <div class="flex items-center gap-3 px-7 pt-6 pb-5 shrink-0">
        <BrandAvatarInitials
          v-if="recruiter"
          :initials="recruiter.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()"
          :bg="recruiter.avatarBg"
          :color="recruiter.avatarText"
          size="xl"
        />
        <div class="flex-1 min-w-0">
          <DialogTitle class="text-[17px] font-bold text-[var(--brand-text)] leading-tight truncate">
            {{ recruiter?.name }}
          </DialogTitle>
          <p class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5">
            {{ recruiter?.assigned ?? 0 }} assigned candidate{{ recruiter?.assigned === 1 ? '' : 's' }}
          </p>
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

      <div class="h-px bg-[var(--brand-border-fade)] shrink-0" />

      <div class="flex-1 overflow-y-auto px-4 py-3">
        <div v-if="isLoading" class="py-10 text-center text-[13px] text-[var(--brand-text-quiet)]">Loading…</div>
        <div v-else-if="!candidates.length" class="py-10 text-center text-[13px] text-[var(--brand-text-quiet)]">
          No candidates assigned to this recruiter yet.
        </div>
        <div v-else class="flex flex-col gap-1.5">
          <div
            v-for="c in candidates"
            :key="c.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[var(--brand-canvas)] transition cursor-pointer"
            role="link"
            :aria-label="`Open ${c.name}'s profile`"
            @click="openProfile(c.id)"
          >
            <BrandAvatarInitials :initials="c.initials" :bg="c.avatarColor" color="var(--brand-avatar-text)" size="md" />
            <div class="flex-1 min-w-0">
              <div class="text-[13px] font-bold text-[var(--brand-text)] truncate">{{ c.name }}</div>
              <div class="text-[11.5px] text-[var(--brand-text-quiet)] truncate">{{ c.source }}</div>
            </div>
            <span
              class="shrink-0 text-[11px] font-bold px-2 py-1 rounded-full"
              :class="STAGE_STYLE[c.stage] ?? 'bg-[var(--brand-surface-badge)] text-[var(--brand-text-muted)]'"
            >{{ c.stage }}</span>
            <span v-if="c.evaluationScore" class="shrink-0 text-[12px] font-bold text-[var(--brand-text-secondary)] w-9 text-right tabular-nums">
              {{ c.evaluationScore }}%
            </span>
            <div class="relative shrink-0" @click.stop>
              <select
                class="h-8 pl-7 pr-2 text-[11.5px] font-semibold rounded-[8px] border-[1.5px] border-[var(--brand-border)] bg-white text-[var(--brand-text-secondary)] focus:border-[var(--brand-teal)] focus:outline-none appearance-none cursor-pointer"
                :aria-label="`Reassign ${c.name}`"
                @change="onReassign(c.id, $event)"
              >
                <option value="">Reassign…</option>
                <option v-for="r in otherRecruiters" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
              <ArrowRightLeft class="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
