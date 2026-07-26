<!--
  Calendar tab of the Home dashboard — week time-grid (Mon–Fri columns,
  hourly rows) with a toolbar: date-range pill, Team-calendar filter,
  Schedule CTA, Week/Day toggle and prev/next nav. Ports Recruitee's
  dashboard calendar. Static week today — wire to real events later.
-->
<script setup lang="ts">
import { Calendar as CalendarIcon, Filter, CalendarPlus, ChevronLeft, ChevronRight, MoreHorizontal, ChevronDown } from 'lucide-vue-next'
import CandidateScheduleModal from '~/components/candidates/CandidateScheduleModal.vue'

const view = ref<'Week' | 'Day'>('Week')
const scheduleOpen = ref(false)
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8) // 08:00 – 23:00
const DAYS = [
  { date: '20 Jul', name: 'Monday' },
  { date: '21 Jul', name: 'Tuesday' },
  { date: '22 Jul', name: 'Wednesday' },
  { date: '23 Jul', name: 'Thursday' },
  { date: '24 Jul', name: 'Friday' },
]
function fmtHour(h: number) { return `${h}:00` }
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-3 px-6 py-4 flex-wrap">
      <button type="button" class="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] font-semibold text-[var(--brand-text)] hover:border-[var(--brand-teal)] transition">
        <CalendarIcon class="w-4 h-4 text-[var(--brand-text-subtle)]" stroke-width="1.8" /> 20 - 24 Jul 2026
      </button>
      <div class="flex items-center gap-2.5">
        <button type="button" class="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] text-[14px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition">
          <Filter class="w-4 h-4" stroke-width="1.8" /> Team calendar <ChevronDown class="w-3.5 h-3.5" stroke-width="2" />
        </button>
        <button type="button" class="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-[var(--brand-teal)] text-[14px] font-bold text-[var(--brand-avatar-text)] hover:opacity-95 transition" @click="scheduleOpen = true">
          <CalendarPlus class="w-4 h-4" stroke-width="1.9" /> Schedule
        </button>
        <div class="inline-flex items-center rounded-[10px] border border-[var(--brand-border)] overflow-hidden">
          <button v-for="v in (['Week','Day'] as const)" :key="v" type="button" class="h-10 px-4 text-[13.5px] font-semibold transition" :class="view === v ? 'bg-[var(--brand-canvas)] text-[var(--brand-text)]' : 'bg-[var(--brand-surface-white)] text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'" @click="view = v">{{ v }}</button>
        </div>
        <div class="inline-flex items-center gap-0.5">
          <button type="button" class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center border border-[var(--brand-border)] text-[var(--brand-text-subtle)] hover:border-[var(--brand-teal)] transition" aria-label="Previous"><ChevronLeft class="w-4 h-4" stroke-width="2" /></button>
          <button type="button" class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center border border-[var(--brand-border)] text-[var(--brand-text-subtle)] hover:border-[var(--brand-teal)] transition" aria-label="Next"><ChevronRight class="w-4 h-4" stroke-width="2" /></button>
        </div>
        <button type="button" class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-subtle)] hover:bg-[var(--brand-canvas)] transition" aria-label="More"><MoreHorizontal class="w-4 h-4" stroke-width="2" /></button>
      </div>
    </div>

    <!-- Day headers -->
    <div class="grid border-t border-[var(--brand-border-fade)]" style="grid-template-columns:72px repeat(5,1fr)">
      <div class="px-3 py-2.5 border-r border-[var(--brand-border-fade)] flex flex-col items-center justify-center">
        <span class="text-[12px] font-bold text-[var(--brand-text)]">GMT</span>
        <span class="text-[11px] text-[var(--brand-text-quiet)] inline-flex items-center gap-0.5">+03:00 <ChevronDown class="w-3 h-3" stroke-width="2" /></span>
      </div>
      <div v-for="d in DAYS" :key="d.date" class="px-4 py-2.5 border-r border-[var(--brand-border-fade)]">
        <div class="text-[12.5px] text-[var(--brand-text-quiet)]">{{ d.date }}</div>
        <div class="text-[15px] font-bold text-[var(--brand-text)]">{{ d.name }}</div>
      </div>
    </div>

    <!-- Time grid -->
    <div class="flex-1 overflow-y-auto">
      <div class="grid" style="grid-template-columns:72px repeat(5,1fr)">
        <template v-for="h in HOURS" :key="h">
          <div class="h-16 border-r border-b border-[var(--brand-border-fade)] pr-2 pt-1 text-right text-[11.5px] text-[var(--brand-text-quiet)]">{{ fmtHour(h) }}</div>
          <div v-for="d in DAYS" :key="d.date + h" class="h-16 border-r border-b border-[var(--brand-border-fade)] hover:bg-[var(--brand-canvas)] transition cursor-pointer" @click="scheduleOpen = true" />
        </template>
      </div>
    </div>

    <!-- Same Schedule-event popup as interview scheduling -->
    <CandidateScheduleModal v-model:open="scheduleOpen" />
  </div>
</template>
