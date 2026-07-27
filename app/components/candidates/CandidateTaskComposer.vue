<!--
  Tasks card composer. Collapsed it's a single "Add a task…" input; on focus
  it expands to reveal a due-date picker (Date calendar / Relative "in N days"),
  an assignee avatar, and Cancel / Add. Emits `add({ title, dueLabel })`;
  the parent owns the task list (client-only until a write endpoint exists).
-->
<script setup lang="ts">
import { Clock, Plus } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'

const props = defineProps<{ ownerInitials: string }>()
const emit = defineEmits<{ add: [payload: { title: string, dueLabel: string | null }] }>()

const title = ref('')
const expanded = ref(false)
const dueLabel = ref<string | null>(null)

// Due-date popover
const dueOpen = ref(false)
const dueMode = ref<'date' | 'relative'>('date')
const relDays = ref(7)

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MON_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const today = new Date(); today.setHours(0, 0, 0, 0)
const view = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selected = ref<Date | null>(null)

const grid = computed(() => {
  const y = view.value.getFullYear(); const m = view.value.getMonth()
  const first = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d))
  return cells
})
function shiftMonth(n: number) { view.value = new Date(view.value.getFullYear(), view.value.getMonth() + n, 1) }
function isPast(d: Date) { return d < today }
function isSel(d: Date) { return selected.value && d.getTime() === selected.value.getTime() }
function pickDay(d: Date) {
  if (isPast(d)) return
  selected.value = d
  dueLabel.value = `${MON_ABBR[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  dueOpen.value = false
}
function applyRelative() {
  const n = Math.max(1, Number(relDays.value) || 1)
  dueLabel.value = `In ${n} day${n === 1 ? '' : 's'}`
  dueOpen.value = false
}

function submit() {
  if (!title.value.trim()) return
  emit('add', { title: title.value.trim(), dueLabel: dueLabel.value })
  title.value = ''; dueLabel.value = null; selected.value = null; expanded.value = false
}
function cancel() { title.value = ''; dueLabel.value = null; selected.value = null; expanded.value = false }
</script>

<template>
  <div
    class="border-[1.6px] rounded-[10px] mb-3.5 transition-colors"
    :class="expanded ? 'border-[var(--brand-lime)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand-lime)_25%,transparent)]' : 'border-[var(--brand-border)]'"
  >
    <input
      v-model="title"
      type="text"
      placeholder="Add a task…"
      class="w-full box-border border-none outline-none bg-transparent px-3 py-2.5 text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]"
      @focus="expanded = true"
      @keydown.enter="submit"
    >
    <div v-if="expanded">
      <div class="h-px bg-[var(--brand-border-hairline)] mx-2" />
      <div class="flex items-center justify-between gap-2.5 px-2 py-2.5">
        <Popover v-model:open="dueOpen">
          <PopoverTrigger as-child>
            <button type="button" class="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--brand-text-secondary)] cursor-pointer">
              <Clock class="w-[17px] h-[17px] text-[var(--brand-icon-default)]" stroke-width="1.7" />{{ dueLabel ?? 'Set due date' }}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-[300px] p-[18px] rounded-2xl">
            <div class="flex gap-7 items-center pb-3.5 border-b border-[var(--brand-border-hairline)] mb-3.5">
              <button
                v-for="mode in (['date', 'relative'] as const)"
                :key="mode"
                type="button"
                class="flex items-center gap-2.5 cursor-pointer"
                @click="dueMode = mode"
              >
                <span class="w-[18px] h-[18px] rounded-full border-2 border-[var(--brand-teal)] inline-flex items-center justify-center shrink-0"><span v-if="dueMode === mode" class="w-2.5 h-2.5 rounded-full bg-[var(--brand-teal)]" /></span>
                <span class="text-[14px] font-semibold text-[var(--brand-text)] capitalize">{{ mode }}</span>
              </button>
            </div>

            <div v-if="dueMode === 'date'">
              <div class="flex items-center justify-between mb-2.5">
                <button type="button" class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="shiftMonth(-1)">‹</button>
                <span class="text-[15px] font-bold text-[var(--brand-text)]">{{ MONTHS[view.getMonth()] }} {{ view.getFullYear() }}</span>
                <button type="button" class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="shiftMonth(1)">›</button>
              </div>
              <div class="grid grid-cols-7 gap-0.5 mb-1">
                <div v-for="d in WEEK" :key="d" class="text-center text-[11px] font-bold text-[var(--brand-text-quiet)] py-1">{{ d }}</div>
              </div>
              <div class="grid grid-cols-7 gap-0.5">
                <template v-for="(cell, i) in grid" :key="i">
                  <span v-if="!cell" />
                  <button
                    v-else
                    type="button"
                    class="h-8 rounded-lg text-[13px] cursor-pointer"
                    :class="isSel(cell)
                      ? 'bg-[var(--brand-teal)] text-white font-bold'
                      : isPast(cell) ? 'text-[var(--brand-text-faint)] cursor-default' : 'text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)]'"
                    :disabled="isPast(cell)"
                    @click="pickDay(cell)"
                  >{{ cell.getDate() }}</button>
                </template>
              </div>
            </div>

            <div v-else>
              <div class="flex items-center gap-3.5 mb-3.5">
                <input v-model.number="relDays" type="number" min="1" class="w-[78px] box-border text-center bg-[var(--brand-surface-hover)] border-[1.6px] border-transparent rounded-[9px] px-3 py-2.5 text-[14px] font-bold text-[var(--brand-text)] outline-none focus:border-[var(--brand-lime)]">
                <span class="text-[14px] font-bold text-[var(--brand-text)]">days</span>
              </div>
              <BrandButton variant="primary-teal" size="md" class="w-full justify-center" @click="applyRelative">Done</BrandButton>
            </div>
          </PopoverContent>
        </Popover>
        <BrandAvatarInitials :initials="ownerInitials" size="xs" />
      </div>
      <div class="flex items-center justify-end gap-2 px-2 pb-2">
        <BrandButton variant="ghost" size="sm" @click="cancel">Cancel</BrandButton>
        <BrandButton variant="primary-teal" size="sm" :class="{ 'opacity-50 pointer-events-none': !title.trim() }" @click="submit">
          <Plus class="w-3.5 h-3.5" stroke-width="2" />Add
        </BrandButton>
      </div>
    </div>
  </div>
</template>
