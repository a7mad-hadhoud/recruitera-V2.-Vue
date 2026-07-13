<!--
  Candidate Profile → Emails tab. Ported from the reference mockup's
  data-panel="messages": a segmented "Send email / Email history" switch,
  a compose form (To/Cc/Bcc/Subject/body + a visual formatting toolbar +
  a working Templates dropdown that fills subject/body), and a static
  history list of two prior emails (sent/received).

  No write endpoint exists yet, so Send is a visual no-op (mirrors the
  Notes composer's TODO pattern in [id].vue). Everything else — segmented
  tab, Cc/Bcc reveal, bold/italic/underline toggle, template picker — is
  local component state only, matching the interactivity the mockup itself
  has (no new API calls).
-->
<script setup lang="ts">
import {
  Paperclip, ChevronDown, Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Indent, Outdent, Quote, AlignLeft, AlignCenter, AlignRight, Palette, Eraser,
  LayoutTemplate, Braces, Send, Mail,
} from 'lucide-vue-next'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'
import type { CandidateProfile } from '~/types'

const props = defineProps<{ profile: CandidateProfile }>()

const segment = ref<'compose' | 'history'>('compose')

const showCc = ref(false)
const showBcc = ref(false)

const subject = ref('')
const subjectEl = ref<HTMLInputElement | null>(null)

// Body is a real contenteditable div edited via document.execCommand — not
// v-html, nothing here renders untrusted markup back into the page.
const bodyEl = ref<HTMLDivElement | null>(null)

function exec(cmd: string, value?: string) {
  bodyEl.value?.focus()
  document.execCommand(cmd, false, value)
}

const FONT_FAMILIES = [
  { label: 'Sans Serif', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Serif', value: 'Georgia, \'Times New Roman\', serif' },
  { label: 'Monospace', value: '\'Courier New\', monospace' },
]
const FONT_SIZES = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '5' },
  { label: 'Huge', value: '6' },
]
const fontSize = ref('3')

const colorOpen = ref(false)
const alignOpen = ref(false)
const COLOR_SWATCHES = [
  { label: 'Text', value: 'var(--brand-text)' },
  { label: 'Teal', value: 'var(--brand-teal)' },
  { label: 'Olive', value: 'var(--brand-olive)' },
  { label: 'Danger', value: 'var(--brand-danger)' },
]
function setColor(value: string) {
  exec('foreColor', value)
  colorOpen.value = false
}
function setAlign(cmd: string) {
  exec(cmd)
  alignOpen.value = false
}

// Merge-token "Fields" pickers — one for Subject (plain text input), one for
// the body (contenteditable). Same token list, two insertion targets.
const MERGE_TOKENS = [
  { label: 'Candidate name', value: '{{candidate_name}}' },
  { label: 'Job title', value: '{{job_title}}' },
  { label: 'Company name', value: '{{company_name}}' },
  { label: 'Recruiter name', value: '{{recruiter_name}}' },
]
const subjectFieldsOpen = ref(false)
const bodyFieldsOpen = ref(false)

function insertSubjectToken(token: string) {
  const el = subjectEl.value
  if (!el) {
    subject.value += token
  }
  else {
    const start = el.selectionStart ?? subject.value.length
    const end = el.selectionEnd ?? subject.value.length
    subject.value = subject.value.slice(0, start) + token + subject.value.slice(end)
    nextTick(() => {
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }
  subjectFieldsOpen.value = false
}

function insertBodyToken(token: string) {
  bodyEl.value?.focus()
  document.execCommand('insertText', false, token)
  bodyFieldsOpen.value = false
}

const templatesOpen = ref(false)
const TEMPLATES = [
  { id: 'interview', name: 'Interview invitation', desc: 'Invite candidate to interview', subject: 'Interview invitation', body: 'Hi, we’d love to invite you to a first interview for the role. Are you available next week?' },
  { id: 'received', name: 'Application received', desc: 'Acknowledge application', subject: 'Application received', body: 'Thanks for applying — our team is reviewing your application and will be in touch shortly.' },
  { id: 'offer', name: 'Offer letter', desc: 'Extend an offer', subject: 'Offer letter', body: 'We’re excited to extend you an offer. Details are attached — let us know if you have questions.' },
  { id: 'reject', name: 'Rejection', desc: 'Politely decline', subject: 'Application update', body: 'Thank you for your time. We’ve decided to move forward with other candidates for this role.' },
]

function applyTemplate(t: typeof TEMPLATES[number]) {
  subject.value = t.subject
  if (bodyEl.value) bodyEl.value.innerText = t.body
  templatesOpen.value = false
}

const HISTORY = computed(() => [
  {
    id: 'h1',
    fromInitials: 'AH',
    title: `Interview invitation — ${props.profile.jobs[0]?.title ?? 'the role'}`,
    meta: `To ${props.profile.email} · Sent 9 Jul 2026, 14:22`,
    preview: 'Hi, we’d love to invite you to a first interview for the role. Are you available next week?',
    tone: 'sent' as const,
  },
  {
    id: 'h2',
    fromInitials: props.profile.initials,
    title: `Re: Interview invitation — ${props.profile.jobs[0]?.title ?? 'the role'}`,
    meta: `From ${props.profile.email} · Received 9 Jul 2026, 18:05`,
    preview: 'Thank you! Tuesday or Wednesday afternoon works well for me.',
    tone: 'received' as const,
  },
])
</script>

<template>
  <div class="p-6 pb-9 w-full">
    <!-- Segmented control -->
    <div class="inline-flex bg-[var(--brand-surface-hover)] rounded-[10px] p-[3px] mb-5">
      <button
        v-for="s in (['compose', 'history'] as const)"
        :key="s"
        type="button"
        class="text-[13.5px] font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
        :class="segment === s
          ? 'bg-[var(--brand-surface-white)] text-[var(--brand-teal)] shadow-[0_1px_2px_rgba(0,20,18,0.08)]'
          : 'text-[var(--brand-text-secondary)]'"
        @click="segment = s"
      >
        {{ s === 'compose' ? 'Send email' : 'Email history' }}
      </button>
    </div>

    <!-- Compose -->
    <div v-if="segment === 'compose'" class="border border-[var(--brand-border-light)] rounded-[14px] bg-[var(--brand-surface-white)]">
      <div class="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--brand-border-hairline)]">
        <span class="text-[13px] text-[var(--brand-text-quiet)] w-11 shrink-0">To</span>
        <span class="inline-flex items-center gap-2 bg-[var(--brand-surface-hover)] border border-[var(--brand-border)] rounded-lg px-2.5 py-1">
          <BrandAvatarInitials :initials="profile.initials" size="xs" />
          <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ profile.email }}</span>
        </span>
        <span class="ml-auto flex gap-3.5 text-[13px] font-bold text-[var(--brand-olive)]">
          <button type="button" class="cursor-pointer" @click="showCc = !showCc">Cc</button>
          <button type="button" class="cursor-pointer" @click="showBcc = !showBcc">Bcc</button>
        </span>
      </div>

      <div v-if="showCc" class="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--brand-border-hairline)]">
        <span class="text-[13px] text-[var(--brand-text-quiet)] w-11 shrink-0">Cc</span>
        <input type="text" placeholder="Add Cc recipients" class="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]">
      </div>
      <div v-if="showBcc" class="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--brand-border-hairline)]">
        <span class="text-[13px] text-[var(--brand-text-quiet)] w-11 shrink-0">Bcc</span>
        <input type="text" placeholder="Add Bcc recipients" class="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]">
      </div>

      <div class="flex items-center gap-2.5 px-4 py-2 border-b border-[var(--brand-border-hairline)]">
        <span class="text-[13px] text-[var(--brand-text-quiet)] w-11 shrink-0">Subject</span>
        <input ref="subjectEl" v-model="subject" type="text" placeholder="Subject" class="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] font-semibold text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)] placeholder:font-normal">
        <span class="relative inline-flex shrink-0">
          <button
            type="button"
            class="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] cursor-pointer"
            @click="subjectFieldsOpen = !subjectFieldsOpen"
          >
            <Braces class="w-3.5 h-3.5" stroke-width="1.8" />Fields<ChevronDown class="w-3 h-3" stroke-width="2" />
          </button>
          <div
            v-if="subjectFieldsOpen"
            class="absolute top-[calc(100%+8px)] right-0 w-[210px] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-xl shadow-[0_16px_48px_rgba(0,20,18,0.2)] z-20 p-1.5"
          >
            <button
              v-for="tok in MERGE_TOKENS"
              :key="tok.value"
              type="button"
              class="w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer"
              @click="insertSubjectToken(tok.value)"
            >{{ tok.label }}</button>
          </div>
        </span>
      </div>

      <div class="px-3 pt-3">
        <!-- Formatting toolbar — real document.execCommand controls on the contenteditable body below -->
        <div class="flex items-center gap-0.5 flex-wrap bg-[var(--brand-canvas)] rounded-lg p-1 mb-3">
          <select
            class="h-7 rounded-md border-none bg-transparent px-1.5 text-[12.5px] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer outline-none"
            @change="exec('fontName', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="f in FONT_FAMILIES" :key="f.value" :value="f.value">{{ f.label }}</option>
          </select>
          <select
            v-model="fontSize"
            class="h-7 rounded-md border-none bg-transparent px-1.5 text-[12.5px] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer outline-none"
            @change="exec('fontSize', fontSize)"
          >
            <option v-for="s in FONT_SIZES" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <span class="w-px h-[18px] bg-[var(--brand-border)] mx-1" />
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Bold" @click="exec('bold')"><Bold class="w-3.5 h-3.5" stroke-width="2.2" /></button>
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Italic" @click="exec('italic')"><Italic class="w-3.5 h-3.5" stroke-width="2.2" /></button>
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Underline" @click="exec('underline')"><Underline class="w-3.5 h-3.5" stroke-width="2.2" /></button>
          <span class="relative inline-flex">
            <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Text color" @click="colorOpen = !colorOpen"><Palette class="w-3.5 h-3.5" stroke-width="1.9" /></button>
            <div
              v-if="colorOpen"
              class="absolute top-[calc(100%+6px)] left-0 flex gap-1.5 bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-lg shadow-[0_16px_48px_rgba(0,20,18,0.2)] z-20 p-2"
            >
              <button
                v-for="c in COLOR_SWATCHES"
                :key="c.value"
                type="button"
                class="w-5 h-5 rounded-full border border-[var(--brand-border)] cursor-pointer"
                :style="{ background: c.value }"
                :title="c.label"
                @click="setColor(c.value)"
              />
            </div>
          </span>
          <span class="w-px h-[18px] bg-[var(--brand-border)] mx-1" />
          <span class="relative inline-flex">
            <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Alignment" @click="alignOpen = !alignOpen"><AlignLeft class="w-3.5 h-3.5" stroke-width="1.9" /></button>
            <div
              v-if="alignOpen"
              class="absolute top-[calc(100%+6px)] left-0 flex gap-0.5 bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-lg shadow-[0_16px_48px_rgba(0,20,18,0.2)] z-20 p-1"
            >
              <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="setAlign('justifyLeft')"><AlignLeft class="w-3.5 h-3.5" stroke-width="1.9" /></button>
              <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="setAlign('justifyCenter')"><AlignCenter class="w-3.5 h-3.5" stroke-width="1.9" /></button>
              <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="setAlign('justifyRight')"><AlignRight class="w-3.5 h-3.5" stroke-width="1.9" /></button>
            </div>
          </span>
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Numbered list" @click="exec('insertOrderedList')"><ListOrdered class="w-3.5 h-3.5" stroke-width="1.9" /></button>
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Bulleted list" @click="exec('insertUnorderedList')"><List class="w-3.5 h-3.5" stroke-width="1.9" /></button>
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Decrease indent" @click="exec('outdent')"><Outdent class="w-3.5 h-3.5" stroke-width="1.9" /></button>
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Increase indent" @click="exec('indent')"><Indent class="w-3.5 h-3.5" stroke-width="1.9" /></button>
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Quote" @click="exec('formatBlock', 'blockquote')"><Quote class="w-3.5 h-3.5" stroke-width="1.9" /></button>
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Strikethrough" @click="exec('strikeThrough')"><Strikethrough class="w-3.5 h-3.5" stroke-width="2" /></button>
          <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-white)] cursor-pointer" title="Clear formatting" @click="exec('removeFormat')"><Eraser class="w-3.5 h-3.5" stroke-width="1.9" /></button>
        </div>

        <div
          ref="bodyEl"
          contenteditable="true"
          data-placeholder="Write your message…"
          class="email-body-editable w-full min-h-[132px] box-border outline-none text-[14px] leading-[1.6] text-[var(--brand-text)] empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--brand-text-quiet)]"
        />

        <div class="opacity-55 mt-3.5 mb-3 text-[13.5px] leading-[1.55] text-[var(--brand-text-muted)]">
          Best regards,<br>
          <span class="font-bold text-[var(--brand-text)]">{{ profile.owner }}</span><br>
          Talent Acquisition · Recruitera<br>
          <span class="text-[var(--brand-teal-secondary)]">{{ profile.ownerInitials.toLowerCase() }}@recruitera.ai</span>
        </div>
      </div>

      <div class="flex items-center gap-2.5 px-4 py-3 border-t border-[var(--brand-border-hairline)]">
        <span class="relative inline-flex">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-text)] bg-[var(--brand-surface-hover)] border border-[var(--brand-border)] rounded-[9px] px-3 py-2 cursor-pointer"
            @click="templatesOpen = !templatesOpen"
          >
            <LayoutTemplate class="w-3.5 h-3.5 text-[var(--brand-icon-default)]" stroke-width="1.8" />Templates
            <ChevronDown class="w-3 h-3 text-[var(--brand-icon-default)]" stroke-width="2" />
          </button>
          <div
            v-if="templatesOpen"
            class="absolute bottom-[calc(100%+8px)] left-0 w-[280px] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-xl shadow-[0_16px_48px_rgba(0,20,18,0.2)] z-20 p-1.5"
          >
            <div class="text-[11px] font-bold tracking-[0.04em] uppercase text-[var(--brand-text-quiet)] px-2.5 pt-1.5 pb-1">Email templates</div>
            <button
              v-for="t in TEMPLATES"
              :key="t.id"
              type="button"
              class="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[var(--brand-surface-hover)] cursor-pointer"
              @click="applyTemplate(t)"
            >
              <div class="text-[14px] font-semibold text-[var(--brand-text)]">{{ t.name }}</div>
              <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ t.desc }}</div>
            </button>
          </div>
        </span>
        <span class="relative inline-flex">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-text)] bg-[var(--brand-surface-hover)] border border-[var(--brand-border)] rounded-[9px] px-3 py-2 cursor-pointer"
            @click="bodyFieldsOpen = !bodyFieldsOpen"
          >
            <Braces class="w-3.5 h-3.5 text-[var(--brand-icon-default)]" stroke-width="1.8" />Insert field
          </button>
          <div
            v-if="bodyFieldsOpen"
            class="absolute bottom-[calc(100%+8px)] left-0 w-[210px] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-xl shadow-[0_16px_48px_rgba(0,20,18,0.2)] z-20 p-1.5"
          >
            <button
              v-for="tok in MERGE_TOKENS"
              :key="tok.value"
              type="button"
              class="w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer"
              @click="insertBodyToken(tok.value)"
            >{{ tok.label }}</button>
          </div>
        </span>
        <button type="button" class="w-[33px] h-[33px] inline-flex items-center justify-center border border-[var(--brand-border)] rounded-[9px] text-[var(--brand-text)] bg-[var(--brand-surface-hover)] cursor-pointer" title="Attach file">
          <Paperclip class="w-4 h-4" stroke-width="1.8" />
        </button>
        <BrandButton variant="primary-teal" size="md" class="ml-auto">
          Send email<Send class="w-3.5 h-3.5" stroke-width="1.9" />
        </BrandButton>
      </div>
    </div>

    <!-- History -->
    <div v-else class="flex flex-col gap-3">
      <div v-for="h in HISTORY" :key="h.id" class="border border-[var(--brand-border-light)] rounded-xl px-[18px] py-4 bg-[var(--brand-surface-white)]">
        <div class="flex items-center gap-2.5">
          <BrandAvatarInitials :initials="h.fromInitials" size="sm" />
          <div class="flex-1 min-w-0">
            <div class="font-bold text-[14px] text-[var(--brand-text)] truncate">{{ h.title }}</div>
            <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ h.meta }}</div>
          </div>
          <span
            class="text-[12px] font-semibold rounded-md px-2.5 py-[3px] shrink-0"
            :class="h.tone === 'sent'
              ? 'text-[var(--brand-olive)] bg-[var(--brand-lime-active-bg)] border border-[var(--brand-lime)]/55'
              : 'text-[var(--brand-text-secondary)] bg-[var(--brand-surface-hover)] border border-[var(--brand-border)]'"
          >{{ h.tone === 'sent' ? 'Sent' : 'Received' }}</span>
        </div>
        <div class="text-[13.5px] text-[var(--brand-text-muted)] leading-[1.55] mt-2.5">{{ h.preview }}</div>
      </div>
      <p v-if="!HISTORY.length" class="flex items-center gap-2 text-[13.5px] text-[var(--brand-text-quiet)]">
        <Mail class="w-4 h-4" stroke-width="1.7" />No emails sent yet.
      </p>
    </div>
  </div>
</template>
