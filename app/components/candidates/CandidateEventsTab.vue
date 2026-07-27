<!--
  Candidate Profile → Events tab. Upcoming / Past segmented switch (each with a
  count), a "Schedule event" action (emits `schedule` → parent opens the
  Schedule dialog), and day-grouped event cards: time range + candidate +
  job + interview title + the organizer's avatar. Fixture-backed for now
  (mirrors the other tabs' local-data pattern); swap for a useCandidateEvents()
  composable when the endpoint lands.
-->
<script setup lang="ts">
import { CalendarPlus, CalendarClock } from 'lucide-vue-next'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'
import type { CandidateProfile } from '~/types'

const props = defineProps<{ profile: CandidateProfile }>()
const emit = defineEmits<{ schedule: [] }>()

const segment = ref<'upcoming' | 'past'>('upcoming')

interface CandidateEvent {
  id: string
  start: string
  end: string
  jobName: string
  title: string
}
interface EventDay { day: string, events: CandidateEvent[] }

const jobName = computed(() => props.profile.jobs[0]?.title ?? 'the role')

// Fixture — one upcoming interview today, no past events (matches the mockup).
const upcomingGroups = computed<EventDay[]>(() => [
  {
    day: 'Today',
    events: [
      { id: 'ev1', start: '22:16', end: '22:46', jobName: jobName.value, title: `${props.profile.name} - Interview with recruitera` },
    ],
  },
])
const pastGroups = ref<EventDay[]>([])

const upcomingCount = computed(() => upcomingGroups.value.reduce((n, g) => n + g.events.length, 0))
const pastCount = computed(() => pastGroups.value.reduce((n, g) => n + g.events.length, 0))
const groups = computed(() => (segment.value === 'upcoming' ? upcomingGroups.value : pastGroups.value))
</script>

<template>
  <div class="p-6 pb-9 w-full">
    <div class="flex items-center justify-between gap-3 flex-wrap mb-5">
      <!-- Upcoming / Past segmented -->
      <div class="inline-flex bg-[var(--brand-surface-hover)] rounded-[10px] p-[3px]">
        <button
          v-for="s in (['upcoming', 'past'] as const)"
          :key="s"
          type="button"
          class="inline-flex items-center gap-2 text-[13.5px] font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer capitalize"
          :class="segment === s
            ? 'bg-[var(--brand-surface-white)] text-[var(--brand-teal)] shadow-[0_1px_2px_rgba(0,20,18,0.08)]'
            : 'text-[var(--brand-text-secondary)]'"
          @click="segment = s"
        >
          {{ s }}
          <span
            class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold tabular-nums"
            :class="segment === s ? 'bg-[var(--brand-lime-active-bg)] text-[var(--brand-olive)]' : 'bg-[var(--brand-border-light)] text-[var(--brand-text-secondary)]'"
          >{{ s === 'upcoming' ? upcomingCount : pastCount }}</span>
        </button>
      </div>

      <BrandButton variant="primary-teal" size="md" @click="emit('schedule')">
        <CalendarPlus class="w-4 h-4" stroke-width="1.9" />Schedule event
      </BrandButton>
    </div>

    <!-- Day-grouped events -->
    <div v-if="groups.length" class="flex flex-col gap-5">
      <div v-for="group in groups" :key="group.day">
        <div class="text-[17px] font-bold text-[var(--brand-text)] mb-3.5">{{ group.day }}</div>
        <div class="border border-[var(--brand-border-light)] rounded-[14px] bg-[var(--brand-surface-white)] overflow-hidden">
          <div
            v-for="ev in group.events"
            :key="ev.id"
            class="flex items-start gap-4 px-6 py-5 border-t border-[var(--brand-border-hairline)] first:border-t-0"
          >
            <div class="w-[116px] shrink-0 text-[14.5px] tabular-nums text-[var(--brand-text-quiet)] pt-1">{{ ev.start }} - {{ ev.end }}</div>
            <BrandAvatarInitials :initials="profile.initials" :bg="profile.avatarColor" size="xl" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="font-bold text-[15px] text-[var(--brand-text)]">{{ profile.name }}</span>
                <span class="inline-flex items-center gap-2 text-[14.5px] text-[var(--brand-text-secondary)]">
                  <span class="w-2 h-2 rounded-full bg-[var(--brand-status-teal-green)]" />{{ ev.jobName }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-3 mt-1">
                <span class="text-[14px] text-[var(--brand-text-quiet)] min-w-0 truncate">{{ ev.title }}</span>
                <BrandAvatarInitials :initials="profile.ownerInitials" size="sm" class="shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center justify-center text-center py-16 px-6">
      <span class="w-14 h-14 rounded-full bg-[var(--brand-surface-hover)] inline-flex items-center justify-center mb-4">
        <CalendarClock class="w-7 h-7 text-[var(--brand-icon-muted)]" stroke-width="1.6" />
      </span>
      <div class="text-[15px] font-semibold text-[var(--brand-text)]">No {{ segment }} events</div>
      <div class="text-[13.5px] text-[var(--brand-text-quiet)] mt-1 max-w-[320px]">
        {{ segment === 'upcoming' ? 'Nothing scheduled yet. Use Schedule event to add one.' : 'Past interviews will appear here once they’ve happened.' }}
      </div>
    </div>
  </div>
</template>
