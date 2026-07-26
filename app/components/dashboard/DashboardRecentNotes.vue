<!--
  Recent notes tab of the Home dashboard — recently added candidate notes,
  grouped by date, served over MSW (useDashboardNotes). Reuses
  BrandAvatarInitials + BrandEmptyState. Colors are --brand-* tokens only.
-->
<script setup lang="ts">
import { ThumbsUp, SmilePlus, StickyNote } from 'lucide-vue-next'
import { BrandAvatarInitials, BrandEmptyState } from '~/components/brand'
import { useDashboardNotes } from '~/composables/useDashboard'

const TABS = ['All notes', 'Followed candidates', 'Mentioning me']
const active = ref('All notes')

const { data } = useDashboardNotes()
const groups = computed(() => data.value?.data ?? [])
const AVATAR_TEXT = 'var(--brand-avatar-text)'
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-6 py-6">
    <h2 class="text-[22px] font-bold text-[var(--brand-text)]">Recent notes</h2>
    <p class="text-[14px] text-[var(--brand-text-quiet)] mt-1 mb-5">View recently added candidate notes by you or your team members.</p>

    <div class="inline-flex items-center gap-1 p-1 rounded-[10px] bg-[var(--brand-canvas)] mb-8">
      <button v-for="t in TABS" :key="t" type="button" class="px-3 h-8 rounded-md text-[13px] font-semibold transition" :class="active === t ? 'bg-[var(--brand-surface-white)] text-[var(--brand-text)] shadow-sm' : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'" @click="active = t">{{ t }}</button>
    </div>

    <template v-if="groups.length">
      <div v-for="g in groups" :key="g.date" class="mb-8">
        <div class="text-[13px] font-semibold text-[var(--brand-text-quiet)] mb-3">{{ g.date }}</div>
        <div class="text-[14px] font-bold text-[var(--brand-text)] mb-3">About: {{ g.about }}</div>
        <div v-for="(n, i) in g.notes" :key="i" class="rounded-[14px] border border-[var(--brand-border-light)] px-5 py-4 mb-3">
          <div class="flex items-start gap-3">
            <BrandAvatarInitials :initials="n.initials" :bg="n.bg" :color="AVATAR_TEXT" size="xl" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[14px] font-bold text-[var(--brand-text)]">{{ n.author }}</span>
                <span class="text-[12.5px] text-[var(--brand-text-quiet)] shrink-0">{{ n.ago }}</span>
              </div>
              <div class="text-[14px] text-[var(--brand-text)] mt-1">
                <span v-if="n.mention" class="font-semibold text-[var(--brand-pipeline-purple)]">{{ n.mention }}</span> {{ n.body }}
              </div>
              <div class="flex items-center gap-4 mt-3">
                <button type="button" class="text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] transition" aria-label="Like"><ThumbsUp class="w-4 h-4" stroke-width="1.8" /></button>
                <button type="button" class="text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] transition" aria-label="React"><SmilePlus class="w-4 h-4" stroke-width="1.8" /></button>
                <button type="button" class="text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]">Reply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <BrandEmptyState v-else :icon="StickyNote" title="No recent notes" description="Notes added to jobs and candidates will appear here." />
  </div>
</template>
