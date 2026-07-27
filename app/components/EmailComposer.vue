<!--
  Reusable email composer — the single source of truth for the email-editing
  design across the product (Settings → Email templates, candidate profile →
  Emails, and anywhere else an email body is composed).

  Card = subject line + a formatting toolbar (Bold / Italic / Underline · Link /
  Image · Insert…) + a contenteditable body that renders merge tokens as
  [ token ] chips + Attach file + a Placeholders bar (Candidate dropdown,
  [ job_offer ], [ company ], and a "More" menu that drills into Hiring
  manager / Recruiter / department). The Insert… menu drills into
  Questionnaires and Event scheduler. All token insertion is done through
  document.execCommand on the body — no untrusted HTML is rendered from state.

  v-model:subject / v-model:body keep the parent in sync; `showSubject` hides
  the subject row when the surrounding UI supplies its own.
-->
<script setup lang="ts">
import {
  Bold, Italic, Underline, Link2, Image as ImageIcon, ChevronDown, ChevronRight,
  ChevronLeft, MoreHorizontal, ListChecks, Paperclip, X, Settings2, Pencil, Plus, Clock,
  ALargeSmall, Type, Baseline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Undo2, Redo2, Code, Sparkles,
} from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Mail, Eye, Send, Users, Check, HelpCircle, ListPlus } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import EmailSendLaterMenu from '~/components/EmailSendLaterMenu.vue'
import EmailVisibilityModal from '~/components/EmailVisibilityModal.vue'
import { useEmailTemplates } from '~/composables/useTemplates'

const props = withDefaults(defineProps<{
  showSubject?: boolean
  subjectPlaceholder?: string
  minHeight?: string
  showFooter?: boolean
  sendLabel?: string
  signature?: string
}>(), {
  showSubject: true,
  subjectPlaceholder: 'Subject line',
  minHeight: '220px',
  showFooter: false,
  sendLabel: 'Send',
  signature: 'Amr Hammad',
})
const emit = defineEmits<{ send: [], sendLater: [], cancel: [] }>()
const subject = defineModel<string>('subject', { default: '' })
const body = defineModel<string>('body', { default: '' })

// Email templates (for the Insert → Email templates picker)
const { data: tplData } = useEmailTemplates()
const emailTemplates = computed(() => tplData.value?.data ?? [])
function renderTemplateHtml(text: string) {
  return text
    .split('\n\n')
    .map(p => `<p>${p.replace(/\{\{(.+?)\}\}/g, (_, tok) => tokenSpan(tok.trim()))}</p>`)
    .join('')
}

// Footer: visibility (Everyone / Selected members) + send actions
const visibility = ref<'everyone' | 'selected'>('everyone')
const visOpen = ref(false)
const visModalOpen = ref(false)
const selectedCount = ref(0)
const visibilityLabel = computed(() =>
  visibility.value === 'everyone' ? 'Visible to everyone' : `Selected members (${selectedCount.value})`,
)
function setEveryone() { visibility.value = 'everyone'; selectedCount.value = 0; visOpen.value = false }
function openSelected() { visOpen.value = false; visModalOpen.value = true }
function onVisSave(payload: { members: string[], roles: string[] }) {
  selectedCount.value = payload.members.length + payload.roles.length
  visibility.value = selectedCount.value ? 'selected' : 'everyone'
}

const bodyEl = ref<HTMLDivElement | null>(null)

// Default signature — seeded into the body on compose surfaces (showFooter) so
// the message starts with `--` / sender name, matching the reference composer.
// Never seeded in the template editor (Settings), which edits raw template body.
const signatureHtml = computed(
  () => `<div class="cp-email-signature" style="color:var(--brand-text-quiet)">--<br>${props.signature}</div>`,
)

// Two-way body: seed the contenteditable from the model on mount and whenever
// the model is replaced externally (e.g. switching templates), without
// clobbering the caret while the user is typing (syncBody keeps them equal).
onMounted(() => {
  if (!bodyEl.value) return
  if (!body.value && props.showFooter) body.value = `<p><br></p>${signatureHtml.value}`
  if (body.value) bodyEl.value.innerHTML = body.value
})
watch(body, (v) => {
  if (bodyEl.value && (v ?? '') !== bodyEl.value.innerHTML) bodyEl.value.innerHTML = v ?? ''
})

// Send is disabled until there's real content — subject text, or body text
// beyond the auto-seeded signature (matching the greyed-out reference buttons).
const hasContent = computed(() => {
  if (subject.value.trim()) return true
  if (!import.meta.client) return false
  const tmp = document.createElement('div')
  tmp.innerHTML = body.value || ''
  tmp.querySelectorAll('.cp-email-signature').forEach(el => el.remove())
  return tmp.textContent!.trim().length > 0
})

function tokenSpan(token: string) {
  return `<span contenteditable="false" style="background:var(--brand-email-highlight-bg);color:var(--brand-teal);padding:1px 6px;border-radius:4px;font-size:13px;font-weight:600">[ ${token} ]</span>`
}
function syncBody() { body.value = bodyEl.value?.innerHTML ?? '' }
function exec(cmd: string, value?: string) {
  bodyEl.value?.focus()
  document.execCommand(cmd, false, value)
  syncBody()
}
function insertLink() { const url = window.prompt('Link URL', 'https://'); if (url) exec('createLink', url) }
function insertImage() { const url = window.prompt('Image URL', 'https://'); if (url) exec('insertImage', url) }

// Font size / family / colour / alignment
const FONT_SIZES = [{ label: 'Small', value: '2' }, { label: 'Normal', value: '3' }, { label: 'Large', value: '5' }, { label: 'Huge', value: '6' }]
const FONT_FAMILIES = [
  { label: 'Sans Serif', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Serif', value: 'Georgia, \'Times New Roman\', serif' },
  { label: 'Monospace', value: '\'Courier New\', monospace' },
]
const COLOR_SWATCHES = ['var(--brand-text)', 'var(--brand-teal)', 'var(--brand-olive)', 'var(--brand-danger)', 'var(--brand-warning)', 'var(--brand-pipeline-purple)', 'var(--brand-text-quiet)', '#ffffff']
const sizeOpen = ref(false)
const familyOpen = ref(false)
const colorOpen = ref(false)
const alignOpen = ref(false)
function applySize(v: string) { exec('fontSize', v); sizeOpen.value = false }
function applyFamily(v: string) { exec('fontName', v); familyOpen.value = false }
function applyColor(c: string) { exec('foreColor', c); colorOpen.value = false }
function applyAlign(cmd: string) { exec(cmd); alignOpen.value = false }

// HTML source toggle
const codeView = ref(false)
function toggleCode() {
  if (!codeView.value) { syncBody(); codeView.value = true }
  else { codeView.value = false; nextTick(() => { if (bodyEl.value) bodyEl.value.innerHTML = body.value }) }
}

// AI Write
const aiOpen = ref(false)
const aiPrompt = ref('')
function aiGenerate() {
  const p = aiPrompt.value.trim()
  const draft = p
    ? `<p>${p.charAt(0).toUpperCase()}${p.slice(1)}</p><p>Best regards,</p>`
    : '<p>Thanks for your interest — we\'ll be in touch shortly with next steps.</p>'
  bodyEl.value?.focus()
  document.execCommand('insertHTML', false, draft)
  syncBody()
  aiPrompt.value = ''
  aiOpen.value = false
}
function insertToken(token: string) {
  bodyEl.value?.focus()
  document.execCommand('insertHTML', false, `${tokenSpan(token)}&nbsp;`)
  syncBody()
}

// Attachments
const attachments = ref<string[]>([])
function onFilesChosen(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) attachments.value.push(...Array.from(files).map(f => f.name))
}
function removeAttachment(name: string) { attachments.value = attachments.value.filter(a => a !== name) }

// Insert… menu (drill-in)
const insertOpen = ref(false)
const insertView = ref<'root' | 'templates' | 'quest' | 'sched'>('root')
watch(insertOpen, (v) => { if (!v) insertView.value = 'root' })
function doInsert(token: string) { insertToken(token); insertOpen.value = false }
function applyTemplate(t: { subject: string, body: string }) {
  if (props.showSubject && !subject.value.trim()) subject.value = t.subject
  body.value = t.body.includes('<') ? t.body : renderTemplateHtml(t.body)
  insertOpen.value = false
}

// Candidate placeholders
const candidateOpen = ref(false)
const CANDIDATE_TOKENS = [
  { token: 'candidate.first', desc: 'Candidate\'s first name' },
  { token: 'candidate.last', desc: 'Candidate\'s last name' },
  { token: 'candidate.full', desc: 'Candidate\'s full name' },
  { token: 'candidate.full_email', desc: 'Candidate\'s full name and email address' },
  { token: 'candidate.email', desc: 'Candidate\'s email address' },
]
function doCandidate(token: string) { insertToken(token); candidateOpen.value = false }

// More menu (drill-in) — each category drills into its own token list.
type MoreGroup = 'hiring' | 'recruiter' | 'event' | 'sender'
const moreOpen = ref(false)
const moreView = ref<'root' | MoreGroup>('root')
watch(moreOpen, (v) => { if (!v) moreView.value = 'root' })

const MORE_ROOT: { key: MoreGroup, title: string, sub: string }[] = [
  { key: 'hiring', title: 'Hiring manager', sub: 'Hiring manager-related placeholders' },
  { key: 'recruiter', title: 'Recruiter', sub: 'Recruiter-related placeholders' },
  { key: 'event', title: 'Event', sub: 'Event-related placeholders' },
  { key: 'sender', title: 'Email sender', sub: 'The person sending this email' },
]
const MORE_GROUPS: Record<MoreGroup, { title: string, tokens: { token: string, desc: string }[] }> = {
  hiring: {
    title: 'Hiring manager',
    tokens: [
      { token: 'hiring_manager.first', desc: 'Hiring manager\'s first name' },
      { token: 'hiring_manager.last', desc: 'Hiring manager\'s last name' },
      { token: 'hiring_manager.full', desc: 'Hiring manager\'s full name' },
      { token: 'hiring_manager.full_email', desc: 'Hiring manager\'s full name and email address' },
    ],
  },
  recruiter: {
    title: 'Recruiter',
    tokens: [
      { token: 'recruiter_per_job.first', desc: 'Recruiter\'s first name' },
      { token: 'recruiter_per_job.last', desc: 'Recruiter\'s last name' },
      { token: 'recruiter_per_job.full', desc: 'Recruiter\'s full name' },
      { token: 'recruiter_per_job.full_email', desc: 'Recruiter\'s full name and email address' },
    ],
  },
  event: {
    title: 'Event',
    tokens: [
      { token: 'event.full', desc: 'Event\'s type, date, time, and interviewer(s)' },
      { token: 'event.name', desc: 'Event\'s name' },
      { token: 'event.link', desc: 'Link to the event' },
      { token: 'event.location', desc: 'Event\'s location' },
      { token: 'event.date', desc: 'Event\'s date and time' },
      { token: 'event.type', desc: 'Event\'s type' },
      { token: 'event.interviewers', desc: 'Interviewers assigned to the event' },
    ],
  },
  sender: {
    title: 'Email sender',
    tokens: [
      { token: 'email_sender.first', desc: 'Amr' },
      { token: 'email_sender.last', desc: 'Hammad' },
      { token: 'email_sender.full', desc: 'Amr Hammad' },
      { token: 'email_sender.full_email', desc: 'Amr Hammad (a.hammad+8989@basharsoft.com)' },
    ],
  },
}
const moreGroup = computed(() => (moreView.value === 'root' ? null : MORE_GROUPS[moreView.value]))
function doMore(token: string) { insertToken(token); moreOpen.value = false }
</script>

<template>
  <div class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden">
    <!-- Subject -->
    <div v-if="showSubject" class="px-4 py-3 border-b border-[var(--brand-border-fade)]">
      <input
        v-model="subject"
        type="text"
        :placeholder="subjectPlaceholder"
        class="w-full border-0 outline-none text-[14px] text-[var(--brand-text)] bg-transparent"
      >
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-0.5 px-3.5 py-2.5 border-b border-[var(--brand-border-fade)] flex-wrap">
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Bold" @click="exec('bold')"><Bold class="w-3.5 h-3.5" /></button>
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Italic" @click="exec('italic')"><Italic class="w-3.5 h-3.5" /></button>
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Underline" @click="exec('underline')"><Underline class="w-3.5 h-3.5" /></button>

      <!-- Font size -->
      <Popover v-model:open="sizeOpen">
        <PopoverTrigger as-child>
          <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Font size"><ALargeSmall class="w-4 h-4" /></button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-[150px] p-1.5 rounded-[10px]">
          <button v-for="s in FONT_SIZES" :key="s.value" type="button" class="w-full text-left px-2.5 py-1.5 rounded-md text-[13px] text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="applySize(s.value)">{{ s.label }}</button>
        </PopoverContent>
      </Popover>

      <!-- Font family -->
      <Popover v-model:open="familyOpen">
        <PopoverTrigger as-child>
          <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Font"><Type class="w-4 h-4" /></button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-[170px] p-1.5 rounded-[10px]">
          <button v-for="f in FONT_FAMILIES" :key="f.value" type="button" class="w-full text-left px-2.5 py-1.5 rounded-md text-[13px] text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" :style="{ fontFamily: f.value }" @click="applyFamily(f.value)">{{ f.label }}</button>
        </PopoverContent>
      </Popover>

      <!-- Font color -->
      <Popover v-model:open="colorOpen">
        <PopoverTrigger as-child>
          <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Text color"><Baseline class="w-4 h-4" /></button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-auto p-2 rounded-[10px]">
          <div class="grid grid-cols-4 gap-1.5">
            <button v-for="c in COLOR_SWATCHES" :key="c" type="button" class="w-6 h-6 rounded-md border border-[var(--brand-border)] cursor-pointer" :style="{ background: c }" @click="applyColor(c)" />
          </div>
        </PopoverContent>
      </Popover>

      <div class="w-px h-4 bg-[var(--brand-border-light)] mx-1" />
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Bulleted list" @click="exec('insertUnorderedList')"><List class="w-3.5 h-3.5" /></button>
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Numbered list" @click="exec('insertOrderedList')"><ListOrdered class="w-3.5 h-3.5" /></button>

      <!-- Alignment -->
      <Popover v-model:open="alignOpen">
        <PopoverTrigger as-child>
          <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Alignment"><AlignLeft class="w-3.5 h-3.5" /></button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-auto p-1 rounded-[10px]">
          <div class="flex items-center gap-0.5">
            <button type="button" class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-nav-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="applyAlign('justifyLeft')"><AlignLeft class="w-3.5 h-3.5" /></button>
            <button type="button" class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-nav-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="applyAlign('justifyCenter')"><AlignCenter class="w-3.5 h-3.5" /></button>
            <button type="button" class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-nav-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="applyAlign('justifyRight')"><AlignRight class="w-3.5 h-3.5" /></button>
            <button type="button" class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-nav-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="applyAlign('justifyFull')"><AlignJustify class="w-3.5 h-3.5" /></button>
          </div>
        </PopoverContent>
      </Popover>

      <div class="w-px h-4 bg-[var(--brand-border-light)] mx-1" />
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Insert link" @click="insertLink"><Link2 class="w-3.5 h-3.5" /></button>
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Insert image" @click="insertImage"><ImageIcon class="w-3.5 h-3.5" /></button>
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Undo" @click="exec('undo')"><Undo2 class="w-3.5 h-3.5" /></button>
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Redo" @click="exec('redo')"><Redo2 class="w-3.5 h-3.5" /></button>
      <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" :class="codeView ? 'text-[var(--brand-teal)] bg-[var(--brand-surface-hover)]' : 'text-[var(--brand-nav-text)]'" title="HTML source" @click="toggleCode"><Code class="w-3.5 h-3.5" /></button>

      <div class="ml-auto flex items-center gap-2">
        <!-- Insert… -->
        <Popover v-model:open="insertOpen">
          <PopoverTrigger as-child>
            <button type="button" class="flex items-center gap-1.5 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-[9px] px-3.5 py-[7px] text-[13px] font-semibold text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
              <ListPlus class="w-3.5 h-3.5" />Insert…
            </button>
          </PopoverTrigger>
        <PopoverContent align="end" class="w-[320px] p-0 rounded-[14px] overflow-hidden">
          <!-- root -->
          <template v-if="insertView === 'root'">
            <div class="text-center text-[15px] font-bold text-[var(--brand-text)] px-4 py-3 border-b border-[var(--brand-border-hairline)]">Select content type</div>
            <button v-if="showFooter" type="button" class="w-full flex items-start gap-3 px-4 py-3.5 border-b border-[var(--brand-border-hairline)] hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left" @click="insertView = 'templates'">
              <Mail class="w-[18px] h-[18px] mt-0.5 text-[var(--brand-text-secondary)] shrink-0" stroke-width="1.8" />
              <span class="flex-1 min-w-0"><span class="block text-[14px] font-bold text-[var(--brand-text)]">Email templates</span><span class="block text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Insert a pre-made template.</span></span>
              <ChevronRight class="w-4 h-4 mt-1 text-[var(--brand-text-quiet)] shrink-0" />
            </button>
            <button type="button" class="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left" @click="insertView = 'quest'">
              <ListChecks class="w-[18px] h-[18px] mt-0.5 text-[var(--brand-text-secondary)] shrink-0" stroke-width="1.8" />
              <span class="flex-1 min-w-0"><span class="block text-[14px] font-bold text-[var(--brand-text)]">Questionnaires</span><span class="block text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Send a link to sets of questions for candidates.</span></span>
              <ChevronRight class="w-4 h-4 mt-1 text-[var(--brand-text-quiet)] shrink-0" />
            </button>
            <button type="button" class="w-full flex items-start gap-3 px-4 py-3.5 border-t border-[var(--brand-border-hairline)] hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left" @click="insertView = 'sched'">
              <Clock class="w-[18px] h-[18px] mt-0.5 text-[var(--brand-text-secondary)] shrink-0" stroke-width="1.8" />
              <span class="flex-1 min-w-0"><span class="block text-[14px] font-bold text-[var(--brand-text)]">Event scheduler</span><span class="block text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Send your availability to a candidate and schedule an interview.</span></span>
              <ChevronRight class="w-4 h-4 mt-1 text-[var(--brand-text-quiet)] shrink-0" />
            </button>
          </template>
          <!-- email templates -->
          <template v-else-if="insertView === 'templates'">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-[var(--brand-border-hairline)]">
              <button type="button" class="text-[var(--brand-text-secondary)] cursor-pointer" @click="insertView = 'root'"><ChevronLeft class="w-4 h-4" /></button>
              <span class="flex-1 text-center text-[15px] font-bold text-[var(--brand-text)]">Email templates</span>
              <span class="w-4" />
            </div>
            <div class="max-h-[320px] overflow-y-auto">
              <button
                v-for="t in emailTemplates"
                :key="t.id"
                type="button"
                class="w-full flex items-center gap-3 px-4 py-2.5 border-b border-[var(--brand-border-hairline)] last:border-0 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
                @click="applyTemplate(t)"
              >
                <Mail class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.7" />
                <span class="flex-1 min-w-0"><span class="block text-[14px] font-semibold text-[var(--brand-text)] truncate">{{ t.name }}</span><span class="block text-[12px] text-[var(--brand-text-quiet)] truncate">{{ t.subject || 'No subject' }}</span></span>
              </button>
              <p v-if="!emailTemplates.length" class="px-4 py-6 text-center text-[13px] text-[var(--brand-text-quiet)]">No templates yet.</p>
            </div>
          </template>
          <!-- questionnaires -->
          <template v-else-if="insertView === 'quest'">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-[var(--brand-border-hairline)]">
              <button type="button" class="text-[var(--brand-text-secondary)] cursor-pointer" @click="insertView = 'root'"><ChevronLeft class="w-4 h-4" /></button>
              <span class="flex-1 text-center text-[15px] font-bold text-[var(--brand-text)]">Questionnaires</span>
              <Settings2 class="w-4 h-4 text-[var(--brand-text-quiet)]" />
            </div>
            <div class="px-4 pt-3 pb-1 text-[11px] font-bold tracking-[0.06em] text-[var(--brand-text-quiet)] border-b border-[var(--brand-border-hairline)]">SCREENING</div>
            <button type="button" class="w-full text-left px-4 py-3 text-[14px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="doInsert('Questionnaire: Essential template')">Essential template</button>
          </template>
          <!-- event scheduler -->
          <template v-else>
            <div class="flex items-center gap-2 px-4 py-3 border-b border-[var(--brand-border-hairline)]">
              <button type="button" class="text-[var(--brand-text-secondary)] cursor-pointer" @click="insertView = 'root'"><ChevronLeft class="w-4 h-4" /></button>
              <span class="flex-1 text-center text-[15px] font-bold text-[var(--brand-text)]">Event scheduler</span>
              <Settings2 class="w-4 h-4 text-[var(--brand-text-quiet)]" />
            </div>
            <div class="px-4 pt-3 pb-1 text-[11px] font-bold tracking-[0.06em] text-[var(--brand-text-quiet)]">TEAM LINKS</div>
            <button type="button" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left" @click="doInsert('Event scheduler: Interview Scheduler')">
              <span class="flex-1 min-w-0"><span class="block text-[14px] font-bold text-[var(--brand-text)]">Interview Scheduler</span><span class="inline-flex items-center gap-1.5 mt-1.5"><span class="w-6 h-6 rounded-full bg-[var(--brand-avatar-4)] text-white inline-flex items-center justify-center text-[10px] font-bold">JD</span></span></span>
              <Pencil class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" />
            </button>
            <button type="button" class="w-full flex items-center gap-2 px-4 py-3 border-t border-[var(--brand-border-hairline)] text-[14px] font-bold text-[var(--brand-teal)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="doInsert('Event scheduler: New link')">
              <Plus class="w-4 h-4" stroke-width="2" />Create new link
            </button>
          </template>
        </PopoverContent>
        </Popover>

        <!-- AI Write -->
        <Popover v-model:open="aiOpen">
          <PopoverTrigger as-child>
            <button type="button" class="flex items-center gap-1.5 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-[9px] px-3.5 py-[7px] text-[13px] font-semibold text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
              <span class="inline-flex items-center leading-none text-[9.5px] font-bold tracking-[0.04em] text-white bg-[var(--brand-pipeline-purple)] rounded-[4px] px-1 py-[3px]">AI</span>Write
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" class="w-[320px] p-3.5 rounded-[14px]">
            <div class="flex items-center gap-2 mb-2.5">
              <Sparkles class="w-4 h-4 text-[var(--brand-pipeline-purple)]" />
              <span class="text-[14px] font-bold text-[var(--brand-text)]">Write with AI</span>
            </div>
            <textarea
              v-model="aiPrompt"
              rows="3"
              placeholder="Describe the email you want to write…"
              class="w-full box-border resize-none border border-[var(--brand-border)] rounded-[10px] px-3 py-2.5 text-[13.5px] text-[var(--brand-text)] outline-none focus:border-[var(--brand-lime)]"
            />
            <div class="flex justify-end mt-2.5">
              <BrandButton variant="primary-teal" size="sm" @click="aiGenerate">
                <Sparkles class="w-3.5 h-3.5" stroke-width="1.9" />Generate
              </BrandButton>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <!-- Body -->
    <textarea
      v-if="codeView"
      v-model="body"
      class="w-full box-border px-[18px] py-[18px] text-[13px] font-mono text-[var(--brand-text)] outline-none leading-[1.6] resize-none bg-[var(--brand-canvas)]"
      :style="{ minHeight }"
    />
    <div
      v-else
      ref="bodyEl"
      contenteditable="true"
      class="px-[18px] py-[18px] text-[14px] text-[var(--brand-text)] outline-none leading-[1.7]"
      :style="{ minHeight }"
      @input="syncBody"
    />

    <!-- Attachments -->
    <div v-if="attachments.length" class="border-t border-[var(--brand-border-fade)] px-4 py-3 flex flex-wrap gap-2">
      <span v-for="a in attachments" :key="a" class="inline-flex items-center gap-1.5 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-[7px] px-2.5 py-1 text-[12px] text-[var(--brand-text)]">
        {{ a }}<button type="button" class="text-[var(--brand-icon-muted)] outline-none hover:text-[var(--brand-text)]" @click="removeAttachment(a)"><X class="w-3 h-3" /></button>
      </span>
    </div>

    <!-- Attach file (standalone — hidden when the send footer is shown) -->
    <div v-if="!showFooter" class="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--brand-border-fade)]">
      <Paperclip class="w-3.5 h-3.5 text-[var(--brand-nav-text)]" />
      <label class="text-[13px] font-semibold text-[var(--brand-nav-text)] cursor-pointer">
        Attach file<input type="file" multiple class="hidden" @change="onFilesChosen">
      </label>
    </div>

    <!-- Placeholders bar -->
    <div class="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--brand-border-fade)] flex-wrap">
      <span class="text-[13px] font-medium text-[var(--brand-text-quiet)]">Placeholders</span>
      <span
        class="inline-flex text-[var(--brand-text-quiet)] cursor-help hover:text-[var(--brand-text-secondary)] transition-colors"
        title="Placeholders are replaced with real values (candidate name, job title, company…) when the email is sent."
      >
        <HelpCircle class="w-[15px] h-[15px]" stroke-width="1.9" />
      </span>

      <!-- Candidate -->
      <Popover v-model:open="candidateOpen">
        <PopoverTrigger as-child>
          <button type="button" class="flex items-center gap-1 bg-[var(--brand-canvas)] border border-[var(--brand-border-mid)] rounded-full px-3 py-1 text-[13px] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
            Candidate<ChevronDown class="w-2.5 h-2.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-[280px] p-1.5 rounded-[12px]">
          <button v-for="t in CANDIDATE_TOKENS" :key="t.token" type="button" class="w-full flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left" @click="doCandidate(t.token)">
            <span class="text-[13.5px] font-bold text-[var(--brand-teal)]">[ {{ t.token }} ]</span>
            <span class="text-[12px] text-[var(--brand-text-quiet)]">{{ t.desc }}</span>
          </button>
        </PopoverContent>
      </Popover>

      <button type="button" class="bg-[var(--brand-surface-white)] border border-[var(--brand-teal)] rounded-full px-3 py-1 text-[13px] font-semibold text-[var(--brand-teal)] outline-none" @click="insertToken('job_offer')">[ job_offer ]</button>
      <button type="button" class="bg-[var(--brand-surface-white)] border border-[var(--brand-teal)] rounded-full px-3 py-1 text-[13px] font-semibold text-[var(--brand-teal)] outline-none" @click="insertToken('company')">[ company ]</button>

      <!-- More -->
      <Popover v-model:open="moreOpen">
        <PopoverTrigger as-child>
          <button type="button" class="flex items-center gap-1 bg-[var(--brand-canvas)] border border-[var(--brand-border-mid)] rounded-full px-3 py-1 text-[13px] text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
            <MoreHorizontal class="w-3 h-3" />More
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-[300px] p-0 rounded-[14px] overflow-hidden">
          <template v-if="moreView === 'root'">
            <div class="text-center text-[15px] font-bold text-[var(--brand-text)] px-4 py-3 border-b border-[var(--brand-border-hairline)]">Choose placeholders</div>
            <div class="max-h-[320px] overflow-y-auto">
              <button
                v-for="g in MORE_ROOT"
                :key="g.key"
                type="button"
                class="w-full flex items-start gap-3 px-4 py-3.5 border-b border-[var(--brand-border-hairline)] hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
                @click="moreView = g.key"
              >
                <span class="flex-1 min-w-0"><span class="block text-[14px] font-bold text-[var(--brand-text)]">{{ g.title }}</span><span class="block text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ g.sub }}</span></span>
                <ChevronRight class="w-4 h-4 mt-0.5 text-[var(--brand-text-quiet)] shrink-0" />
              </button>
              <button type="button" class="w-full flex flex-col items-start gap-0.5 px-4 py-3.5 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left" @click="doMore('department')">
                <span class="text-[14px] font-bold text-[var(--brand-teal)]">[ department ]</span>
                <span class="text-[12.5px] text-[var(--brand-text-quiet)]">Job's department</span>
              </button>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center gap-2 px-4 py-3 border-b border-[var(--brand-border-hairline)]">
              <button type="button" class="text-[var(--brand-text-secondary)] cursor-pointer" @click="moreView = 'root'"><ChevronLeft class="w-4 h-4" /></button>
              <span class="flex-1 text-center text-[15px] font-bold text-[var(--brand-text)]">{{ moreGroup?.title }}</span>
              <span class="w-4" />
            </div>
            <div class="max-h-[320px] overflow-y-auto">
              <button
                v-for="t in moreGroup?.tokens"
                :key="t.token"
                type="button"
                class="w-full flex flex-col items-start gap-0.5 px-4 py-2.5 border-b border-[var(--brand-border-hairline)] last:border-0 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
                @click="doMore(t.token)"
              >
                <span class="text-[14px] font-bold text-[var(--brand-teal)]">[ {{ t.token }} ]</span>
                <span class="text-[12.5px] text-[var(--brand-text-quiet)]">{{ t.desc }}</span>
              </button>
            </div>
          </template>
        </PopoverContent>
      </Popover>
    </div>

    <!-- Send footer — shown on compose surfaces (candidate email, bulk), hidden
         in Settings → Email templates (which saves via its own Save button). -->
    <template v-if="showFooter">
      <div class="px-4 py-2.5 border-t border-[var(--brand-border-fade)]">
        <Popover v-model:open="visOpen">
          <PopoverTrigger as-child>
            <button type="button" class="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--brand-nav-text)] bg-[var(--brand-surface-hover)] rounded-[8px] px-2.5 py-1.5 outline-none cursor-pointer">
              <Eye class="w-4 h-4" stroke-width="1.8" />{{ visibilityLabel }}<ChevronDown class="w-3 h-3 transition-transform" :class="{ 'rotate-180': visOpen }" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-[320px] p-0 rounded-[14px] overflow-hidden">
            <div class="text-center text-[15px] font-bold text-[var(--brand-text)] px-4 py-3 border-b border-[var(--brand-border-hairline)]">Visibility Options</div>
            <button type="button" class="w-full flex items-start gap-3 px-4 py-3.5 border-b border-[var(--brand-border-hairline)] hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left" @click="setEveryone">
              <Eye class="w-[18px] h-[18px] mt-0.5 text-[var(--brand-text-secondary)] shrink-0" stroke-width="1.8" />
              <span class="flex-1 min-w-0"><span class="block text-[14px] font-bold text-[var(--brand-text)]">Everyone</span><span class="block text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Visible to all team members</span></span>
              <Check v-if="visibility === 'everyone'" class="w-4 h-4 mt-0.5 text-[var(--brand-success)] shrink-0" stroke-width="2.4" />
            </button>
            <button type="button" class="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left" @click="openSelected">
              <Users class="w-[18px] h-[18px] mt-0.5 text-[var(--brand-text-secondary)] shrink-0" stroke-width="1.8" />
              <span class="flex-1 min-w-0"><span class="block text-[14px] font-bold text-[var(--brand-text)]">Selected members</span><span class="block text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Visible only to selected people and roles</span></span>
              <Check v-if="visibility === 'selected'" class="w-4 h-4 mt-0.5 text-[var(--brand-success)] shrink-0" stroke-width="2.4" />
            </button>
          </PopoverContent>
        </Popover>
        <EmailVisibilityModal v-model:open="visModalOpen" @save="onVisSave" />
      </div>
      <div class="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-[var(--brand-border-fade)]">
        <label class="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--brand-nav-text)] cursor-pointer">
          <Paperclip class="w-3.5 h-3.5" />Attach file<input type="file" multiple class="hidden" @change="onFilesChosen">
        </label>
        <div class="flex items-center gap-3">
          <button type="button" class="text-[13.5px] font-semibold text-[var(--brand-text-secondary)] outline-none cursor-pointer" @click="emit('cancel')">Cancel</button>
          <EmailSendLaterMenu :disabled="!hasContent" @schedule="emit('sendLater')" />
          <BrandButton variant="primary-teal" size="md" :disabled="!hasContent" @click="emit('send')">{{ sendLabel }}<Send class="w-3.5 h-3.5" stroke-width="1.9" /></BrandButton>
        </div>
      </div>
    </template>
  </div>
</template>
