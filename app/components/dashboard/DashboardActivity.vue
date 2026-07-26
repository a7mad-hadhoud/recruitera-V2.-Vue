<!--
  Activity tab of the Home dashboard — Activity/Notifications toggle, a
  left filter rail and a date-grouped feed served over MSW
  (useDashboardActivity). Reuses BrandAvatarInitials. Colors are
  --brand-* tokens only.
-->
<script setup lang="ts">
import { Briefcase, Bookmark, Search, Plus, Bell } from 'lucide-vue-next'
import { BrandAvatarInitials } from '~/components/brand'
import { useTeamMembers } from '~/composables/useTeam'
import { useDashboardActivity } from '~/composables/useDashboard'

const tab = ref<'Activity' | 'Notifications'>('Activity')
const FILTERS = ['Jobs', 'Talent pools', 'Date range', 'Activity type']

const { data } = useDashboardActivity()
const groups = computed(() => data.value?.data ?? [])

// Actor avatar from the team roster (first member = current user).
const { data: teamData } = useTeamMembers()
const actor = computed(() => teamData.value?.data?.[0])
const actorInitials = computed(() => {
  const n = actor.value?.name ?? 'Amr Hammad'
  const p = n.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1]![0] : '')).toUpperCase() || 'AH'
})
const actorBg = computed(() => actor.value?.avatarBg ?? 'var(--brand-avatar-4)')
const AVATAR_TEXT = 'var(--brand-avatar-text)'

const iconFor = { screen: Search, bookmark: Bookmark, job: Briefcase }
</script>

<template>
  <div class="flex flex-col md:flex-row gap-8 max-w-[1400px] mx-auto px-6 py-6">
    <!-- Left rail -->
    <aside class="w-full md:w-[220px] shrink-0 flex flex-col">
      <div class="inline-flex items-center gap-1 p-1 rounded-[10px] bg-[var(--brand-canvas)] mb-6">
        <button v-for="t in (['Activity','Notifications'] as const)" :key="t" type="button" class="flex-1 px-3 h-8 rounded-md text-[13px] font-semibold transition" :class="tab === t ? 'bg-[var(--brand-surface-white)] text-[var(--brand-text)] shadow-sm' : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'" @click="tab = t">{{ t }}</button>
      </div>
      <button v-for="f in FILTERS" :key="f" type="button" class="flex items-center gap-2 py-3 text-[14px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] border-b border-[var(--brand-border-fade)] transition">
        <Plus class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="2" /> {{ f }}
      </button>
      <button type="button" class="flex items-center gap-2 mt-6 text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]">
        <Bell class="w-4 h-4" stroke-width="1.8" /> Adjust notifications
      </button>
    </aside>

    <!-- Feed -->
    <div class="flex-1 min-w-0">
      <h2 class="text-[22px] font-bold text-[var(--brand-text)] mb-5">Activity</h2>
      <div v-for="g in groups" :key="g.date" class="mb-8">
        <div class="text-[13px] font-semibold text-[var(--brand-text-quiet)] mb-3">{{ g.date }}</div>
        <div class="rounded-[14px] border border-[var(--brand-border-light)] overflow-hidden">
          <div v-for="(e, i) in g.events" :key="i" class="flex items-center gap-3 px-5 py-4" :class="i < g.events.length - 1 ? 'border-b border-[var(--brand-border-fade)]' : ''">
            <div class="relative shrink-0">
              <BrandAvatarInitials :initials="actorInitials" :bg="actorBg" :color="AVATAR_TEXT" size="xl" />
              <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--brand-surface-white)] border border-[var(--brand-border)] inline-flex items-center justify-center">
                <component :is="iconFor[e.icon]" class="w-3 h-3 text-[var(--brand-text-subtle)]" stroke-width="2" />
              </span>
            </div>
            <div class="flex-1 min-w-0 text-[14px] text-[var(--brand-text)]">
              <span class="font-bold">{{ e.bold }}</span> {{ e.text }}<span v-if="e.tail" class="font-bold">{{ e.tail }}</span>
            </div>
            <span class="text-[12.5px] text-[var(--brand-text-quiet)] shrink-0">{{ e.ago }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
