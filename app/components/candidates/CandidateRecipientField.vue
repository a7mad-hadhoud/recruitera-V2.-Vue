<!--
  Cc / Bcc recipient field for the Emails composer. Renders selected people as
  removable chips and offers a live team-member autocomplete (from
  useTeamMembers) as you type. Client-only — feeds the visual compose form.
-->
<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useTeamMembers } from '~/composables/useTeam'
import type { TeamMember } from '~/types'

const props = defineProps<{ label: string, placeholder: string }>()

const { data: teamData } = useTeamMembers()
const roster = computed<TeamMember[]>(() => teamData.value?.data ?? [])

interface Recip { name: string, email: string, initials: string, bg: string, color: string }
const chips = ref<Recip[]>([])
const query = ref('')
const focused = ref(false)

const matches = computed(() => {
  const q = query.value.trim().toLowerCase()
  const chosen = new Set(chips.value.map(c => c.email))
  return roster.value.filter(m => !chosen.has(m.email) && (q === '' || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)))
})
function initialsOf(name: string) {
  return ((name.split(' ')[0]?.[0] ?? '') + (name.split(' ').slice(-1)[0]?.[0] ?? '')).toUpperCase()
}
function add(m: TeamMember) {
  chips.value.push({ name: m.name, email: m.email, initials: initialsOf(m.name), bg: m.avatarBg, color: m.avatarText })
  query.value = ''
}
function remove(i: number) { chips.value.splice(i, 1) }
function onBackspace() {
  if (query.value === '' && chips.value.length) chips.value.pop()
}
</script>

<template>
  <div class="flex items-start gap-2 px-4 py-2.5 border-b border-[var(--brand-border-hairline)]">
    <span class="text-[13px] text-[var(--brand-text-quiet)] w-11 shrink-0 pt-1.5">{{ label }}</span>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span
          v-for="(c, i) in chips"
          :key="c.email"
          class="inline-flex items-center gap-1.5 bg-[var(--brand-surface-hover)] border border-[var(--brand-border)] rounded-lg px-2 py-1 text-[13px] font-semibold text-[var(--brand-text)]"
        >
          <span class="w-[18px] h-[18px] rounded-full inline-flex items-center justify-center text-[8px] font-bold" :style="{ background: c.bg, color: c.color }">{{ c.initials }}</span>
          {{ c.email }}
          <button type="button" class="text-[var(--brand-icon-muted)] cursor-pointer" @click="remove(i)"><X class="w-3 h-3" stroke-width="2" /></button>
        </span>
        <div class="relative flex-1 min-w-[120px]">
          <input
            v-model="query"
            type="text"
            :placeholder="chips.length ? '' : placeholder"
            class="w-full border-none outline-none bg-transparent text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)] py-1"
            @focus="focused = true"
            @blur="() => setTimeout(() => focused = false, 150)"
            @keydown.backspace="onBackspace"
          >
          <div
            v-if="focused && matches.length"
            class="absolute left-0 top-[calc(100%+6px)] w-[300px] max-w-[90vw] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-xl shadow-[0_16px_48px_rgba(0,20,18,0.2)] z-30 p-1.5 max-h-[260px] overflow-y-auto"
          >
            <button
              v-for="m in matches"
              :key="m.email"
              type="button"
              class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
              @mousedown.prevent="add(m)"
            >
              <span class="w-[30px] h-[30px] rounded-full inline-flex items-center justify-center text-[11px] font-bold shrink-0" :style="{ background: m.avatarBg, color: m.avatarText }">{{ initialsOf(m.name) }}</span>
              <span class="min-w-0"><span class="block text-[14px] font-semibold text-[var(--brand-text)]">{{ m.name }}</span><span class="block text-[12.5px] text-[var(--brand-text-quiet)] truncate">{{ m.email }}</span></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
