<script setup lang="ts">
// Renders the admin-built Referral Form (Settings → Templates → Referral —
// already built, consumed read-only here). Mode 1 only; see spec for why
// Mode 2 (Employee Affiliate Link) stops at "Copy my referral link" + toast.
import { Upload, X } from 'lucide-vue-next'
import type { Job } from '~/types'

const props = defineProps<{ job: Job, open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const site = useCareerSite()
const { t } = useCareerSiteI18n()
const portal = useEmployeePortalStore()
const { addFormReferral } = useReferrals()
const { data: templatesData } = useReferralQuestions()
const template = computed(() => templatesData.value?.data.find(tpl => tpl.isDefault) ?? templatesData.value?.data[0])

const candidateName = ref('')
const candidateEmail = ref('')
const consent = ref(false)
const answers = ref<Record<string, string | string[]>>({})
const submitted = ref(false)
const error = ref('')

watch(() => props.open, (v) => {
  if (v) {
    candidateName.value = ''
    candidateEmail.value = ''
    consent.value = false
    answers.value = {}
    submitted.value = false
    error.value = ''
  }
})

function close() {
  emit('update:open', false)
}
function submit() {
  if (!candidateName.value.trim()) { error.value = t('field_required'); return }
  if (!consent.value) { error.value = 'Please confirm you have permission to share their information.'; return }
  error.value = ''
  addFormReferral({
    jobId: props.job.id,
    jobTitle: props.job.title,
    candidateName: candidateName.value.trim(),
    referrerEmail: portal.email ?? 'employee@company.com',
  })
  submitted.value = true
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" @click.self="close">
      <div class="max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white shadow-2xl" :style="{ fontFamily: `${site.font}, system-ui, sans-serif` }">
        <div class="sticky top-0 flex items-center justify-between border-b border-black/5 bg-white px-5 py-4">
          <div class="text-[15px] font-bold" :style="{ color: site.headerColor }">{{ t('job_refer_someone') }} — {{ props.job.title }}</div>
          <button type="button" class="grid size-7 place-items-center rounded-md hover:bg-black/5" aria-label="Close" @click="close">
            <X :size="16" />
          </button>
        </div>

        <div class="px-5 py-5">
          <template v-if="!submitted">
            <label class="mb-3 block">
              <span class="mb-1.5 block text-[13px] font-semibold text-[var(--brand-preview-text-label)]">Candidate full name *</span>
              <input v-model="candidateName" type="text" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-3 py-2.5 text-[14px] outline-none">
            </label>
            <label class="mb-3 block">
              <span class="mb-1.5 block text-[13px] font-semibold text-[var(--brand-preview-text-label)]">Candidate email</span>
              <input v-model="candidateEmail" type="email" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-3 py-2.5 text-[14px] outline-none">
            </label>

            <template v-for="q in template?.questions ?? []" :key="q.id">
              <label class="mb-3 block">
                <span class="mb-1.5 block text-[13px] font-semibold text-[var(--brand-preview-text-label)]">{{ q.q }}<span v-if="q.required"> *</span></span>
                <textarea v-if="q.type === 'Text (multiple lines)'" v-model="answers[q.id] as string" rows="3" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-3 py-2 text-[14px] outline-none" />
                <template v-else-if="q.type === 'Single choice' && q.options">
                  <div class="flex flex-col gap-1.5">
                    <label v-for="opt in q.options" :key="opt" class="inline-flex items-center gap-2 text-[13.5px]">
                      <input v-model="answers[q.id]" type="radio" :value="opt" :name="q.id">{{ opt }}
                    </label>
                  </div>
                </template>
                <input v-else v-model="answers[q.id] as string" type="text" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-3 py-2.5 text-[14px] outline-none">
              </label>
            </template>

            <label class="mb-4 flex cursor-pointer flex-col items-center gap-1.5 rounded-[9px] border-[1.5px] border-dashed border-[var(--brand-preview-border)] px-4 py-5 text-center">
              <Upload :size="18" class="text-[var(--brand-preview-text-muted)]" />
              <span class="text-[13px] font-semibold" :style="{ color: site.primaryColor }">Upload their CV</span>
              <input type="file" accept=".pdf,.doc,.docx" class="hidden">
            </label>

            <label class="mb-4 flex items-start gap-2 text-[12.5px] text-[var(--brand-preview-text-secondary)]">
              <input v-model="consent" type="checkbox" class="mt-0.5">
              I confirm I have this person's permission to share their information.
            </label>

            <p v-if="error" class="mb-3 text-[12px] text-[var(--brand-danger)]">{{ error }}</p>

            <button type="button" class="w-full rounded-xl px-4 py-2.5 text-[13.5px] font-bold text-white" :style="{ background: site.ctaColor }" @click="submit">
              {{ t('job_refer_someone') }}
            </button>
          </template>

          <div v-else class="py-6 text-center">
            <div class="mb-2 text-[16px] font-bold" :style="{ color: site.headerColor }">Your referral has been submitted.</div>
            <p class="text-[13px] text-[var(--brand-preview-text-muted)]">Track it under My Referrals.</p>
            <NuxtLink to="/careers/portal#referrals" class="mt-5 inline-block rounded-xl border-[1.5px] px-5 py-2 text-[13px] font-bold no-underline" :style="{ borderColor: site.primaryColor, color: site.primaryColor }" @click="close">My Referrals</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
