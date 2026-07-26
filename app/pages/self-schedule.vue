<!--
  Candidate-facing self-scheduling page — the public screen a candidate sees
  when they open an Event scheduler link (previewed from the ↗ button on the
  Event scheduler table). A blend of the Calendly + Recruitee flows:
    · left panel  — event details (organizer, event name, duration, location, tz)
    · right panel — Select date → pick time → Enter details → Confirmed
  Branded per company via useCompany() (logo/name is the hero), with a neutral
  "Powered by Recruitera" footer. Standalone layout (no app chrome).
  Brand --brand-* tokens only.
-->
<script setup lang="ts">
import { Clock, Video, Globe, ChevronLeft, ChevronRight, ArrowLeft, Check, Plus } from 'lucide-vue-next'
import { useCompany } from '~/composables/useCompany'

definePageMeta({ layout: false })

const route = useRoute()
const { data: company } = useCompany()

// ── Per-company branding ───────────────────────────────────────
// The page themes to the hiring company: its logo/name is the hero and its
// brand colour drives the accent (selected date, buttons, links). Preview a
// specific brand with ?brand=<key>; otherwise it falls back to the logged-in
// company from useCompany(). "Powered by Recruitera" stays regardless.
interface Brand { name: string; accent: string; wordmark?: string }
const BRANDS: Record<string, Brand> = {
  paymob: { name: 'Paymob', accent: '#0A6CFF', wordmark: 'paymob' },
  recruitera: { name: 'Recruitera', accent: 'var(--brand-teal)' },
}
const brandKey = computed(() => String(route.query.brand || '').toLowerCase())
const brand = computed<Brand | null>(() => BRANDS[brandKey.value] ?? null)

const companyName = computed(() => brand.value?.name || company.value?.name || 'Recruitera')
const companyLogo = computed(() => (brand.value ? null : company.value?.logoUrl) || null)
const wordmark = computed(() => brand.value?.wordmark || null)
const accent = computed(() => brand.value?.accent || 'var(--brand-teal)')

// Link details (previewable via query, e.g. ?name=Phone%20screen&duration=30)
const eventName = computed(() => String(route.query.name || 'Interview'))
const durationMin = computed(() => Number(route.query.duration || 30))
const organizer = computed(() => String(route.query.organizer || 'Recruiting Team'))
const TZ_LABEL = '(GMT+03:00) Africa/Cairo'

type Step = 'date' | 'time' | 'details' | 'done'
const step = ref<Step>('date')

// ── Month calendar ─────────────────────────────────────────────
const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())
const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
)
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
const cells = computed(() => {
  const y = viewYear.value; const m = viewMonth.value
  const firstDow = new Date(y, m, 1).getDay() // Sunday-first (Calendly)
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const out: Array<{ day: number | null; date?: Date; selectable?: boolean; today?: boolean }> = []
  for (let i = 0; i < firstDow; i++) out.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d)
    const past = date < new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekend = date.getDay() === 0 || date.getDay() === 6
    out.push({ day: d, date, selectable: !past && !weekend, today: `${y}-${m}-${d}` === todayKey })
  }
  return out
})
function prevMonth() { if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- } else viewMonth.value-- }
function nextMonth() { if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ } else viewMonth.value++ }

const selectedDate = ref<Date | null>(null)
const selectedDateKey = computed(() => selectedDate.value ? `${selectedDate.value.getFullYear()}-${selectedDate.value.getMonth()}-${selectedDate.value.getDate()}` : '')
function pickDate(c: { date?: Date; selectable?: boolean }) {
  if (!c.selectable || !c.date) return
  selectedDate.value = c.date
  selectedTime.value = ''
  step.value = 'time'
}
const selectedDateLabel = computed(() =>
  selectedDate.value ? selectedDate.value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '',
)

// ── Time slots ─────────────────────────────────────────────────
const TIME_SLOTS = ['10:00am', '10:30am', '11:00am', '12:00pm', '12:30pm', '2:00pm', '2:30pm', '3:00pm']
const selectedTime = ref('')
function pickTime(t: string) { selectedTime.value = t }
function confirmTime() { if (selectedTime.value) step.value = 'details' }

// ── Details form ───────────────────────────────────────────────
const form = reactive({ name: '', email: '', notes: '' })
const canSubmit = computed(() => !!form.name.trim() && /.+@.+\..+/.test(form.email))
function submit() { if (canSubmit.value) step.value = 'done' }

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1]![0] : '')).toUpperCase() || 'C'
}
</script>

<template>
  <div class="min-h-screen bg-[var(--brand-canvas)] flex flex-col items-center px-4 py-8" :style="{ '--accent': accent }">
    <!-- Company brand header (logo / wordmark / name) -->
    <div class="flex flex-col items-center gap-2 mb-6">
      <img v-if="companyLogo" :src="companyLogo" :alt="companyName" class="h-9 max-w-[180px] object-contain">
      <span
        v-else-if="wordmark"
        class="lowercase italic font-[900] tracking-[-0.04em] leading-none"
        style="font-family:'Arial Black','Helvetica Neue',sans-serif;font-size:34px;color:var(--accent)"
      >{{ wordmark }}</span>
      <div v-else class="text-[24px] font-extrabold tracking-tight text-[var(--brand-text)]">{{ companyName }}</div>
    </div>

    <!-- Card -->
    <div class="w-full max-w-[980px] bg-[var(--brand-surface-white)] rounded-[18px] border border-[var(--brand-border-light)] shadow-[0_12px_40px_rgba(0,20,18,0.08)] overflow-hidden grid grid-cols-1 md:grid-cols-[minmax(280px,340px)_1fr]">
      <!-- Left: event details -->
      <div class="p-7 md:border-r border-[var(--brand-border-fade)]">
        <button v-if="step === 'details'" type="button" class="w-9 h-9 -ml-1 mb-4 rounded-full inline-flex items-center justify-center text-[var(--accent)] hover:bg-[var(--brand-canvas)] transition" aria-label="Back" @click="step = 'time'">
          <ArrowLeft class="w-5 h-5" stroke-width="2" />
        </button>
        <div class="text-[13px] font-semibold text-[var(--brand-text-muted)] mb-1">{{ organizer }}</div>
        <h1 class="text-[24px] font-bold text-[var(--brand-text)] leading-tight mb-5">{{ eventName }}</h1>
        <div class="flex flex-col gap-3 text-[14px] text-[var(--brand-text-secondary)]">
          <div class="flex items-center gap-2.5"><Clock class="w-[18px] h-[18px] text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.9" /> {{ durationMin }} min</div>
          <div class="flex items-start gap-2.5"><Video class="w-[18px] h-[18px] text-[var(--brand-text-quiet)] shrink-0 mt-0.5" stroke-width="1.9" /> Web conferencing details provided upon confirmation.</div>
          <div v-if="step === 'details' && selectedTime" class="flex items-start gap-2.5 font-semibold text-[var(--brand-text)]">
            <span class="w-[18px] shrink-0" /> {{ selectedTime }} · {{ selectedDateLabel }}, {{ viewYear }}
          </div>
          <div class="flex items-center gap-2.5"><Globe class="w-[18px] h-[18px] text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.9" /> {{ TZ_LABEL }}</div>
        </div>
      </div>

      <!-- Right: stepper -->
      <div class="p-7 min-h-[440px]">
        <!-- Step: date / time -->
        <template v-if="step === 'date' || step === 'time'">
          <h2 class="text-[19px] font-bold text-[var(--brand-text)] mb-5">Select a Date &amp; Time</h2>
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6">
            <div>
              <div class="flex items-center justify-between mb-3">
                <button type="button" class="w-8 h-8 rounded-full inline-flex items-center justify-center text-[var(--accent)] hover:bg-[var(--brand-canvas)] transition" aria-label="Previous month" @click="prevMonth"><ChevronLeft class="w-4 h-4" stroke-width="2.4" /></button>
                <span class="text-[15px] font-bold text-[var(--brand-text)]">{{ monthLabel }}</span>
                <button type="button" class="w-8 h-8 rounded-full inline-flex items-center justify-center text-[var(--accent)] hover:bg-[var(--brand-canvas)] transition" aria-label="Next month" @click="nextMonth"><ChevronRight class="w-4 h-4" stroke-width="2.4" /></button>
              </div>
              <div class="grid grid-cols-7 gap-y-1 text-center">
                <span v-for="w in WEEKDAYS" :key="w" class="text-[12px] font-semibold text-[var(--brand-text-quiet)] pb-2">{{ w }}</span>
                <div v-for="(c, i) in cells" :key="i" class="flex items-center justify-center py-0.5">
                  <button
                    v-if="c.day"
                    type="button"
                    :disabled="!c.selectable"
                    class="w-10 h-10 rounded-full text-[14px] font-semibold inline-flex items-center justify-center transition"
                    :class="selectedDateKey === `${viewYear}-${viewMonth}-${c.day}`
                      ? 'bg-[var(--accent)] text-[var(--brand-avatar-text)]'
                      : c.selectable
                        ? 'text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent) 10%,var(--brand-surface-white))] hover:bg-[color-mix(in_srgb,var(--accent) 16%,var(--brand-surface-white))]'
                        : 'text-[var(--brand-text-faint)] cursor-default'"
                    @click="pickDate(c)"
                  >{{ c.day }}</button>
                </div>
              </div>
              <div class="mt-5">
                <div class="text-[12px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Time zone</div>
                <div class="inline-flex items-center gap-2 text-[13.5px] text-[var(--brand-text)]"><Globe class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.8" /> {{ TZ_LABEL }}</div>
              </div>
            </div>

            <!-- Time column (appears once a day is picked) -->
            <div v-if="step === 'time'" class="sm:w-[220px]">
              <div class="text-[15px] font-semibold text-[var(--brand-text)] mb-3">{{ selectedDateLabel }}</div>
              <div class="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                <template v-for="t in TIME_SLOTS" :key="t">
                  <div v-if="selectedTime === t" class="flex gap-2">
                    <div class="flex-1 h-12 rounded-[10px] bg-[var(--brand-text-secondary)] text-[var(--brand-avatar-text)] text-[14px] font-bold inline-flex items-center justify-center">{{ t }}</div>
                    <button type="button" class="flex-1 h-12 rounded-[10px] bg-[var(--accent)] text-[var(--brand-avatar-text)] text-[14px] font-bold inline-flex items-center justify-center hover:opacity-95 transition" @click="confirmTime">Next</button>
                  </div>
                  <button v-else type="button" class="h-12 rounded-[10px] border-[1.5px] border-[var(--accent)] text-[var(--accent)] text-[14px] font-bold hover:bg-[color-mix(in_srgb,var(--accent) 10%,var(--brand-surface-white))] transition" @click="pickTime(t)">{{ t }}</button>
                </template>
              </div>
            </div>
          </div>
        </template>

        <!-- Step: details -->
        <template v-else-if="step === 'details'">
          <h2 class="text-[19px] font-bold text-[var(--brand-text)] mb-5">Enter Details</h2>
          <div class="flex flex-col gap-4 max-w-[440px]">
            <div>
              <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-1.5">Name <span class="text-[var(--brand-status-closed-text)]">*</span></label>
              <input v-model="form.name" type="text" class="w-full h-11 px-3.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] text-[var(--brand-text)] outline-none focus:border-[var(--accent)] transition">
            </div>
            <div>
              <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-1.5">Email <span class="text-[var(--brand-status-closed-text)]">*</span></label>
              <input v-model="form.email" type="email" class="w-full h-11 px-3.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] text-[var(--brand-text)] outline-none focus:border-[var(--accent)] transition">
            </div>
            <button type="button" class="inline-flex items-center gap-1.5 h-9 px-3 self-start rounded-[9px] border-[1.5px] border-[var(--accent)] text-[13px] font-bold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent) 10%,var(--brand-surface-white))] transition"><Plus class="w-4 h-4" stroke-width="2.2" /> Add guests</button>
            <div>
              <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-1.5">Please share anything that will help prepare for our meeting.</label>
              <textarea v-model="form.notes" rows="3" class="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] text-[var(--brand-text)] outline-none resize-none focus:border-[var(--accent)] transition" />
            </div>
            <p class="text-[12.5px] text-[var(--brand-text-quiet)]">By proceeding, you confirm you have read and agree to <a href="#" class="text-[var(--accent)] font-semibold">Recruitera's Terms</a> and <a href="#" class="text-[var(--accent)] font-semibold">Privacy Notice</a>.</p>
            <button type="button" :disabled="!canSubmit" class="h-11 px-6 self-start rounded-full bg-[var(--accent)] text-[var(--brand-avatar-text)] text-[14px] font-bold hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed" @click="submit">Schedule Event</button>
          </div>
        </template>

        <!-- Step: done -->
        <template v-else>
          <div class="flex flex-col items-center justify-center text-center h-full py-10">
            <div class="w-16 h-16 rounded-full bg-[var(--brand-success)] inline-flex items-center justify-center mb-5"><Check class="w-8 h-8 text-[var(--brand-avatar-text)]" stroke-width="2.5" /></div>
            <h2 class="text-[22px] font-bold text-[var(--brand-text)] mb-2">You're scheduled</h2>
            <p class="text-[14px] text-[var(--brand-text-muted)] max-w-[360px]">A calendar invitation has been sent to <strong class="text-[var(--brand-text)]">{{ form.email }}</strong> for <strong class="text-[var(--brand-text)]">{{ eventName }}</strong> on {{ selectedDateLabel }}, {{ viewYear }} at {{ selectedTime }}.</p>
            <div class="mt-6 flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-[var(--brand-canvas)]">
              <span class="w-8 h-8 rounded-full bg-[var(--brand-avatar-4)] text-[var(--brand-avatar-text)] text-[12px] font-bold inline-flex items-center justify-center">{{ initials(form.name || 'Candidate') }}</span>
              <span class="text-[13.5px] text-[var(--brand-text-secondary)]">{{ form.name }} · {{ selectedTime }}, {{ selectedDateLabel }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Powered by (platform footer, kept even when company-branded) -->
    <div class="mt-8 flex items-center gap-1.5 text-[13px] text-[var(--brand-text-quiet)]">
      Powered by <span class="font-extrabold text-[var(--brand-text-secondary)]">Recruitera</span>
    </div>
  </div>
</template>
