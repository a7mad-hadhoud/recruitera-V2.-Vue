<!--
  Bulk "Send email" modal for the candidates table selection toolbar. Wraps the
  shared <EmailComposer> so bulk email uses the exact same editor (placeholders,
  Insert…, attachments) as the candidate profile and Settings → Email templates.
  Sending is a visual no-op until a bulk-email endpoint exists.
-->
<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import EmailComposer from '~/components/EmailComposer.vue'

const props = defineProps<{ count: number }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ sent: [] }>()

const subject = ref('')
const body = ref('')
const sent = ref(false)

function send() {
  // TODO: POST to /api/candidates/bulk/email once the endpoint exists.
  sent.value = true
  setTimeout(() => {
    sent.value = false
    open.value = false
    emit('sent')
  }, 900)
}
watch(open, (v) => { if (!v) { subject.value = ''; body.value = ''; sent.value = false } })
</script>

<template>
  <Dialog v-model:open="open">
    <DialogScrollContent class="max-w-[720px] p-0 gap-0 overflow-hidden">
      <DialogHeader class="px-[26px] py-[22px] border-b border-[var(--brand-border-hairline)] space-y-1 text-left">
        <DialogTitle class="text-[20px] font-bold text-[var(--brand-text)] tracking-[-0.01em]">Send email</DialogTitle>
        <DialogDescription class="text-[14px] text-[var(--brand-text-secondary)] flex items-center gap-1.5">
          <Users class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
          To {{ count }} selected candidate{{ count === 1 ? '' : 's' }}
        </DialogDescription>
      </DialogHeader>

      <div class="px-[26px] py-5 bg-[var(--brand-canvas)] max-h-[76vh] overflow-y-auto">
        <EmailComposer
          v-model:subject="subject"
          v-model:body="body"
          subject-placeholder="Subject line"
          min-height="200px"
          show-footer
          :send-label="sent ? 'Sent ✓' : `Send to ${count}`"
          @send="send"
          @send-later="send"
          @cancel="open = false"
        />
      </div>
    </DialogScrollContent>
  </Dialog>
</template>
