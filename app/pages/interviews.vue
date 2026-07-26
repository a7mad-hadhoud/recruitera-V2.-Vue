<!--
  Event scheduler — the Calendar (/interviews) surface. Lists the
  workspace's event-scheduler links (self-scheduling links shared with
  candidates) with their interviewers and scheduled/pending counts, plus
  a "New event scheduler link" CTA. Ports the reference into our design
  system (brand tokens, house table). Rows are a fixture today; swap for
  a useSchedulerLinks() composable when the API lands.
-->
<script setup lang="ts">
import { Plus, ExternalLink, Copy, Pencil, CalendarClock } from 'lucide-vue-next'
import { BrandPageTitle, BrandButton, BrandAvatarInitials, BrandEmptyState } from '~/components/brand'
import EventSchedulerLinkModal from '~/components/interviews/EventSchedulerLinkModal.vue'
import { useTeamMembers } from '~/composables/useTeam'
import type { TeamMember } from '~/types'

definePageMeta({ layout: 'default' })

const { data: teamData } = useTeamMembers()
const roster = computed<TeamMember[]>(() => teamData.value?.data ?? [])
function initialsFor(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1]![0] : '')).toUpperCase() || '?'
}

interface SchedulerLink {
  id: string
  name: string
  interviewerIds: string[]
  scheduled: number
  pending: number
  url: string
}

// Fixture — replace with useSchedulerLinks() when the endpoint lands.
const links = ref<SchedulerLink[]>([
  { id: 's1', name: 'Phone screen — 30 min', interviewerIds: [], scheduled: 4, pending: 2, url: 'https://recruitera.ai/v/i/s/hnod3ppauv4h' },
  { id: 's2', name: 'On-site loop — Engineering', interviewerIds: [], scheduled: 1, pending: 3, url: 'https://recruitera.ai/v/i/s/k2p9xz71mabc' },
  { id: 's3', name: 'Hiring manager intro', interviewerIds: [], scheduled: 0, pending: 0, url: 'https://recruitera.ai/v/i/s/qm44h3dhff2z' },
])

// Assign the first 1–2 roster members to each link once the team loads.
watchEffect(() => {
  if (!roster.value.length) return
  links.value.forEach((l, i) => {
    if (!l.interviewerIds.length) {
      l.interviewerIds = roster.value.slice(0, (i % 2) + 1).map(m => m.id)
    }
  })
})
function interviewersFor(l: SchedulerLink) {
  return roster.value.filter(m => l.interviewerIds.includes(m.id))
}

const copiedId = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | null = null
async function copyLink(l: SchedulerLink) {
  try { await navigator.clipboard.writeText(l.url) } catch {}
  copiedId.value = l.id
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (copiedId.value = null), 1400)
}
const createOpen = ref(false)
function newLink() {
  createOpen.value = true
}
function onCreateLink(payload: Record<string, unknown>) {
  const name = String((payload as { name?: string }).name ?? 'Untitled link')
  links.value = [
    { id: `s${Date.now()}`, name, interviewerIds: (payload.interviewerIds as string[]) ?? [], scheduled: 0, pending: 0, url: `https://recruitera.ai/v/i/s/${Math.random().toString(36).slice(2, 14)}` },
    ...links.value,
  ]
}
</script>

<template>
  <!-- Full-height panel flush against sidebar + top nav, curved at the
       top-left (rounded-tl-[22px]) — same join treatment as the Jobs/
       Candidates tabs. -->
  <div class="flex h-full overflow-hidden bg-[var(--brand-canvas)]">
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden rounded-tl-[22px] bg-[var(--brand-surface-white)] border-t border-l border-[var(--brand-border)]">
      <div class="flex-1 overflow-auto">
        <div class="px-8 pt-7 pb-10 max-w-[1180px]">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <BrandPageTitle label="Event scheduler" />
        <p class="m-0 mt-1 text-[14px] text-[var(--brand-text-quiet)]">
          Share your availability with candidates and schedule events.
          <a href="#" class="font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]">Learn more</a>
        </p>
      </div>
      <BrandButton variant="primary-teal" @click="newLink">
        <Plus class="w-4 h-4 mr-1.5" stroke-width="2" />
        New event scheduler link
      </BrandButton>
    </div>

    <div class="h-px bg-[var(--brand-border-fade)] my-5" />

    <!-- Table -->
    <div v-if="links.length" class="rounded-[12px] border border-[var(--brand-border-fade)] bg-white overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-[var(--brand-border-fade)] text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--brand-text-quiet)]">
            <th class="px-5 py-3 font-bold">Name</th>
            <th class="px-5 py-3 font-bold w-[180px]">Interviewers</th>
            <th class="px-5 py-3 font-bold w-[110px]">Scheduled</th>
            <th class="px-5 py-3 font-bold w-[200px]">Pending</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="l in links"
            :key="l.id"
            class="border-b border-[var(--brand-border-fade)] last:border-b-0 hover:bg-[var(--brand-canvas)] transition"
          >
            <td class="px-5 py-3.5">
              <a href="#" class="text-[14px] font-semibold text-[var(--brand-text)] hover:underline">{{ l.name }}</a>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex -space-x-1.5">
                <BrandAvatarInitials
                  v-for="m in interviewersFor(l)"
                  :key="m.id"
                  :initials="initialsFor(m.name)"
                  :bg="m.avatarBg"
                  :color="m.avatarText"
                  size="md"
                  :title="m.name"
                />
                <span v-if="!interviewersFor(l).length" class="text-[13px] text-[var(--brand-text-quiet)]">—</span>
              </div>
            </td>
            <td class="px-5 py-3.5">
              <span class="text-[14px] font-bold text-[var(--brand-text)] tabular-nums">{{ l.scheduled }}</span>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[14px] font-bold text-[var(--brand-text)] tabular-nums">{{ l.pending }}</span>
                <div class="flex items-center gap-0.5">
                  <a :href="l.url" target="_blank" rel="noopener" class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-surface-hover)] hover:text-[var(--brand-text)] transition" aria-label="Open link">
                    <ExternalLink class="w-4 h-4" stroke-width="1.8" />
                  </a>
                  <button type="button" class="w-8 h-8 rounded-md inline-flex items-center justify-center transition" :class="copiedId === l.id ? 'text-[var(--brand-teal)]' : 'text-[var(--brand-text-quiet)] hover:bg-[var(--brand-surface-hover)] hover:text-[var(--brand-text)]'" :aria-label="copiedId === l.id ? 'Copied' : 'Copy link'" @click="copyLink(l)">
                    <Copy class="w-4 h-4" stroke-width="1.8" />
                  </button>
                  <button type="button" class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-surface-hover)] hover:text-[var(--brand-text)] transition" aria-label="Edit link">
                    <Pencil class="w-4 h-4" stroke-width="1.8" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BrandEmptyState
      v-else
      :icon="CalendarClock"
      title="No scheduler links yet"
      description="Create a scheduler link to share your availability and let candidates book time."
    />
        </div>
      </div>
    </div>

    <EventSchedulerLinkModal v-model:open="createOpen" @create="onCreateLink" />
  </div>
</template>
