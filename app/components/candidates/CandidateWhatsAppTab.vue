<!--
  Candidate Profile → WhatsApp tab. Ported from the reference mockup's
  data-panel="whatsapp": a header card (WhatsApp glyph + status + Start
  chat action), a policy empty-state ("candidate must message first"), and
  a chat thread view once a conversation exists.

  `chatStarted` is local UI state mirroring the mockup's own toggle between
  its `.cp-wa-empty` and `.cp-wa-chat` blocks — no messaging backend exists,
  so "Start chat" / the template picker / Send are visual only.
-->
<script setup lang="ts">
import { Paperclip, LayoutTemplate, Send, ShieldCheck, Check, MessageCircle } from 'lucide-vue-next'
import type { CandidateProfile } from '~/types'

defineProps<{ profile: CandidateProfile }>()

const chatStarted = ref(false)
const templatesOpen = ref(false)
const draft = ref('')

const TEMPLATES = [
  { id: 't1', name: 'Interview invitation', category: 'Recruitment · Scheduling', body: 'Hi [First Name], thanks for applying to the [Job Title] role. We’d love to invite you to an interview — are you available this week?' },
  { id: 't2', name: 'Application received', category: 'Recruitment · Acknowledgement', body: 'Hi [First Name], we’ve received your application and our team is reviewing it. We’ll be in touch shortly.' },
  { id: 't3', name: 'Request documents', category: 'Recruitment · Documents', body: 'Hi [First Name], could you please share your updated CV and portfolio? Thank you!' },
]

function applyTemplate(t: typeof TEMPLATES[number]) {
  draft.value = t.body
  templatesOpen.value = false
}

interface ChatMessage { id: string, from: 'candidate' | 'me', text: string, time: string }
interface ChatDay { label: string, messages: ChatMessage[] }

const THREAD: ChatDay[] = [
  {
    label: 'Yesterday',
    messages: [
      { id: 'm1', from: 'candidate', text: 'Hello! I saw the Senior Product Designer role on LinkedIn. Is it still open?', time: '10:42 AM' },
      { id: 'm2', from: 'me', text: 'Hi, thanks for reaching out! Yes, the role is still open.', time: '10:45 AM' },
      { id: 'm3', from: 'candidate', text: 'Would you be available for a quick intro call this week?', time: '10:42 AM' },
    ],
  },
  {
    label: 'Today',
    messages: [
      { id: 'm4', from: 'me', text: 'Yes, sure. I’m available on Sunday or Monday afternoon.', time: '10:45 AM' },
    ],
  },
]
</script>

<template>
  <div class="p-6 pb-9 w-full">
    <!-- Header -->
    <div class="flex items-center gap-3 px-[18px] py-3.5 border border-[var(--brand-border-light)] rounded-xl bg-[var(--brand-surface-white)] mb-3.5">
      <span class="w-[34px] h-[34px] rounded-[9px] bg-[var(--brand-whatsapp)] inline-flex items-center justify-center shrink-0">
        <MessageCircle class="w-[18px] h-[18px] text-white" stroke-width="2" fill="currentColor" />
      </span>
      <div>
        <div class="font-bold text-[14px] text-[var(--brand-text)]">WhatsApp Chat</div>
        <div class="flex items-center gap-1.5 text-[12px] text-[var(--brand-text-quiet)] mt-0.5">
          <span class="w-[6px] h-[6px] rounded-full shrink-0" :class="chatStarted ? 'bg-[var(--brand-whatsapp)]' : 'bg-[var(--brand-border-mid)]'" />
          {{ chatStarted ? 'Chat active' : 'Waiting for candidate message' }}
        </div>
      </div>
      <button
        type="button"
        class="ml-auto inline-flex items-center gap-2 font-semibold text-[13.5px] text-white bg-[var(--brand-teal)] rounded-[10px] px-3.5 py-2 cursor-pointer shrink-0"
        @click="chatStarted = !chatStarted"
      >
        <Send class="w-[15px] h-[15px]" stroke-width="1.9" />{{ chatStarted ? 'End chat' : 'Start chat' }}
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="!chatStarted"
      class="flex flex-col items-center justify-center text-center px-6 py-14 border border-[var(--brand-border-hairline)] rounded-[14px] bg-[var(--brand-canvas)]"
    >
      <span class="relative w-[76px] h-[76px] mb-6 rounded-full bg-[var(--brand-surface-hover)] inline-flex items-center justify-center">
        <MessageCircle class="w-9 h-9 text-[var(--brand-border-mid)]" stroke-width="1.5" />
        <span class="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full bg-[var(--brand-whatsapp)] inline-flex items-center justify-center shadow-[0_3px_10px_rgba(37,211,102,0.4)]">
          <Send class="w-3 h-3 text-white" stroke-width="2.4" />
        </span>
      </span>
      <div class="text-[16px] font-semibold text-[var(--brand-text)] max-w-[400px] leading-[1.4]">
        You can only start chatting after the candidate sends the first message on WhatsApp
      </div>
      <div class="text-[13.5px] text-[var(--brand-text-quiet)] mt-3 max-w-[360px] leading-[1.55]">
        Due to WhatsApp policies, you can only initiate conversations using approved message templates.
      </div>
      <a href="#" class="text-[13.5px] font-bold text-[var(--brand-teal-secondary)] mt-5 no-underline" @click.prevent>Learn more about WhatsApp policies</a>
    </div>

    <!-- Chat thread -->
    <div v-else class="flex flex-col border border-[var(--brand-border-light)] rounded-[14px] overflow-hidden bg-[var(--brand-canvas)]">
      <div class="flex flex-col gap-3.5 p-[22px] min-h-[300px]">
        <template v-for="day in THREAD" :key="day.label">
          <div class="flex justify-center my-1">
            <span class="text-[11px] font-bold tracking-[0.05em] text-[var(--brand-text-muted)] bg-[var(--brand-surface-hover)] rounded-full px-3 py-1">{{ day.label.toUpperCase() }}</span>
          </div>
          <div
            v-for="m in day.messages"
            :key="m.id"
            class="flex flex-col max-w-[74%]"
            :class="m.from === 'me' ? 'items-end ml-auto' : 'items-start'"
          >
            <div
              class="text-[14px] leading-[1.5] px-3.5 py-2.5"
              :class="m.from === 'me'
                ? 'bg-[var(--brand-whatsapp-bubble)] text-[var(--brand-text)] rounded-[14px_4px_14px_14px]'
                : 'bg-[var(--brand-surface-white)] border border-[var(--brand-border-hairline)] text-[var(--brand-text)] rounded-[4px_14px_14px_14px] shadow-[0_1px_2px_rgba(0,20,18,0.05)]'"
            >{{ m.text }}</div>
            <div class="flex items-center gap-1 text-[11.5px] text-[var(--brand-text-quiet)] mt-1" :class="m.from === 'me' ? 'mr-0.5' : 'ml-0.5'">
              {{ m.time }}
              <Check v-if="m.from === 'me'" class="w-[13px] h-[13px] text-[var(--brand-teal-secondary)]" stroke-width="2.2" />
            </div>
          </div>
        </template>
        <div class="flex justify-center my-0.5">
          <span class="inline-flex items-center gap-2 max-w-[400px] text-center text-[12px] text-[var(--brand-encryption-text)] bg-[var(--brand-encryption-bg)] border border-[var(--brand-encryption-border)] rounded-[10px] px-3.5 py-2 leading-[1.45]">
            <ShieldCheck class="w-[13px] h-[13px] shrink-0" stroke-width="1.8" />
            Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read them.
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2.5 px-4 py-3.5 border-t border-[var(--brand-border-hairline)] bg-[var(--brand-surface-white)]">
        <button type="button" class="w-[38px] h-[38px] inline-flex items-center justify-center rounded-full text-[var(--brand-text-subtle)] bg-[var(--brand-surface-hover)] shrink-0 cursor-pointer">
          <Paperclip class="w-[19px] h-[19px]" stroke-width="1.8" />
        </button>
        <div class="flex-1 min-w-0 flex items-center border border-[var(--brand-border-hairline)] rounded-full px-4 bg-[var(--brand-surface-hover)]">
          <input v-model="draft" type="text" placeholder="Type a message…" class="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)] py-2">
        </div>
        <span class="relative inline-flex shrink-0">
          <button
            type="button"
            class="inline-flex items-center gap-2 h-[38px] text-[13.5px] font-semibold text-[var(--brand-text-secondary)] bg-[var(--brand-surface-hover)] rounded-full px-4 cursor-pointer"
            @click="templatesOpen = !templatesOpen"
          >
            <LayoutTemplate class="w-[15px] h-[15px] text-[var(--brand-icon-default)]" stroke-width="1.8" />Templates
          </button>
          <div
            v-if="templatesOpen"
            class="absolute bottom-[calc(100%+10px)] right-0 w-[300px] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[14px] shadow-[0_18px_54px_rgba(0,20,18,0.22)] z-20 overflow-hidden"
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--brand-border-hairline)] bg-[var(--brand-canvas)]">
              <span class="text-[14px] font-bold text-[var(--brand-text)]">Approved templates</span>
            </div>
            <div class="p-1.5 max-h-[280px] overflow-y-auto">
              <button
                v-for="t in TEMPLATES"
                :key="t.id"
                type="button"
                class="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--brand-surface-hover)] cursor-pointer"
                @click="applyTemplate(t)"
              >
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-[13.5px] font-bold text-[var(--brand-text)]">{{ t.name }}</span>
                  <span class="text-[10.5px] font-bold uppercase tracking-[0.03em] text-[var(--brand-olive)] bg-[var(--brand-lime-active-bg)] border border-[var(--brand-lime)]/55 rounded px-1.5 py-[1px]">Approved</span>
                </div>
                <div class="text-[12px] text-[var(--brand-text-quiet)] mb-1">{{ t.category }}</div>
                <div class="text-[12.5px] text-[var(--brand-text-muted)] leading-[1.5] line-clamp-2">{{ t.body }}</div>
              </button>
            </div>
          </div>
        </span>
        <button type="button" class="w-10 h-10 inline-flex items-center justify-center rounded-full bg-[var(--brand-whatsapp)] text-white shrink-0 cursor-pointer">
          <Send class="w-[18px] h-[18px]" stroke-width="1.9" />
        </button>
      </div>
    </div>
  </div>
</template>
