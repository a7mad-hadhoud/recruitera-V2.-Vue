<script setup lang="ts">
// Shared by public Apply and Internal Application (PRD: "no new form, same
// form schema" for internal applicants — only the resulting tag/source
// differs). Both write a real candidate via findOrCreateCandidate — same
// mechanism General Application uses — so "recorded in the ATS" (PRD AC)
// and "Internal tag on candidate" are genuinely demonstrable, not just a
// success toast. No pipeline-stage/knockout logic beyond that.
import { Upload, X } from 'lucide-vue-next'
import { findOrCreateCandidate } from '~/mocks/handlers/candidates.handlers'
import type { Job } from '~/types'

const props = defineProps<{ job: Job, open: boolean, internal?: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const site = useCareerSite()
const { t } = useCareerSiteI18n()
const portal = useEmployeePortalStore()

const fullName = ref('')
const email = ref(props.internal && portal.email ? portal.email : '')
const phone = ref('')
const resumeName = ref('')
const errors = reactive<{ fullName?: string, email?: string }>({})
const submitted = ref(false)

watch(() => props.open, (v) => {
  if (v) {
    fullName.value = ''
    email.value = props.internal && portal.email ? portal.email : ''
    phone.value = ''
    resumeName.value = ''
    errors.fullName = undefined
    errors.email = undefined
    submitted.value = false
  }
})

function close() {
  emit('update:open', false)
}
function onResume(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  resumeName.value = file?.name ?? ''
}
function submit() {
  errors.fullName = fullName.value.trim() ? undefined : t('field_required')
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
  errors.email = !email.value.trim() ? t('field_required') : !emailOk ? t('field_invalid_email') : undefined
  if (errors.fullName || errors.email) return
  findOrCreateCandidate({
    name: fullName.value,
    source: props.internal ? 'Internal Application' : 'Careers site',
    tags: props.internal ? ['Internal'] : [],
    jobTitle: props.job.title,
    jobStatus: props.job.status,
  })
  submitted.value = true
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" @click.self="close">
      <div class="max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white shadow-2xl" :style="{ fontFamily: `${site.font}, system-ui, sans-serif` }">
        <div class="sticky top-0 flex items-center justify-between border-b border-black/5 bg-white px-5 py-4">
          <div class="text-[15px] font-bold" :style="{ color: site.headerColor }">{{ props.job.title }}</div>
          <button type="button" class="grid size-7 place-items-center rounded-md hover:bg-black/5" aria-label="Close" @click="close">
            <X :size="16" />
          </button>
        </div>

        <div class="px-5 py-5">
          <template v-if="!submitted">
            <label class="mb-3 block">
              <span class="mb-1.5 block text-[13px] font-semibold text-[var(--brand-preview-text-label)]">Full Name *</span>
              <input v-model="fullName" type="text" class="w-full rounded-[9px] border px-3 py-2.5 text-[14px] outline-none" :style="{ borderColor: errors.fullName ? 'var(--brand-danger)' : 'var(--brand-preview-border)' }">
              <span v-if="errors.fullName" class="mt-1 block text-[12px] text-[var(--brand-danger)]">{{ errors.fullName }}</span>
            </label>
            <label class="mb-3 block">
              <span class="mb-1.5 block text-[13px] font-semibold text-[var(--brand-preview-text-label)]">Email *</span>
              <input v-model="email" type="email" class="w-full rounded-[9px] border px-3 py-2.5 text-[14px] outline-none" :style="{ borderColor: errors.email ? 'var(--brand-danger)' : 'var(--brand-preview-border)' }">
              <span v-if="errors.email" class="mt-1 block text-[12px] text-[var(--brand-danger)]">{{ errors.email }}</span>
            </label>
            <label class="mb-3 block">
              <span class="mb-1.5 block text-[13px] font-semibold text-[var(--brand-preview-text-label)]">Phone Number</span>
              <input v-model="phone" type="tel" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-3 py-2.5 text-[14px] outline-none">
            </label>
            <label class="mb-4 flex cursor-pointer flex-col items-center gap-1.5 rounded-[9px] border-[1.5px] border-dashed border-[var(--brand-preview-border)] px-4 py-5 text-center">
              <Upload :size="18" class="text-[var(--brand-preview-text-muted)]" />
              <span class="text-[13px] font-semibold" :style="{ color: site.primaryColor }">{{ resumeName || 'Upload a file' }}</span>
              <span class="text-[11.5px] text-[var(--brand-preview-text-muted)]">PDF, Word up to 10MB</span>
              <input type="file" accept=".pdf,.doc,.docx" class="hidden" @change="onResume">
            </label>
            <button type="button" class="w-full rounded-xl px-4 py-2.5 text-[13.5px] font-bold text-white" :style="{ background: site.ctaColor }" @click="submit">
              {{ t('job_apply') }}
            </button>
          </template>

          <div v-else class="py-6 text-center">
            <div class="mb-2 text-[16px] font-bold" :style="{ color: site.headerColor }">{{ t('general_app_success') }}</div>
            <p class="text-[13px] text-[var(--brand-preview-text-muted)]">{{ fullName }}, we'll be in touch about {{ props.job.title }}.</p>
            <button type="button" class="mt-5 rounded-xl border-[1.5px] px-5 py-2 text-[13px] font-bold" :style="{ borderColor: site.primaryColor, color: site.primaryColor }" @click="close">Close</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
