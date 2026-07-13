<!--
  Candidate Profile → Activity tab. Ported from the reference mockup's
  data-panel="activity": a flat audit-log timeline (actor avatar + rich
  text line with bolded entities + timestamp). Fully static — an activity
  feed like this is generated server-side, nothing here is user-editable.
-->
<script setup lang="ts">
import { History } from 'lucide-vue-next'
import { BrandAvatarInitials } from '~/components/brand'
import type { CandidateProfile } from '~/types'

defineProps<{ profile: CandidateProfile }>()

type Part = string | { bold: string }

interface ActivityRow { id: string, parts: Part[], time: string }

const ACTIVITY: ActivityRow[] = [
  { id: 'a1', parts: [{ bold: 'Mo ss' }, ' added a task ', { bold: 'Follow up on references' }, '.'], time: 'Jul 12, 2026 1:15 am' },
  { id: 'a2', parts: [{ bold: 'Mo ss' }, ' added a task ', { bold: 'Send take-home assignment' }, '.'], time: 'Jul 12, 2026 1:12 am' },
  { id: 'a3', parts: [{ bold: 'Mo ss' }, ' assigned the candidate’s preferred location ', { bold: 'Amsterdam' }, '.'], time: 'Jul 12, 2026 1:05 am' },
  { id: 'a4', parts: [{ bold: 'Mo ss' }, ' assigned the candidate to the job ', { bold: 'Developer' }, '.'], time: 'Jul 12, 2026 12:58 am' },
  { id: 'a5', parts: [{ bold: 'Mo ss' }, ' assigned the candidate to the talent pool ', { bold: 'Engineering' }, '.'], time: 'Jul 11, 2026 11:40 pm' },
  { id: 'a6', parts: [{ bold: 'Mo ss' }, ' disqualified the candidate with the reason ', { bold: 'Not a fit' }, ' in the job ', { bold: 'Developer (2)' }, '.'], time: 'Jul 11, 2026 9:22 pm' },
  { id: 'a7', parts: [{ bold: 'Mo ss' }, ' added the candidate to the job ', { bold: 'Developer (2)' }, '.'], time: 'Jul 11, 2026 8:15 pm' },
]
</script>

<template>
  <div class="p-6 pb-9 w-full">
    <div v-if="ACTIVITY.length" class="border border-[var(--brand-border-light)] rounded-[14px] bg-[var(--brand-surface-white)] overflow-hidden">
      <div
        v-for="row in ACTIVITY"
        :key="row.id"
        class="flex items-center gap-3.5 px-4 py-[15px] border-b border-[var(--brand-border-hairline)] last:border-b-0"
      >
        <BrandAvatarInitials initials="MS" size="sm" class="shrink-0" />
        <div class="flex-1 min-w-0 text-[14px] leading-[1.5] text-[var(--brand-text-secondary)]">
          <template v-for="(p, i) in row.parts" :key="i">
            <span v-if="typeof p === 'string'">{{ p }}</span>
            <span v-else class="font-bold text-[var(--brand-text)]">{{ p.bold }}</span>
          </template>
        </div>
        <span class="text-[13px] text-[var(--brand-text-quiet)] shrink-0 whitespace-nowrap">{{ row.time }}</span>
      </div>
    </div>
    <p v-else class="flex items-center gap-2 text-[13.5px] text-[var(--brand-text-quiet)]">
      <History class="w-4 h-4" stroke-width="1.7" />No activity recorded yet.
    </p>
  </div>
</template>
