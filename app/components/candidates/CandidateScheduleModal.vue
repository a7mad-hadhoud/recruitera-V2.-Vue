<!--
  Interview scheduling — the 2-step "Schedule event" dialog opened from a
  candidate profile ("Set Interview"). Ports the Recruitee flow into our
  design system (brand tokens, teal primary; no purple/hex).

  Steps (internal `step` state):
    · form      — date/time/duration, Find time, event name, event type
                  (on-site / phone / meeting / video providers),
                  interviewers, location (or video link), organizer, note,
                  request-evaluation / private-note, privacy settings.
    · findtime  — week grid to pick a slot; returns to the form.
    · notify    — event summary + invitation notice + Schedule.

  Reuses shadcn Dialog + DropdownMenu + Brand primitives; team roster via
  useTeamMembers(). Emits `scheduled` with the built event on Schedule.
-->
<script setup lang="ts">
import {
  X, ChevronDown, ChevronLeft, ChevronRight, Calendar, HelpCircle, Building2, Phone, Users,
  Video, Plus, ArrowRight, AlignLeft, MapPin,
  Bold, Italic, Underline, List, ListOrdered, Link2, Image, Undo2, Redo2, Code, Paperclip, Type,
} from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { BrandButton, BrandLimeCheckbox, BrandAvatarInitials } from '~/components/brand'
import { useTeamMembers } from '~/composables/useTeam'
import { useCompany } from '~/composables/useCompany'
import CandidateRequestEvaluationModal from '~/components/candidates/CandidateRequestEvaluationModal.vue'
import type { TeamMember } from '~/types'

const props = defineProps<{
  candidateName?: string
  candidateInitials?: string
  candidateColor?: string
  jobName?: string
}>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ scheduled: [payload: Record<string, unknown>] }>()

// ── Team roster (interviewers + organizer) ──
const { data: teamData } = useTeamMembers()
const roster = computed<TeamMember[]>(() => teamData.value?.data ?? [])
function initialsFor(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1]![0] : '')).toUpperCase() || '?'
}

// ── Event types ──
type EventKind = 'onsite' | 'phone' | 'meeting' | 'video'
interface EventType { key: string; label: string; sub?: string; icon: any; kind: EventKind }
const EVENT_TYPES: EventType[] = [
  { key: 'onsite',  label: 'On-site interview', icon: Building2, kind: 'onsite' },
  { key: 'phone',   label: 'Phone interview',   icon: Phone,     kind: 'phone' },
  { key: 'meeting', label: 'Meeting',           icon: Users,     kind: 'meeting' },
  { key: 'gmeet',   label: 'Google Meet',  sub: 'Video interview', icon: Video, kind: 'video' },
  { key: 'zoom',    label: 'Zoom',         sub: 'Video interview', icon: Video, kind: 'video' },
  { key: 'teams',   label: 'Microsoft Teams', sub: 'Video interview', icon: Video, kind: 'video' },
]
const eventTypeKey = ref('onsite')
const eventType = computed(() => EVENT_TYPES.find(t => t.key === eventTypeKey.value)!)

// ── Date / time / duration ──
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
function fmtDate(d: Date) { return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` }
function fmtFull(d: Date) { return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` }

const baseDate = new Date()
const selectedDate = ref<Date>(baseDate)
const time = ref('11:45')
const duration = ref(30)
const TIMES = Array.from({ length: 36 }, (_, i) => {
  const m = 8 * 60 + i * 15 // 08:00 → 16:45
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
})
const DURATIONS = [15, 30, 45, 60, 90, 120]
function durationLabel(m: number) { return m >= 60 ? `${m / 60} hour${m > 60 ? 's' : ''}${m % 60 ? ` ${m % 60} min` : ''}` : `${m} minutes` }
const endTime = computed(() => {
  const [h, mm] = time.value.split(':').map(Number)
  const total = h! * 60 + mm! + duration.value
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
})

// ── Event name ──
const eventName = ref('')
watch(open, (v) => {
  if (v) {
    eventName.value = `${props.candidateName ?? 'Candidate'} - Interview with ${props.jobName ? props.jobName : 'the team'}`
    step.value = 'form'
    promoDismissed.value = false
  }
})

// ── Interviewers / organizer ──
const interviewerIds = ref<string[]>([])
const organizerId = ref<string>('')
watchEffect(() => {
  if (roster.value.length) {
    if (!interviewerIds.value.length) interviewerIds.value = [roster.value[0]!.id]
    if (!organizerId.value) organizerId.value = roster.value[0]!.id
  }
})
const interviewers = computed(() => roster.value.filter(m => interviewerIds.value.includes(m.id)))
const organizer = computed(() => roster.value.find(m => m.id === organizerId.value))
const availableToAdd = computed(() => roster.value.filter(m => !interviewerIds.value.includes(m.id)))
function addInterviewer(id: string) { if (!interviewerIds.value.includes(id)) interviewerIds.value = [...interviewerIds.value, id] }
function removeInterviewer(id: string) { interviewerIds.value = interviewerIds.value.filter(x => x !== id) }

// ── Other fields ──
const location = ref('')
const note = ref('')
const priv = reactive({ private: false, hideName: false, excludeCandidate: false })

// Request evaluation (nested modal) + inline private note.
const reqEvalOpen = ref(false)
const evalRequest = ref<{ formId: string; memberIds: string[] } | null>(null)
function onEvalSaved(p: { formId: string; memberIds: string[] }) { evalRequest.value = p }
const privateNoteOpen = ref(false)
const privateNote = ref('')

// ── Step 2 (Notify) state ──
const { data: company } = useCompany()
const companyName = computed(() => company.value?.name || 'the company')
const showInviteOptions = ref(true)
const invite = reactive({ candidateEmail: true, candidateCalendar: true, interviewerEmail: true, interviewerCalendar: false })
const fromEmail = ref('')
const emailBody = ref("Hello,\n\nWe'd like to confirm your interview. Please find all the relevant details below.")
const showInterviewerEmail = ref(false)
const remindCandidate = ref(false)
const eventLink = ref('')
watch(open, (v) => { if (v) eventLink.value = `https://recruitera.ai/v/events/${Math.random().toString(36).slice(2, 12)}` })
const emailSubject = computed(() =>
  `${eventType.value.label} on ${fmtDate(selectedDate.value)} ${time.value} — ${endTime.value} (GMT+03:00) Africa/Cairo`,
)
const RT_TOOLS = [Bold, Italic, Underline, Type, List, ListOrdered, AlignLeft, Link2, Image, Undo2, Redo2, Code]
watchEffect(() => { if (!fromEmail.value && organizer.value) fromEmail.value = organizer.value.email })
const fromMembers = computed(() => roster.value)

// ── Steps ──
const step = ref<'form' | 'findtime' | 'notify'>('form')
const promoDismissed = ref(false)

// Find time — week grid.
const weekStart = computed(() => {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // Monday
  return d
})
const weekDays = computed(() => Array.from({ length: 5 }, (_, i) => {
  const d = new Date(weekStart.value); d.setDate(d.getDate() + i); return d
}))
const GRID_HOURS = Array.from({ length: 9 }, (_, i) => 10 + i) // 10:00 → 18:00
function shiftWeek(dir: number) {
  const d = new Date(selectedDate.value); d.setDate(d.getDate() + dir * 7); selectedDate.value = d
}
function pickSlot(day: Date, hour: number) {
  selectedDate.value = new Date(day)
  time.value = `${String(hour).padStart(2, '0')}:00`
}

const summaryLine = computed(() =>
  `${eventType.value.label} on ${fmtFull(selectedDate.value)} at ${time.value} - ${endTime.value}`,
)

function onSchedule() {
  emit('scheduled', {
    candidate: props.candidateName,
    job: props.jobName,
    name: eventName.value,
    type: eventTypeKey.value,
    date: selectedDate.value.toISOString(),
    time: time.value,
    duration: duration.value,
    interviewers: interviewerIds.value,
    organizer: organizerId.value,
    location: location.value,
    note: note.value,
    privateNote: privateNote.value,
    evaluationRequest: evalRequest.value,
    privacy: { ...priv },
  })
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-0 rounded-[18px] w-[96vw] max-h-[92vh] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-[var(--brand-canvas)] overflow-hidden flex flex-col"
      :class="step === 'findtime' ? '!max-w-[1040px] sm:!max-w-[1040px]' : '!max-w-[600px] sm:!max-w-[600px]'"
    >
      <!-- ═══ Header ═══ -->
      <div class="flex items-center gap-3 px-7 pt-6 pb-5 bg-white shrink-0">
        <BrandAvatarInitials :initials="candidateInitials || initialsFor(candidateName || '?')" :bg="candidateColor || 'var(--brand-pipeline-purple)'" size="xl" />
        <div class="flex-1 min-w-0">
          <DialogTitle class="text-[20px] font-bold text-[var(--brand-text)] leading-tight">
            {{ step === 'notify' ? 'Notify about event' : step === 'findtime' ? 'Find time' : 'Schedule event' }}
          </DialogTitle>
          <div class="flex items-center gap-2 text-[13px] text-[var(--brand-text-quiet)] mt-0.5 truncate">
            <span v-if="step === 'findtime'">for an interview with</span>
            <span class="font-medium text-[var(--brand-text-secondary)]">{{ candidateName || 'Candidate' }}</span>
            <template v-if="jobName">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--brand-status-teal-green)]" />
              <span>{{ jobName }}</span>
            </template>
          </div>
        </div>
        <span v-if="step !== 'findtime'" class="text-[13px] text-[var(--brand-text-quiet)] shrink-0">Step {{ step === 'notify' ? 2 : 1 }} of 2</span>
        <button
          v-if="step === 'form'"
          type="button" class="w-8 h-8 rounded-[8px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition shrink-0" aria-label="Close" @click="open = false"
        ><X class="w-4 h-4" stroke-width="2" /></button>
      </div>
      <div class="h-px bg-[var(--brand-border-fade)] shrink-0" />

      <!-- ═══ STEP: form ═══ -->
      <div v-if="step === 'form'" class="flex-1 overflow-y-auto">
        <!-- Date / time / duration (white top) -->
        <div class="bg-white px-7 pt-5 pb-6">
          <!-- Calendar promo -->
          <div v-if="!promoDismissed" class="relative rounded-[12px] bg-[var(--brand-lime-tint)] border border-[var(--brand-lime)] px-4 py-3.5 mb-5">
            <button type="button" class="absolute top-3 right-3 text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]" aria-label="Dismiss" @click="promoDismissed = true"><X class="w-3.5 h-3.5" stroke-width="2" /></button>
            <div class="text-[14px] font-bold text-[var(--brand-teal)]">Connect your calendar</div>
            <div class="text-[13px] text-[var(--brand-text-secondary)] mt-0.5">Enhance your scheduling productivity. <a href="#" class="font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]">Learn more</a></div>
            <div class="flex flex-wrap gap-2.5 mt-3">
              <button type="button" class="inline-flex items-center gap-2 h-9 px-3 rounded-[9px] bg-white border border-[var(--brand-border)] text-[13px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition">📅 Google (Calendar)</button>
              <button type="button" class="inline-flex items-center gap-2 h-9 px-3 rounded-[9px] bg-white border border-[var(--brand-border)] text-[13px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition">🗂 Microsoft (Outlook/Exchange)</button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Date</label>
              <div class="inline-flex w-full items-center gap-2 h-11 px-3.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white text-[14px] text-[var(--brand-text)]">
                <Calendar class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
                {{ fmtDate(selectedDate) }}
              </div>
            </div>
            <div>
              <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Time</label>
              <div class="relative">
                <select v-model="time" class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white appearance-none focus:border-[var(--brand-teal)] focus:outline-none transition">
                  <option v-for="t in TIMES" :key="t" :value="t">{{ t }}</option>
                </select>
                <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
              </div>
            </div>
            <div>
              <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Duration</label>
              <div class="relative">
                <select v-model.number="duration" class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white appearance-none focus:border-[var(--brand-teal)] focus:outline-none transition">
                  <option v-for="d in DURATIONS" :key="d" :value="d">{{ durationLabel(d) }}</option>
                </select>
                <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between mt-4">
            <div class="flex items-center gap-2">
              <BrandButton variant="outline" @click="step = 'findtime'">Find time</BrandButton>
              <HelpCircle class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            </div>
            <span class="text-[13px] text-[var(--brand-text-quiet)]">(GMT+03:00) Africa/Cairo</span>
          </div>
        </div>

        <div class="h-px bg-[var(--brand-border-fade)]" />

        <!-- Details (canvas) -->
        <div class="px-7 py-6 flex flex-col gap-5">
          <div>
            <label class="flex items-center gap-2 text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">
              Event name
              <span class="inline-flex items-center h-[18px] px-1.5 rounded-md text-[11px] font-extrabold tracking-[0.04em] text-[var(--brand-pipeline-purple)] bg-[color-mix(in_srgb,var(--brand-pipeline-purple)_14%,white)]">NEW</span>
            </label>
            <input v-model="eventName" type="text" class="w-full h-11 px-3.5 text-[14px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition">
          </div>

          <div class="grid grid-cols-2 gap-4 items-start">
            <div>
              <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Event type</label>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button type="button" class="w-full inline-flex items-center gap-2.5 h-11 px-3.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white text-[14px] text-[var(--brand-text)] hover:border-[var(--brand-teal)] transition">
                    <component :is="eventType.icon" class="w-4 h-4 text-[var(--brand-text-secondary)]" stroke-width="1.8" />
                    <span class="flex-1 text-left truncate">{{ eventType.label }}</span>
                    <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-[260px] p-1.5 rounded-[12px]">
                  <DropdownMenuItem v-for="t in EVENT_TYPES" :key="t.key" class="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] cursor-pointer" @select="eventTypeKey = t.key">
                    <component :is="t.icon" class="w-4 h-4 text-[var(--brand-text-secondary)] shrink-0" stroke-width="1.8" />
                    <span class="flex-1 min-w-0">
                      <span class="block text-[13.5px] font-semibold text-[var(--brand-text)]">{{ t.label }}</span>
                      <span v-if="t.sub" class="block text-[12px] text-[var(--brand-text-quiet)]">{{ t.sub }}</span>
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Interviewer(s)</label>
              <div class="flex items-center gap-2 flex-wrap">
                <DropdownMenu v-if="availableToAdd.length">
                  <DropdownMenuTrigger as-child>
                    <button type="button" class="w-9 h-9 rounded-full border-[1.5px] border-dashed border-[var(--brand-border)] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)] transition" aria-label="Add interviewer"><Plus class="w-4 h-4" stroke-width="2" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" class="w-[240px] p-1.5 rounded-[12px]">
                    <DropdownMenuItem v-for="m in availableToAdd" :key="m.id" class="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] cursor-pointer" @select="addInterviewer(m.id)">
                      <BrandAvatarInitials :initials="initialsFor(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="md" />
                      <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ m.name }}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button v-for="m in interviewers" :key="m.id" type="button" class="group relative" :title="m.name" @click="removeInterviewer(m.id)">
                  <BrandAvatarInitials :initials="initialsFor(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="xl" />
                  <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-[var(--brand-border)] text-[var(--brand-text-quiet)] opacity-0 group-hover:opacity-100 inline-flex items-center justify-center transition"><X class="w-2.5 h-2.5" stroke-width="2.5" /></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Location (on-site/meeting) or video note -->
          <div v-if="eventType.kind === 'onsite' || eventType.kind === 'meeting'">
            <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Location</label>
            <div class="relative">
              <MapPin class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
              <input v-model="location" type="text" placeholder="Type location" class="w-full h-11 pl-10 pr-3.5 text-[14px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition">
            </div>
          </div>
          <div v-else-if="eventType.kind === 'video'" class="rounded-[10px] bg-white border border-[var(--brand-border-fade)] px-4 py-3 flex items-center gap-2.5 text-[13.5px] text-[var(--brand-text-secondary)]">
            <Video class="w-4 h-4 text-[var(--brand-teal-secondary)]" stroke-width="1.8" />
            A {{ eventType.label }} link will be generated and shared with attendees.
          </div>

          <!-- Organizer -->
          <div>
            <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Organizer</label>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button type="button" class="w-full inline-flex items-center gap-2.5 h-11 px-3.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white text-[14px] text-[var(--brand-text)] hover:border-[var(--brand-teal)] transition">
                  <BrandAvatarInitials v-if="organizer" :initials="initialsFor(organizer.name)" :bg="organizer.avatarBg" :color="organizer.avatarText" size="md" />
                  <span class="flex-1 text-left truncate">{{ organizer?.name ?? 'Select organizer' }}</span>
                  <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="2" />
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

          <!-- Note -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-[13px] font-bold text-[var(--brand-text-secondary)]">Note</label>
              <span class="text-[12.5px] text-[var(--brand-text-quiet)]">Visible to candidates</span>
            </div>
            <textarea v-model="note" rows="2" placeholder="Add a note" class="w-full px-3.5 py-2.5 text-[14px] leading-relaxed rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none resize-y transition" />
          </div>

          <!-- Private note — inline, revealed by "Add private note" -->
          <div v-if="privateNoteOpen" class="rounded-[10px] border border-[color-mix(in_srgb,var(--brand-warning)_45%,white)] bg-[color-mix(in_srgb,var(--brand-warning)_10%,white)] p-3.5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[13.5px] font-bold text-[var(--brand-text)]">Private note</span>
              <div class="flex items-center gap-2.5">
                <span class="text-[12.5px] text-[var(--brand-text-quiet)]">Only visible to team members</span>
                <button type="button" class="text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]" aria-label="Close private note" @click="privateNoteOpen = false"><X class="w-3.5 h-3.5" stroke-width="2" /></button>
              </div>
            </div>
            <textarea
              v-model="privateNote"
              rows="2"
              placeholder="Add a note visible only to team members"
              class="w-full px-3.5 py-2.5 text-[14px] leading-relaxed rounded-[9px] border border-[color-mix(in_srgb,var(--brand-warning)_45%,white)] bg-[color-mix(in_srgb,var(--brand-warning)_6%,white)] focus:border-[var(--brand-warning)] focus:outline-none resize-y transition"
            />
          </div>

          <div class="flex items-center gap-2.5">
            <BrandButton variant="outline" @click="reqEvalOpen = true">
              <Plus class="w-3.5 h-3.5 mr-1.5" stroke-width="2" />Request evaluation<span v-if="evalRequest" class="ml-1 text-[var(--brand-teal)]">·1</span>
            </BrandButton>
            <BrandButton v-if="!privateNoteOpen" variant="outline" @click="privateNoteOpen = true"><AlignLeft class="w-3.5 h-3.5 mr-1.5" stroke-width="2" />Add private note</BrandButton>
          </div>

          <!-- Privacy -->
          <div>
            <div class="text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2.5">Privacy settings for Google Calendar &amp; Outlook</div>
            <label class="flex items-center gap-2.5 py-1.5 cursor-pointer">
              <BrandLimeCheckbox v-model="priv.private" aria-label="Make event private" />
              <span class="text-[13.5px] text-[var(--brand-text)]">Make event private</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-faint)]" stroke-width="1.8" />
            </label>
            <label class="flex items-center gap-2.5 py-1.5 cursor-pointer">
              <BrandLimeCheckbox v-model="priv.hideName" aria-label="Don't show candidate full name" />
              <span class="text-[13.5px] text-[var(--brand-text)]">Don’t show candidate full name</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-faint)]" stroke-width="1.8" />
            </label>
            <label class="flex items-center gap-2.5 py-1.5 cursor-pointer">
              <BrandLimeCheckbox v-model="priv.excludeCandidate" aria-label="Don't add candidate to participants" />
              <span class="text-[13.5px] text-[var(--brand-text)]">Don’t add candidate to the list of participants</span>
              <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-faint)]" stroke-width="1.8" />
            </label>
          </div>
        </div>
      </div>

      <!-- ═══ STEP: findtime ═══ -->
      <div v-else-if="step === 'findtime'" class="flex-1 overflow-y-auto px-7 py-5">
        <div class="flex items-center justify-between mb-4">
          <div class="inline-flex items-center gap-2 h-9 px-3 rounded-[9px] border border-[var(--brand-border-fade)] bg-white text-[13.5px] font-semibold text-[var(--brand-text)]">
            <Calendar class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            {{ fmtDate(weekDays[0]!) }} – {{ fmtDate(weekDays[4]!) }}
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="w-8 h-8 rounded-md border border-[var(--brand-border-fade)] bg-white inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]" aria-label="Previous week" @click="shiftWeek(-1)"><ChevronLeft class="w-4 h-4" stroke-width="2" /></button>
            <button type="button" class="w-8 h-8 rounded-md border border-[var(--brand-border-fade)] bg-white inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]" aria-label="Next week" @click="shiftWeek(1)"><ChevronRight class="w-4 h-4" stroke-width="2" /></button>
          </div>
        </div>
        <div class="rounded-[12px] border border-[var(--brand-border-fade)] bg-white overflow-hidden">
          <div class="grid" style="grid-template-columns: 56px repeat(5, 1fr)">
            <div class="border-b border-r border-[var(--brand-border-fade)] p-2 text-[11px] font-semibold text-[var(--brand-text-quiet)]">GMT+3</div>
            <div v-for="d in weekDays" :key="d.toISOString()" class="border-b border-r last:border-r-0 border-[var(--brand-border-fade)] p-2 text-center">
              <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">{{ DAYS[d.getDay()] }}</div>
              <div class="text-[15px] font-bold text-[var(--brand-text)]">{{ d.getDate() }} {{ MONTHS[d.getMonth()] }}</div>
            </div>
            <template v-for="hour in GRID_HOURS" :key="hour">
              <div class="border-b border-r border-[var(--brand-border-fade)] px-2 py-3 text-[11.5px] text-[var(--brand-text-quiet)] tabular-nums">{{ String(hour).padStart(2, '0') }}:00</div>
              <button
                v-for="d in weekDays"
                :key="d.toISOString() + hour"
                type="button"
                class="border-b border-r last:border-r-0 border-[var(--brand-border-fade)] h-11 transition"
                :class="selectedDate.toDateString() === d.toDateString() && time === `${String(hour).padStart(2,'0')}:00`
                  ? 'bg-[var(--brand-lime-tint)]'
                  : 'hover:bg-[var(--brand-canvas)]'"
                @click="pickSlot(d, hour)"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- ═══ STEP: notify ═══ -->
      <div v-else class="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6">
        <!-- Event details -->
        <div>
          <div class="text-[15px] font-bold text-[var(--brand-text)] mb-3">Event details</div>
          <div class="rounded-[12px] border border-[var(--brand-border-fade)] bg-white p-5 flex items-start gap-3.5">
            <component :is="eventType.icon" class="w-6 h-6 text-[var(--brand-text-secondary)] mt-0.5 shrink-0" stroke-width="1.6" />
            <div class="min-w-0">
              <div class="text-[15px] font-bold text-[var(--brand-text)]">{{ eventName }}</div>
              <div class="text-[13.5px] text-[var(--brand-text-quiet)] mt-1">{{ summaryLine }}</div>
            </div>
          </div>
        </div>

        <!-- Invitations -->
        <div>
          <div class="text-[15px] font-bold text-[var(--brand-text)] mb-3">Invitations</div>
          <div class="rounded-[12px] border border-[var(--brand-border-fade)] bg-white p-5">
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2 shrink-0">
                <BrandAvatarInitials :initials="candidateInitials || initialsFor(candidateName || '?')" :bg="candidateColor || 'var(--brand-pipeline-purple)'" size="md" />
                <BrandAvatarInitials v-if="organizer" :initials="initialsFor(organizer.name)" :bg="organizer.avatarBg" :color="organizer.avatarText" size="md" />
              </div>
              <span class="flex-1 text-[14px] text-[var(--brand-text)]">Invite all participants <span class="font-semibold">via email &amp; calendar</span></span>
              <button type="button" class="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]" @click="showInviteOptions = !showInviteOptions">
                {{ showInviteOptions ? 'Hide options' : 'Show options' }}
                <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="showInviteOptions ? 'rotate-180' : ''" stroke-width="2" />
              </button>
            </div>
            <div v-if="showInviteOptions" class="mt-4 pt-4 border-t border-[var(--brand-border-fade)]">
              <div class="flex items-center gap-6 mb-3">
                <span class="w-[150px] shrink-0 text-[13.5px] text-[var(--brand-text-secondary)]">Invite candidate via</span>
                <label class="inline-flex items-center gap-2 cursor-pointer"><BrandLimeCheckbox v-model="invite.candidateEmail" aria-label="Email candidate" /><span class="text-[13.5px] text-[var(--brand-text)]">Email</span></label>
                <label class="inline-flex items-center gap-2 cursor-pointer"><BrandLimeCheckbox v-model="invite.candidateCalendar" aria-label="Calendar invite candidate" /><span class="text-[13.5px] text-[var(--brand-text)]">Calendar (Outlook/Google)</span></label>
                <a href="#" class="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]"><HelpCircle class="w-3.5 h-3.5" stroke-width="1.8" />FAQ</a>
              </div>
              <div class="flex items-center gap-6">
                <span class="w-[150px] shrink-0 text-[13.5px] text-[var(--brand-text-secondary)]">Invite interviewers via</span>
                <label class="inline-flex items-center gap-2 cursor-pointer"><BrandLimeCheckbox v-model="invite.interviewerEmail" aria-label="Email interviewers" /><span class="text-[13.5px] text-[var(--brand-text)]">Email</span></label>
                <label class="inline-flex items-center gap-2 opacity-50"><BrandLimeCheckbox v-model="invite.interviewerCalendar" aria-label="Calendar invite interviewers" /><span class="text-[13.5px] text-[var(--brand-text)]">Calendar (Outlook/Google)</span></label>
              </div>
            </div>
          </div>
        </div>

        <!-- Customize email to candidate -->
        <div>
          <div class="text-[15px] font-bold text-[var(--brand-text)] mb-3">Customize email to candidate</div>
          <div class="rounded-[12px] border border-[var(--brand-border-fade)] bg-white overflow-hidden">
            <!-- From -->
            <div class="flex items-center gap-2.5 px-4 h-12 border-b border-[var(--brand-border-fade)]">
              <span class="text-[13px] text-[var(--brand-text-quiet)]">From</span>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button type="button" class="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--brand-text)] hover:text-[var(--brand-teal)] transition">
                    <BrandAvatarInitials v-if="organizer" :initials="initialsFor(organizer.name)" :bg="organizer.avatarBg" :color="organizer.avatarText" size="sm" />
                    {{ fromEmail || 'Select sender' }}
                    <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-[260px] p-1.5 rounded-[12px]">
                  <DropdownMenuItem v-for="m in fromMembers" :key="m.id" class="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] cursor-pointer" @select="fromEmail = m.email">
                    <BrandAvatarInitials :initials="initialsFor(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="md" />
                    <span class="text-[13px] text-[var(--brand-text)] truncate">{{ m.email }}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <!-- Subject -->
            <div class="px-4 py-3 text-[13.5px] text-[var(--brand-text)] border-b border-[var(--brand-border-fade)]">{{ emailSubject }}</div>
            <!-- Toolbar -->
            <div class="flex items-center gap-0.5 px-2 h-11 border-b border-[var(--brand-border-fade)] overflow-x-auto">
              <button v-for="(t, i) in RT_TOOLS" :key="i" type="button" class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition shrink-0" aria-label="Format">
                <component :is="t" class="w-4 h-4" stroke-width="1.9" />
              </button>
              <span class="flex-1" />
              <button type="button" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[var(--brand-border-fade)] text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition shrink-0"><Plus class="w-3.5 h-3.5" stroke-width="2" />Insert…</button>
            </div>
            <!-- Body -->
            <div class="p-5">
              <textarea v-model="emailBody" rows="3" class="w-full text-[13.5px] leading-relaxed text-[var(--brand-text)] bg-transparent focus:outline-none resize-y" />
              <!-- Event preview card -->
              <div class="mt-4 rounded-[12px] border border-[var(--brand-border-fade)] bg-white p-5">
                <div class="text-[15px] font-bold text-[var(--brand-text)]">{{ eventName }}</div>
                <div class="mt-3 text-[13px]">
                  <div class="text-[var(--brand-text-quiet)]">When</div>
                  <div class="text-[var(--brand-text-secondary)]">{{ fmtFull(selectedDate) }} {{ time }} — {{ endTime }} (GMT+03:00) Africa/Cairo</div>
                </div>
                <div class="mt-3 text-[13px]">
                  <div class="text-[var(--brand-text-quiet)]">Interviewers</div>
                  <div class="text-[var(--brand-text-secondary)]">{{ interviewers.map(m => m.name).join(', ') || '—' }}</div>
                </div>
                <div class="mt-3 text-[13px]">
                  <div class="text-[var(--brand-text-quiet)]">Company</div>
                  <div class="text-[var(--brand-text-secondary)]">{{ companyName }}</div>
                </div>
                <div class="mt-3 text-[13px]">
                  <div class="text-[var(--brand-text-quiet)]">Event link</div>
                  <a href="#" class="font-semibold text-[var(--brand-teal-secondary)] break-all">{{ eventLink }}</a>
                </div>
              </div>
            </div>
            <!-- Placeholders -->
            <div class="flex items-center gap-2 flex-wrap px-4 py-3 border-t border-[var(--brand-border-fade)]">
              <span class="inline-flex items-center gap-1 text-[13px] text-[var(--brand-text-secondary)]">Placeholders <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-faint)]" stroke-width="1.8" /></span>
              <button type="button" class="inline-flex items-center gap-1 h-7 px-2.5 rounded-[7px] border border-[var(--brand-border-fade)] text-[12.5px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)]">Candidate <ChevronDown class="w-3 h-3" stroke-width="2" /></button>
              <span v-for="ph in ['job_offer', 'company']" :key="ph" class="inline-flex items-center h-7 px-2.5 rounded-[7px] border border-[var(--brand-border-fade)] text-[12.5px] font-semibold text-[var(--brand-teal-secondary)]">[ {{ ph }} ]</span>
              <button type="button" class="inline-flex items-center gap-1 h-7 px-2 rounded-[7px] text-[12.5px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]">··· More</button>
            </div>
            <!-- Attach -->
            <button type="button" class="w-full flex items-center gap-2 px-4 py-3 border-t border-[var(--brand-border-fade)] text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition"><Paperclip class="w-4 h-4" stroke-width="1.8" />Attach file</button>
          </div>
        </div>

        <!-- Customize email to interviewers (collapsible) -->
        <div>
          <button type="button" class="inline-flex items-center gap-2 text-[15px] font-bold text-[var(--brand-text)]" @click="showInterviewerEmail = !showInterviewerEmail">
            Customize email to interviewers
            <ChevronDown class="w-4 h-4 text-[var(--brand-text-quiet)] transition-transform" :class="showInterviewerEmail ? 'rotate-180' : ''" stroke-width="2" />
          </button>
          <div v-if="showInterviewerEmail" class="mt-3 rounded-[12px] border border-[var(--brand-border-fade)] bg-white p-5 text-[13.5px] text-[var(--brand-text-quiet)]">
            Interviewers receive the event details and any note above. Customize their copy here.
          </div>
        </div>

        <!-- Reminders -->
        <div>
          <div class="text-[15px] font-bold text-[var(--brand-text)] mb-3">Reminders</div>
          <div class="rounded-[12px] border border-[var(--brand-border-fade)] bg-white px-4 py-3.5 flex items-center gap-3">
            <label class="inline-flex items-center gap-2.5 cursor-pointer flex-1"><BrandLimeCheckbox v-model="remindCandidate" aria-label="Remind candidate" /><span class="text-[13.5px] text-[var(--brand-text)]">Remind candidate</span></label>
            <a href="#" class="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]"><HelpCircle class="w-3.5 h-3.5" stroke-width="1.8" />How candidates see this?</a>
          </div>
        </div>
      </div>

      <!-- ═══ Footer ═══ -->
      <div class="h-px bg-[var(--brand-border-fade)] shrink-0" />
      <div class="flex items-center justify-between gap-3 px-7 py-4 bg-[var(--brand-canvas)] shrink-0">
        <template v-if="step === 'findtime'">
          <BrandButton variant="outline" @click="step = 'form'"><ChevronLeft class="w-4 h-4 mr-1" stroke-width="2" />Go back</BrandButton>
          <BrandButton variant="primary-teal" @click="step = 'form'">Continue with {{ fmtDate(selectedDate).replace(/ \d{4}$/, '') }} {{ time }} - {{ endTime }}</BrandButton>
        </template>
        <template v-else-if="step === 'notify'">
          <BrandButton variant="outline" @click="step = 'form'"><ChevronLeft class="w-4 h-4 mr-1" stroke-width="2" />Edit</BrandButton>
          <BrandButton variant="primary-teal" @click="onSchedule">Schedule and invite</BrandButton>
        </template>
        <template v-else>
          <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
          <BrandButton variant="primary-teal" @click="step = 'notify'">Continue<ArrowRight class="w-4 h-4 ml-1" stroke-width="2" /></BrandButton>
        </template>
      </div>
    </DialogContent>
  </Dialog>

  <!-- Request evaluation (nested) -->
  <CandidateRequestEvaluationModal v-model:open="reqEvalOpen" @save="onEvalSaved" />
</template>
