<!--
  "New event scheduler link" dialog — self-scheduling link setup opened from
  the Calendar / Event scheduler page. Ports Recruitee's
  rt-schedule-link-manage-dialog into our design system (brand tokens, shadcn
  Dialog, brand primitives). Interviewers come from useTeamMembers(); the
  weekly availability, event details, reminders and privacy settings mirror
  the reference 1:1. Emits `create` with the assembled payload.
-->
<script setup lang="ts">
import {
  X, HelpCircle, Plus, Check, Lightbulb, MapPin, Phone, Video, Users, CalendarPlus, AlignLeft,
} from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { BrandButton, BrandLimeCheckbox, BrandAvatarInitials } from '~/components/brand'
import SchedulerSelect from './SchedulerSelect.vue'
import { useTeamMembers } from '~/composables/useTeam'
import { useCompany } from '~/composables/useCompany'
import type { TeamMember } from '~/types'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ create: [payload: Record<string, unknown>] }>()

const { data: teamData } = useTeamMembers()
const roster = computed<TeamMember[]>(() => teamData.value?.data ?? [])
const { data: company } = useCompany()

function initialsFor(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1]![0] : '')).toUpperCase() || '?'
}

// ── Option sets ────────────────────────────────────────────────
const TIME_OPTIONS = (() => {
  const out: { value: string; label: string }[] = []
  for (let h = 0; h < 24; h++) for (const m of [0, 30]) {
    const v = `${h}:${String(m).padStart(2, '0')}`
    out.push({ value: v, label: v })
  }
  return out
})()
const DATE_RANGE_OPTIONS = [7, 14, 20, 30, 60, 90].map(d => ({ value: String(d), label: `${d} days` }))
const EXPIRES_OPTIONS = [
  { value: '7', label: '7 days' }, { value: '10', label: '10 days' }, { value: '14', label: '14 days' },
  { value: '30', label: '30 days' }, { value: '60', label: '60 days' }, { value: '0', label: 'No expiry' },
]
const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' }, { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' }, { value: '90', label: '1 hour 30 minutes' }, { value: '120', label: '2 hours' },
]
const SLOT_INTERVAL_OPTIONS = [
  { value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' }, { value: '60', label: '1 hour' },
]
const EVENT_TYPE_OPTIONS = [
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'in_person', label: 'In person', icon: MapPin },
  { value: 'phone', label: 'Phone call', icon: Phone },
  { value: 'google_meet', label: 'Google Meet', icon: Video },
  { value: 'zoom', label: 'Zoom', icon: Video },
  { value: 'teams', label: 'Microsoft Teams', icon: Video },
]
const EVENT_NAME_DEFAULT = '[candidate.full] - Interview with [company]'
const TIMEZONE_OPTIONS = [
  { value: 'Africa/Cairo', label: '(GMT+03:00) Africa/Cairo' },
  { value: 'Europe/London', label: '(GMT+00:00) Europe/London' },
  { value: 'Europe/Amsterdam', label: '(GMT+01:00) Europe/Amsterdam' },
  { value: 'America/New_York', label: '(GMT-05:00) America/New York' },
]

// ── Form state ─────────────────────────────────────────────────
const linkName = ref('')
const dateRange = ref('20')
const expires = ref('10')

const inviteMode = ref<'all' | 'first'>('all')

interface Slot { start: string; end: string }
interface DayAvailability { day: string; enabled: boolean; slots: Slot[] }
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const availability = ref<DayAvailability[]>(
  DAY_NAMES.map((day, i) => ({
    day,
    enabled: i < 5,
    slots: i < 5 ? [{ start: '9:00', end: '16:00' }] : [],
  })),
)
function toggleDay(d: DayAvailability) {
  d.enabled = !d.enabled
  if (d.enabled && !d.slots.length) d.slots = [{ start: '9:00', end: '16:00' }]
}
function addSlot(d: DayAvailability) {
  d.slots.push({ start: '9:00', end: '16:00' })
}
function removeSlot(d: DayAvailability, idx: number) {
  d.slots.splice(idx, 1)
  if (!d.slots.length) d.enabled = false
}

// Interviewers (tabs) — default to the first roster member (current user).
const interviewerIds = ref<string[]>([])
const activeInterviewerId = ref<string>('')
watch(roster, (r) => {
  if (r.length && !interviewerIds.value.length) {
    interviewerIds.value = [r[0]!.id]
    activeInterviewerId.value = r[0]!.id
    if (!organizerId.value) organizerId.value = r[0]!.id
  }
}, { immediate: true })
const interviewers = computed(() => roster.value.filter(m => interviewerIds.value.includes(m.id)))
const availableInterviewers = computed(() => roster.value.filter(m => !interviewerIds.value.includes(m.id)))
function addInterviewer(id: string) {
  if (!interviewerIds.value.includes(id)) interviewerIds.value = [...interviewerIds.value, id]
  activeInterviewerId.value = id
}
function removeInterviewer(id: string) {
  interviewerIds.value = interviewerIds.value.filter(x => x !== id)
  if (activeInterviewerId.value === id) activeInterviewerId.value = interviewerIds.value[0] ?? ''
}
const activeInterviewer = computed(() => roster.value.find(m => m.id === activeInterviewerId.value))
const missingCalendarNames = computed(() => interviewers.value.map(m => m.name).join(', '))

const showCalendarPromo = ref(true)
const showMissingCalendarInfo = ref(true)

// Availability settings
const bufferTime = ref(false)
const ignoreAllDay = ref(true)
const limitMeetings = ref(false)
const allowReschedule = ref(true)

// Event details
const eventName = ref(EVENT_NAME_DEFAULT)
const eventDuration = ref('30')
const slotInterval = ref('30')
const eventType = ref('meeting')
const eventTimezone = ref('Africa/Cairo')
const organizerId = ref('')
const location = ref('')
const note = ref('')
const showPrivateNote = ref(false)
const privateNote = ref('')

// Reminders + privacy
const remindCandidate = ref(false)
const makePrivate = ref(false)
const hideName = ref(false)
const excludeCandidate = ref(false)

const organizer = computed(() => roster.value.find(m => m.id === organizerId.value))
const userTimezoneLabel = computed(() =>
  TIMEZONE_OPTIONS.find(t => t.value === eventTimezone.value)?.label ?? '(GMT+03:00) Africa/Cairo',
)

const canCreate = computed(() => linkName.value.trim().length > 0)

function reset() {
  linkName.value = ''
  dateRange.value = '20'
  expires.value = '10'
  inviteMode.value = 'all'
  availability.value = DAY_NAMES.map((day, i) => ({ day, enabled: i < 5, slots: i < 5 ? [{ start: '9:00', end: '16:00' }] : [] }))
  showCalendarPromo.value = true
  showMissingCalendarInfo.value = true
  bufferTime.value = false; ignoreAllDay.value = true; limitMeetings.value = false; allowReschedule.value = true
  eventName.value = EVENT_NAME_DEFAULT; eventDuration.value = '30'; slotInterval.value = '30'; eventType.value = 'meeting'
  eventTimezone.value = 'Africa/Cairo'; location.value = ''; note.value = ''
  showPrivateNote.value = false; privateNote.value = ''
  remindCandidate.value = false; makePrivate.value = false; hideName.value = false; excludeCandidate.value = false
}
watch(open, (v) => { if (v) reset() })

function onCreate() {
  if (!canCreate.value) return
  emit('create', {
    name: linkName.value.trim(),
    dateRangeDays: Number(dateRange.value),
    expiresDays: Number(expires.value),
    inviteMode: inviteMode.value,
    interviewerIds: interviewerIds.value,
    availability: availability.value,
    settings: { bufferTime: bufferTime.value, ignoreAllDay: ignoreAllDay.value, limitMeetings: limitMeetings.value, allowReschedule: allowReschedule.value },
    event: { name: eventName.value, durationMin: Number(eventDuration.value), slotIntervalMin: Number(slotInterval.value), type: eventType.value, timezone: eventTimezone.value, organizerId: organizerId.value, location: location.value, note: note.value, privateNote: showPrivateNote.value ? privateNote.value : '' },
    reminders: { remindCandidate: remindCandidate.value },
    privacy: { makePrivate: makePrivate.value, hideName: hideName.value, excludeCandidate: excludeCandidate.value },
  })
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-0 rounded-[18px] !max-w-[820px] sm:!max-w-[820px] w-[95vw] max-h-[90vh] flex flex-col shadow-[0_28px_72px_rgba(0,20,18,0.24)] bg-white overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 px-7 h-[64px] shrink-0 border-b border-[var(--brand-border-fade)]">
        <DialogTitle class="flex-1 text-[19px] font-bold text-[var(--brand-text)]">
          <span class="font-medium text-[var(--brand-text-quiet)]">New</span> event scheduler link
        </DialogTitle>
        <button type="button" class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition" aria-label="Close" @click="open = false">
          <X class="w-5 h-5" stroke-width="2" />
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="flex-1 overflow-y-auto px-7 py-6">
        <!-- Row: name / date range / expires -->
        <div class="grid grid-cols-[1.4fr_1fr_1fr] gap-3 items-start">
          <div>
            <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
              Link name <span class="text-[var(--brand-status-closed-text)]">*</span>
            </label>
            <input
              v-model="linkName"
              type="text"
              class="w-full h-10 px-3 rounded-[10px] border border-[var(--brand-border)] bg-white text-[14px] text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
            >
          </div>
          <div>
            <label class="flex items-center gap-1 text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
              Date range <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
            <SchedulerSelect v-model="dateRange" :options="DATE_RANGE_OPTIONS" />
          </div>
          <div>
            <label class="flex items-center gap-1 text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
              Expires after <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
            <SchedulerSelect v-model="expires" :options="EXPIRES_OPTIONS" />
          </div>
        </div>

        <div class="h-px bg-[var(--brand-border-fade)] my-6" />

        <!-- Interviewers -->
        <div class="flex items-center justify-between gap-3 mb-3">
          <label class="text-[14px] font-bold text-[var(--brand-text)]">Interviewers</label>
          <div class="inline-flex items-center gap-5">
            <button type="button" class="inline-flex items-center gap-2 group" @click="inviteMode = 'all'">
              <span
                class="w-[18px] h-[18px] rounded-full border-2 inline-flex items-center justify-center transition"
                :class="inviteMode === 'all' ? 'border-[var(--brand-teal)]' : 'border-[var(--brand-border-mid)] group-hover:border-[var(--brand-text-quiet)]'"
              >
                <span v-if="inviteMode === 'all'" class="w-2.5 h-2.5 rounded-full bg-[var(--brand-teal)]" />
              </span>
              <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">Invite all</span>
            </button>
            <button type="button" class="inline-flex items-center gap-2 group" @click="inviteMode = 'first'">
              <span
                class="w-[18px] h-[18px] rounded-full border-2 inline-flex items-center justify-center transition"
                :class="inviteMode === 'first' ? 'border-[var(--brand-teal)]' : 'border-[var(--brand-border-mid)] group-hover:border-[var(--brand-text-quiet)]'"
              >
                <span v-if="inviteMode === 'first'" class="w-2.5 h-2.5 rounded-full bg-[var(--brand-teal)]" />
              </span>
              <span class="text-[13.5px]" :class="inviteMode === 'first' ? 'font-semibold text-[var(--brand-text)]' : 'text-[var(--brand-text-muted)]'">Only the first available</span>
            </button>
            <HelpCircle class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
          </div>
        </div>

        <!-- Interviewer tabs -->
        <div class="flex items-center gap-6 border-b border-[var(--brand-border-fade)] mb-4">
          <button
            v-for="m in interviewers"
            :key="m.id"
            type="button"
            class="group inline-flex items-center gap-2 pb-2.5 -mb-px border-b-2 transition"
            :class="m.id === activeInterviewerId
              ? 'border-[var(--brand-teal)]'
              : 'border-transparent hover:border-[var(--brand-border-mid)]'"
            @click="activeInterviewerId = m.id"
          >
            <BrandAvatarInitials :initials="initialsFor(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="md" />
            <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ m.name }}</span>
            <span
              v-if="interviewers.length > 1"
              class="w-4 h-4 rounded-full inline-flex items-center justify-center text-[var(--brand-text-quiet)] opacity-0 group-hover:opacity-100 hover:bg-[var(--brand-canvas)] transition"
              @click.stop="removeInterviewer(m.id)"
            ><X class="w-3 h-3" stroke-width="2.5" /></span>
          </button>
          <DropdownMenu v-if="availableInterviewers.length">
            <DropdownMenuTrigger as-child>
              <button type="button" class="inline-flex items-center gap-1.5 pb-2.5 text-[13.5px] font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)] transition">
                Add interviewer <Plus class="w-4 h-4" stroke-width="2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-[240px] p-1.5 rounded-[12px]">
              <DropdownMenuItem v-for="m in availableInterviewers" :key="m.id" class="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] cursor-pointer" @select="addInterviewer(m.id)">
                <BrandAvatarInitials :initials="initialsFor(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="md" />
                <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ m.name }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Availability -->
        <div class="rounded-[12px] border border-[var(--brand-border-fade)] overflow-hidden">
          <div class="px-4 py-4 flex flex-col gap-3">
            <div v-for="d in availability" :key="d.day" class="flex items-start gap-3">
              <button
                type="button"
                class="flex items-center gap-2.5 w-[120px] shrink-0 pt-1.5"
                @click="toggleDay(d)"
              >
                <span
                  class="w-[18px] h-[18px] rounded-[5px] border-[1.6px] inline-flex items-center justify-center shrink-0 transition"
                  :class="d.enabled ? 'bg-[var(--brand-lime)] border-[var(--brand-lime)] text-[var(--brand-olive)]' : 'bg-white border-[var(--brand-border-mid)]'"
                >
                  <Check v-if="d.enabled" class="w-3 h-3" stroke-width="3" />
                </span>
                <span class="text-[13.5px]" :class="d.enabled ? 'font-bold text-[var(--brand-text)]' : 'text-[var(--brand-text-quiet)]'">{{ d.day }}</span>
              </button>

              <div v-if="d.enabled && d.slots.length" class="flex-1 flex flex-col gap-2">
                <div v-for="(s, i) in d.slots" :key="i" class="flex items-center gap-2">
                  <div class="w-[110px]"><SchedulerSelect v-model="s.start" :options="TIME_OPTIONS" /></div>
                  <span class="text-[13px] text-[var(--brand-text-quiet)]">to</span>
                  <div class="w-[110px]"><SchedulerSelect v-model="s.end" :options="TIME_OPTIONS" /></div>
                  <button type="button" class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition" aria-label="Add time slot" @click="addSlot(d)">
                    <Plus class="w-4 h-4" stroke-width="2" />
                  </button>
                  <button v-if="d.slots.length > 1" type="button" class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-danger)] transition" aria-label="Remove time slot" @click="removeSlot(d, i)">
                    <X class="w-4 h-4" stroke-width="2" />
                  </button>
                </div>
              </div>
              <div v-else class="flex-1 pt-2 text-[13px] text-[var(--brand-text-quiet)]">Unavailable</div>
            </div>
          </div>

          <!-- Connect calendar promo -->
          <div v-if="showCalendarPromo" class="relative mx-4 mb-4 rounded-[12px] border border-[var(--brand-border-fade)] bg-[var(--brand-lime-tint)] px-4 py-3.5">
            <button type="button" class="absolute top-2.5 right-2.5 w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-white transition" aria-label="Dismiss" @click="showCalendarPromo = false">
              <X class="w-4 h-4" stroke-width="2" />
            </button>
            <div class="text-[13.5px] font-bold text-[var(--brand-text)] mb-0.5">Connect your calendar</div>
            <div class="text-[13px] text-[var(--brand-text-muted)] mb-3">Enhance your scheduling productivity.</div>
            <div class="flex items-center gap-2">
              <button type="button" class="inline-flex items-center gap-2 h-9 px-3 rounded-[9px] border border-[var(--brand-border)] bg-white text-[13px] font-semibold text-[var(--brand-text)] hover:border-[var(--brand-teal)] transition">
                <CalendarPlus class="w-4 h-4 text-[var(--brand-teal-secondary)]" stroke-width="1.8" /> Google (Calendar)
              </button>
              <button type="button" class="inline-flex items-center gap-2 h-9 px-3 rounded-[9px] border border-[var(--brand-border)] bg-white text-[13px] font-semibold text-[var(--brand-text)] hover:border-[var(--brand-teal)] transition">
                <CalendarPlus class="w-4 h-4 text-[var(--brand-teal-secondary)]" stroke-width="1.8" /> Microsoft (Outlook/Exchange)
              </button>
            </div>
          </div>

          <!-- Timezone footer -->
          <div class="border-t border-[var(--brand-border-fade)] px-4 py-2.5">
            <span class="text-[12.5px] text-[var(--brand-text-muted)]">
              <span v-if="activeInterviewer">{{ activeInterviewer.name }} time zone is </span>{{ userTimezoneLabel }}
            </span>
          </div>
        </div>

        <!-- Missing-calendar info -->
        <div v-if="showMissingCalendarInfo" class="mt-4 flex gap-3 rounded-[12px] border border-[var(--brand-border-fade)] bg-[var(--brand-canvas)] px-4 py-3.5">
          <HelpCircle class="w-5 h-5 text-[var(--brand-teal-secondary)] shrink-0 mt-0.5" stroke-width="1.8" />
          <div class="flex-1 min-w-0">
            <div class="text-[13.5px] font-bold text-[var(--brand-text)] mb-0.5">Some interviewers haven’t connected their calendars</div>
            <div class="text-[13px] text-[var(--brand-text-muted)]">Scheduling is easier when all interviewers sync their calendars with Recruitera.</div>
            <div class="mt-1.5 text-[12.5px] text-[var(--brand-text-quiet)] border-l-2 border-[var(--brand-border)] pl-2.5">Missing calendars: {{ missingCalendarNames || '—' }}</div>
          </div>
          <button type="button" class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-white transition self-start" aria-label="Dismiss" @click="showMissingCalendarInfo = false">
            <X class="w-4 h-4" stroke-width="2" />
          </button>
        </div>

        <!-- Availability settings -->
        <div class="mt-5">
          <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2.5">Availability settings</label>
          <div class="grid grid-cols-2 gap-x-8 gap-y-2.5">
            <label class="flex items-center gap-2.5 cursor-pointer">
              <BrandLimeCheckbox v-model="bufferTime" />
              <span class="text-[13.5px] text-[var(--brand-text)]">Add buffer time</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer">
              <BrandLimeCheckbox v-model="ignoreAllDay" />
              <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">Ignore all-day events</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer">
              <BrandLimeCheckbox v-model="limitMeetings" />
              <span class="text-[13.5px] text-[var(--brand-text)]">Limit the number of meetings</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer">
              <BrandLimeCheckbox v-model="allowReschedule" />
              <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">Allow rescheduling</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
          </div>
        </div>

        <div class="h-px bg-[var(--brand-border-fade)] my-6" />

        <!-- Event name -->
        <div>
          <label class="flex items-center gap-2 text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
            Event name
            <span class="inline-flex items-center px-1.5 h-[17px] rounded-[4px] text-[10px] font-bold uppercase tracking-wide text-white" style="background:linear-gradient(90deg,#b45cc9,#8b3fb0)">New</span>
          </label>
          <input
            v-model="eventName"
            type="text"
            class="w-full h-10 px-3 rounded-[10px] border border-[var(--brand-border)] bg-white text-[14px] text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
          >
          <div class="flex items-start gap-1.5 mt-1.5">
            <Lightbulb class="w-3.5 h-3.5 text-[var(--brand-warning)] shrink-0 mt-0.5" stroke-width="1.8" />
            <span class="text-[12px] text-[var(--brand-text-quiet)]">You can use placeholders (e.g., [candidate.first]) to personalize the event name.</span>
          </div>
        </div>

        <!-- Duration / slot interval -->
        <div class="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Event duration</label>
            <SchedulerSelect v-model="eventDuration" :options="DURATION_OPTIONS" />
          </div>
          <div>
            <label class="flex items-center gap-1 text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
              Start time slots every <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
            <SchedulerSelect v-model="slotInterval" :options="SLOT_INTERVAL_OPTIONS" />
          </div>
        </div>

        <!-- Event type / timezone -->
        <div class="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Event type</label>
            <SchedulerSelect v-model="eventType" :options="EVENT_TYPE_OPTIONS" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Event time zone</label>
            <SchedulerSelect v-model="eventTimezone" :options="TIMEZONE_OPTIONS" />
          </div>
        </div>

        <!-- Organizer -->
        <div class="mt-4">
          <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Organizer</label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button type="button" class="w-full inline-flex items-center gap-2 h-10 px-3 rounded-[10px] border border-[var(--brand-border)] bg-white text-[14px] text-[var(--brand-text)] transition hover:border-[var(--brand-teal)]">
                <BrandAvatarInitials v-if="organizer" :initials="initialsFor(organizer.name)" :bg="organizer.avatarBg" :color="organizer.avatarText" size="sm" />
                <span class="flex-1 text-left truncate">{{ organizer?.name ?? 'Select event organizer' }}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-[--reka-dropdown-menu-trigger-width] min-w-[240px] p-1.5 rounded-[12px]">
              <DropdownMenuItem v-for="m in roster" :key="m.id" class="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] cursor-pointer" @select="organizerId = m.id">
                <BrandAvatarInitials :initials="initialsFor(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="md" />
                <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ m.name }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Location -->
        <div class="mt-4">
          <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Location</label>
          <div class="flex items-center gap-2 h-10 px-3 rounded-[10px] border border-[var(--brand-border)] bg-white transition focus-within:border-[var(--brand-teal)]">
            <MapPin class="w-4 h-4 text-[var(--brand-text-subtle)] shrink-0" stroke-width="1.8" />
            <input v-model="location" type="text" placeholder="Type location" class="flex-1 bg-transparent text-[14px] text-[var(--brand-text)] outline-none placeholder:text-[var(--brand-text-quiet)]">
          </div>
        </div>

        <!-- Note -->
        <div class="mt-4">
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-[13px] font-bold text-[var(--brand-text-secondary)]">Note</label>
            <span class="text-[12px] text-[var(--brand-text-quiet)]">Visible to candidates</span>
          </div>
          <textarea
            v-model="note"
            rows="2"
            placeholder="Add a note"
            class="w-full px-3 py-2.5 rounded-[10px] border border-[var(--brand-border)] bg-white text-[14px] text-[var(--brand-text)] outline-none resize-none transition focus:border-[var(--brand-teal)] placeholder:text-[var(--brand-text-quiet)]"
          />
        </div>

        <!-- Private note (revealed) -->
        <div v-if="showPrivateNote" class="mt-3 rounded-[10px] border border-[var(--brand-encryption-border)] bg-[var(--brand-encryption-bg)] p-3">
          <div class="text-[12px] font-bold text-[var(--brand-encryption-text)] mb-1.5">Private note · only visible to your team</div>
          <textarea
            v-model="privateNote"
            rows="2"
            placeholder="Add a private note"
            class="w-full px-3 py-2.5 rounded-[9px] border border-[var(--brand-encryption-border)] bg-white text-[14px] text-[var(--brand-text)] outline-none resize-none"
          />
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2 mt-3">
          <button type="button" class="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] border border-[var(--brand-border)] bg-white text-[13px] font-semibold text-[var(--brand-text)] hover:border-[var(--brand-teal)] transition">
            <Plus class="w-4 h-4" stroke-width="2" /> Request evaluation
          </button>
          <button type="button" class="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] border border-[var(--brand-border)] bg-white text-[13px] font-semibold text-[var(--brand-text)] hover:border-[var(--brand-teal)] transition" @click="showPrivateNote = !showPrivateNote">
            <AlignLeft class="w-4 h-4" stroke-width="1.8" /> Add private note
          </button>
        </div>

        <!-- Reminders -->
        <div class="mt-6">
          <div class="text-[14px] font-bold text-[var(--brand-text)] mb-2.5">Reminders</div>
          <div class="flex items-center justify-between rounded-[12px] border border-[var(--brand-border-fade)] px-4 py-3">
            <label class="flex items-center gap-2.5 cursor-pointer">
              <BrandLimeCheckbox v-model="remindCandidate" />
              <span class="text-[13.5px] text-[var(--brand-text)]">Remind candidate</span>
            </label>
            <a href="#" class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]">
              <HelpCircle class="w-3.5 h-3.5" stroke-width="1.8" /> How candidates see this?
            </a>
          </div>
        </div>

        <!-- Privacy settings -->
        <div class="mt-5">
          <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2.5">Privacy settings for Google Calendar &amp; Outlook</label>
          <div class="flex flex-col gap-2.5">
            <label class="flex items-center gap-2.5 cursor-pointer">
              <BrandLimeCheckbox v-model="makePrivate" />
              <span class="text-[13.5px] text-[var(--brand-text)]">Make event private</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer">
              <BrandLimeCheckbox v-model="hideName" />
              <span class="text-[13.5px] text-[var(--brand-text)]">Don’t show candidate full name</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer">
              <BrandLimeCheckbox v-model="excludeCandidate" />
              <span class="text-[13.5px] text-[var(--brand-text)]">Don’t add candidate to the list of participants</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </label>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 px-7 py-4 shrink-0 border-t border-[var(--brand-border-fade)]">
        <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" :disabled="!canCreate" @click="onCreate">Create link</BrandButton>
      </div>
    </DialogContent>
  </Dialog>
</template>
