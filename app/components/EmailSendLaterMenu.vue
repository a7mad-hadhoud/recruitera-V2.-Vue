<!--
  "Send later" split-button for the email composer footer. Opens a popover with
  quick presets (Tomorrow morning / afternoon, and the next weekday morning)
  plus a "Schedule ›" drill-in that offers a Date calendar and a Time input,
  headed by the viewer's resolved timezone. Emits `schedule(Date)` with the
  chosen send time (visual only until a scheduled-send endpoint exists).
-->
<script setup lang="ts">
import { Calendar, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { BrandButton } from '~/components/brand'

const props = withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ schedule: [when: Date] }>()

const open = ref(false)
watch(() => props.disabled, (d) => { if (d) open.value = false })
const view = ref<'root' | 'schedule'>('root')
const mode = ref<'date' | 'time'>('date')
watch(open, (v) => { if (!v) { view.value = 'root'; mode.value = 'date' } })

const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MON_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Timezone header, e.g. "(GMT+03:00) Africa/Cairo"
const tzLabel = computed(() => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const off = -new Date().getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  const oh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0')
  const om = String(Math.abs(off) % 60).padStart(2, '0')
  return `(GMT${sign}${oh}:${om}) ${tz}`
})

function fmt(d: Date) {
  const h = d.getHours()
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${MON_ABBR[d.getMonth()]} ${h}:${mm}`
}

// Quick presets
const now = new Date()
function preset(daysAhead: number, h: number, m: number) {
  const d = new Date(now)
  d.setDate(now.getDate() + daysAhead)
  d.setHours(h, m, 0, 0)
  return d
}
const quick = computed(() => {
  const twoDays = preset(2, 9, 5)
  return [
    { label: 'Tomorrow morning', when: preset(1, 9, 5) },
    { label: 'Tomorrow afternoon', when: preset(1, 16, 5) },
    { label: `${WEEKDAY[twoDays.getDay()]} morning`, when: twoDays },
  ]
})
function pick(when: Date) { emit('schedule', when); open.value = false }

// Calendar
const cal = ref(new Date(now.getFullYear(), now.getMonth(), 1))
const selDate = ref(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
const timeStr = ref(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
const today = new Date(); today.setHours(0, 0, 0, 0)

const grid = computed(() => {
  const y = cal.value.getFullYear(); const m = cal.value.getMonth()
  const first = (new Date(y, m, 1).getDay() + 6) % 7 // Monday-first
  const days = new Date(y, m + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d))
  return cells
})
function shiftMonth(n: number) { cal.value = new Date(cal.value.getFullYear(), cal.value.getMonth() + n, 1) }
function isSel(d: Date) { return d.getTime() === new Date(selDate.value.getFullYear(), selDate.value.getMonth(), selDate.value.getDate()).getTime() }
function isPast(d: Date) { return d < today }
function pickDay(d: Date) { if (!isPast(d)) selDate.value = d }

function confirmSchedule() {
  const [h, m] = timeStr.value.split(':').map(Number)
  const when = new Date(selDate.value)
  when.setHours(h || 9, m || 0, 0, 0)
  emit('schedule', when)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button type="button" :disabled="disabled" class="inline-flex items-center gap-1 text-[13.5px] font-semibold text-[var(--brand-text-secondary)] border border-[var(--brand-border)] rounded-[9px] px-3 py-1.5 outline-none cursor-pointer hover:bg-[var(--brand-surface-hover)] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-transparent">
        Send later<ChevronDown class="w-3 h-3 transition-transform" :class="{ 'rotate-180': open }" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-[300px] p-0 rounded-[14px] overflow-hidden">
      <!-- Root: timezone + quick presets -->
      <template v-if="view === 'root'">
        <div class="text-center text-[14px] font-bold text-[var(--brand-text)] px-4 py-3 border-b border-[var(--brand-border-hairline)] bg-[var(--brand-surface-hover)]">{{ tzLabel }}</div>
        <button
          v-for="q in quick"
          :key="q.label"
          type="button"
          class="w-full text-left px-4 py-3 border-b border-[var(--brand-border-hairline)] hover:bg-[var(--brand-surface-hover)] cursor-pointer"
          @click="pick(q.when)"
        >
          <span class="block text-[14px] font-bold text-[var(--brand-text)]">{{ q.label }}</span>
          <span class="block text-[13.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ fmt(q.when) }}</span>
        </button>
        <button type="button" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left" @click="view = 'schedule'">
          <Calendar class="w-[18px] h-[18px] text-[var(--brand-text-secondary)] shrink-0" stroke-width="1.8" />
          <span class="flex-1 text-[14px] font-semibold text-[var(--brand-text)]">Schedule</span>
          <ChevronRight class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" />
        </button>
      </template>

      <!-- Schedule: Date / Time picker -->
      <template v-else>
        <div class="flex items-center gap-2 px-4 py-3 border-b border-[var(--brand-border-hairline)]">
          <button type="button" class="text-[var(--brand-text-secondary)] cursor-pointer" @click="view = 'root'"><ChevronLeft class="w-4 h-4" /></button>
          <span class="flex-1 text-center text-[15px] font-bold text-[var(--brand-text)]">Schedule</span>
          <span class="w-4" />
        </div>
        <div class="p-3.5">
          <div class="inline-flex w-full bg-[var(--brand-surface-hover)] rounded-[9px] p-[3px] mb-3.5">
            <button
              v-for="mo in (['date', 'time'] as const)"
              :key="mo"
              type="button"
              class="flex-1 text-[13.5px] font-semibold py-1.5 rounded-lg capitalize cursor-pointer"
              :class="mode === mo ? 'bg-[var(--brand-surface-white)] text-[var(--brand-teal)] shadow-[0_1px_2px_rgba(0,20,18,0.08)]' : 'text-[var(--brand-text-secondary)]'"
              @click="mode = mo"
            >{{ mo }}</button>
          </div>

          <div v-if="mode === 'date'">
            <div class="flex items-center justify-between mb-2">
              <button type="button" class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="shiftMonth(-1)"><ChevronLeft class="w-4 h-4" /></button>
              <span class="text-[14px] font-bold text-[var(--brand-text)]">{{ MON[cal.getMonth()] }}, {{ cal.getFullYear() }}</span>
              <button type="button" class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="shiftMonth(1)"><ChevronRight class="w-4 h-4" /></button>
            </div>
            <div class="grid grid-cols-7 gap-0.5 mb-1">
              <div v-for="d in WEEK" :key="d" class="text-center text-[11px] font-bold text-[var(--brand-text-quiet)] py-1">{{ d }}</div>
            </div>
            <div class="grid grid-cols-7 gap-0.5">
              <template v-for="(c, i) in grid" :key="i">
                <span v-if="!c" />
                <button
                  v-else
                  type="button"
                  class="h-8 rounded-full text-[13px] cursor-pointer"
                  :class="isSel(c) ? 'bg-[var(--brand-teal)] text-white font-bold' : isPast(c) ? 'text-[var(--brand-text-faint)] cursor-default' : 'text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)]'"
                  :disabled="isPast(c)"
                  @click="pickDay(c)"
                >{{ c.getDate() }}</button>
              </template>
            </div>
          </div>

          <div v-else>
            <input v-model="timeStr" type="time" class="w-full box-border border border-[var(--brand-border)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--brand-text)] outline-none focus:border-[var(--brand-lime)]">
            <div class="text-[13px] text-[var(--brand-text-quiet)] mt-3">{{ tzLabel }}</div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-4">
            <button type="button" class="text-[13.5px] font-semibold text-[var(--brand-text-secondary)] cursor-pointer" @click="open = false">Cancel</button>
            <BrandButton variant="primary-teal" size="sm" @click="confirmSchedule">Schedule</BrandButton>
          </div>
        </div>
      </template>
    </PopoverContent>
  </Popover>
</template>
