<!--
  Event scheduler — the Calendar (/interviews) surface. Lists the
  workspace's event-scheduler links (self-scheduling links shared with
  candidates) with their interviewers and scheduled/pending counts, plus
  a "New event scheduler link" CTA. Uses the shared SettingsTable /
  BrandDataTable chrome so the list is pixel-identical to every other
  system table (Public links, Locations, Team, …). Rows are a fixture
  today; swap for a useSchedulerLinks() composable when the API lands.
-->
<script setup lang="ts">
import { Plus, ExternalLink, Copy, Check, Pencil } from 'lucide-vue-next'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'
import { TableCell, TableHead, TableRow } from '~/components/ui/table'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsTable from '~/components/settings/SettingsTable.vue'
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

const total = computed(() => links.value.length)
const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return links.value
  return links.value.filter(l => l.name.toLowerCase().includes(q))
})

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
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden rounded-tl-[22px] bg-white border-t border-l border-[var(--brand-border)]">
      <div class="flex-1 overflow-auto">
        <div class="px-8 pt-7 pb-10 max-w-[1180px]">
          <!-- Standard settings page hero (title + subtitle + Learn more + divider) -->
          <SettingsPageHeader
            title="Event scheduler"
            subtitle="Share your availability with candidates and schedule events."
            learn-more-href="#"
          />

          <!-- Shared system table (SettingsTable → BrandDataTable) -->
          <SettingsTable
            search-placeholder="Search scheduler links"
            item-label="scheduler links"
            :total="total"
            :filtered-count="filtered.length"
            :empty="!filtered.length"
            empty-message="No scheduler links match."
            :colspan="4"
            @update:search="v => search = v"
          >
            <template #actions>
              <BrandButton variant="primary-teal" @click="newLink">
                <Plus class="w-4 h-4 mr-1" stroke-width="2" />
                New event scheduler link
              </BrandButton>
            </template>

            <template #header>
              <TableRow class="bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)]">
                <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Name</TableHead>
                <TableHead class="py-[14px] px-4 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)] w-[200px]">Interviewers</TableHead>
                <TableHead class="py-[14px] px-4 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)] w-[120px]">Scheduled</TableHead>
                <TableHead class="py-[14px] px-4 text-right text-[13px] font-semibold text-[var(--brand-nav-text)] w-[200px]">Pending</TableHead>
              </TableRow>
            </template>

            <TableRow
              v-for="(l, i) in filtered"
              :key="l.id"
              class="border-b border-[var(--brand-border-row)] last:border-0"
              :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
            >
              <TableCell class="py-[11px] px-5 border-r border-[var(--brand-border-hairline)]">
                <a href="#" class="text-[13.5px] font-medium text-[var(--brand-text)] hover:underline">{{ l.name }}</a>
              </TableCell>
              <TableCell class="py-[11px] px-4 border-r border-[var(--brand-border-hairline)]">
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
                  <span v-if="!interviewersFor(l).length" class="text-[13.5px] text-[var(--brand-text-muted)]">—</span>
                </div>
              </TableCell>
              <TableCell class="py-[11px] px-4 text-[13.5px] font-semibold text-[var(--brand-text)] tabular-nums border-r border-[var(--brand-border-hairline)]">{{ l.scheduled }}</TableCell>
              <TableCell class="py-[11px] px-4 text-right">
                <div class="flex items-center justify-end gap-2.5">
                  <span class="text-[13.5px] font-semibold text-[var(--brand-text)] tabular-nums">{{ l.pending }}</span>
                  <div class="flex items-center gap-1.5">
                    <NuxtLink :to="`/self-schedule?name=${encodeURIComponent(l.name)}&brand=paymob`" target="_blank" class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)] transition-colors" title="Preview scheduling page">
                      <ExternalLink class="w-3.5 h-3.5" />
                    </NuxtLink>
                    <button type="button" class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] transition-colors" :class="copiedId === l.id ? 'text-[var(--brand-teal)]' : 'text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)]'" :title="copiedId === l.id ? 'Copied' : 'Copy link'" @click="copyLink(l)">
                      <component :is="copiedId === l.id ? Check : Copy" class="w-3.5 h-3.5" />
                    </button>
                    <button type="button" class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)] transition-colors" title="Edit link">
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </SettingsTable>
        </div>
      </div>
    </div>

    <EventSchedulerLinkModal v-model:open="createOpen" @create="onCreateLink" />
  </div>
</template>
