<!--
  Candidate Profile → Emails tab. A segmented "Send email / Email history"
  switch. Compose reuses the shared <EmailComposer> (the same editor design as
  Settings → Email templates) wrapped with a To / Cc / Bcc recipient header and
  a Send action; history is a static list of prior emails (sent/received).

  No write endpoint exists yet, so Send is a visual no-op — everything here is
  local component state, matching the interactivity the mockup has.
-->
<script setup lang="ts">
import { Mail, ChevronDown, Check } from 'lucide-vue-next'
import { BrandAvatarInitials } from '~/components/brand'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import EmailComposer from '~/components/EmailComposer.vue'
import CandidateRecipientField from '~/components/candidates/CandidateRecipientField.vue'
import type { CandidateProfile } from '~/types'

const props = defineProps<{ profile: CandidateProfile }>()

const segment = ref<'compose' | 'history'>('compose')
const showCc = ref(false)
const showBcc = ref(false)

// The "To" chip is a dropdown tag — pick which of the candidate's addresses to
// send to. Only one email exists in the model today, so the list has one entry;
// the affordance is ready for when candidates carry multiple addresses.
const toOpen = ref(false)
const recipientEmails = computed(() => [props.profile.email].filter(Boolean))
const selectedEmail = ref(props.profile.email)
function pickEmail(email: string) { selectedEmail.value = email; toOpen.value = false }

const subject = ref('')
const body = ref('')

const sent = ref(false)
function sendEmail() {
  // TODO: POST to /api/candidates/:id/emails once the endpoint exists.
  sent.value = true
  setTimeout(() => {
    sent.value = false
    subject.value = ''
    body.value = ''
  }, 1400)
}
function cancelCompose() {
  subject.value = ''
  body.value = ''
}

const HISTORY = computed(() => [
  {
    id: 'h1', fromInitials: 'AH',
    title: `Interview invitation — ${props.profile.jobs[0]?.title ?? 'the role'}`,
    meta: `To ${props.profile.email} · Sent 9 Jul 2026, 14:22`,
    preview: 'Hi, we’d love to invite you to a first interview for the role. Are you available next week?',
    tone: 'sent' as const,
  },
  {
    id: 'h2', fromInitials: props.profile.initials,
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
      >{{ s === 'compose' ? 'Send email' : 'Email history' }}</button>
    </div>

    <!-- Compose -->
    <div v-if="segment === 'compose'">
      <!-- Recipient header -->
      <div class="border border-[var(--brand-border-light)] rounded-[12px] bg-[var(--brand-surface-white)] mb-3 overflow-hidden">
        <div class="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--brand-border-hairline)]">
          <span class="text-[13px] text-[var(--brand-text-quiet)] w-11 shrink-0">To</span>
          <Popover v-model:open="toOpen">
            <PopoverTrigger as-child>
              <button type="button" class="inline-flex items-center gap-2 bg-[var(--brand-surface-hover)] border border-[var(--brand-border)] rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:border-[var(--brand-border-mid)] transition-colors">
                <BrandAvatarInitials :initials="profile.initials" size="xs" />
                <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ selectedEmail }}</span>
                <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)] transition-transform" :class="{ 'rotate-180': toOpen }" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-[280px] p-1.5 rounded-[12px]">
              <div class="px-2.5 pt-1.5 pb-1 text-[11px] font-bold tracking-[0.05em] text-[var(--brand-text-quiet)]">CANDIDATE EMAIL</div>
              <button
                v-for="em in recipientEmails"
                :key="em"
                type="button"
                class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
                @click="pickEmail(em)"
              >
                <BrandAvatarInitials :initials="profile.initials" size="xs" />
                <span class="flex-1 min-w-0 text-[13.5px] font-semibold text-[var(--brand-text)] truncate">{{ em }}</span>
                <Check v-if="em === selectedEmail" class="w-4 h-4 text-[var(--brand-teal)] shrink-0" stroke-width="2.4" />
              </button>
            </PopoverContent>
          </Popover>
          <span class="ml-auto flex gap-3.5 text-[13px] font-bold text-[var(--brand-olive)]">
            <button type="button" class="cursor-pointer" @click="showBcc = !showBcc">Bcc</button>
            <button type="button" class="cursor-pointer" @click="showCc = !showCc">Cc</button>
          </span>
        </div>
        <CandidateRecipientField v-if="showBcc" label="Bcc" placeholder="Add Bcc recipients" />
        <CandidateRecipientField v-if="showCc" label="Cc" placeholder="Add Cc recipients" />
      </div>

      <!-- Shared email editor + send footer (same design as Settings, plus the
           compose footer: visibility · Attach · Cancel / Send later / Send) -->
      <EmailComposer
        v-model:subject="subject"
        v-model:body="body"
        subject-placeholder="Subject line"
        min-height="180px"
        show-footer
        :send-label="sent ? 'Sent ✓' : 'Send'"
        @send="sendEmail"
        @send-later="sendEmail"
        @cancel="cancelCompose"
      />
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
