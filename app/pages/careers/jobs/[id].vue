<script setup lang="ts">
import { Briefcase, Check, Clock, Copy, MapPin } from 'lucide-vue-next'
import CareerSiteGate from '~/components/careers/CareerSiteGate.vue'
import CareerSiteHeader from '~/components/careers/CareerSiteHeader.vue'
import CareerSiteFooter from '~/components/careers/CareerSiteFooter.vue'
import CareerSiteJobCard from '~/components/careers/CareerSiteJobCard.vue'
import GeneralApplicationCta from '~/components/careers/GeneralApplicationCta.vue'
import JobApplicationModal from '~/components/careers/JobApplicationModal.vue'
import ReferSomeoneModal from '~/components/careers/ReferSomeoneModal.vue'

definePageMeta({ layout: false })

const site = useCareerSite()
const { t } = useCareerSiteI18n()
const route = useRoute()
const { jobs: allJobs } = useJobs()
const portal = useEmployeePortalStore()
onMounted(() => portal.restore())

const job = computed(() => allJobs.value.find(j => j.id === route.params.id))
const isAccessible = computed(() => {
  if (!job.value) return false
  if (job.value.status === 'published') return true
  if (job.value.status === 'internal') return portal.isVerified
  return false
})
const isClosed = computed(() => job.value && !isAccessible.value && ['closed', 'archived', 'draft'].includes(job.value.status))

const recommendations = computed(() => {
  if (!job.value) return []
  return allJobs.value.filter(j => j.status === 'published' && j.department === job.value!.department && j.id !== job.value!.id).slice(0, 6)
})

function daysAgo(iso: string) {
  const d = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000))
  return d === 0 ? 'Today' : d === 1 ? '1d ago' : `${d}d ago`
}

const applyOpen = ref(false)
const referOpen = ref(false)
const { referralLink } = useReferrals()
const linkCopied = ref(false)
async function copyReferralLink() {
  if (!job.value || !portal.email) return
  try { await navigator.clipboard.writeText(referralLink(job.value.id, portal.email)) } catch { /* clipboard unavailable */ }
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2000)
}
</script>

<template>
  <CareerSiteGate>
    <div class="min-h-screen bg-white" :style="{ fontFamily: `${site.font}, system-ui, sans-serif` }">
      <CareerSiteHeader />

      <div v-if="!job" class="mx-auto max-w-[720px] px-6 py-20 text-center">
        <p class="text-[15px] font-semibold text-[var(--brand-preview-text-heading)]">Job not found.</p>
        <NuxtLink to="/careers/opportunities" class="mt-3 inline-block text-[13px] font-semibold no-underline" :style="{ color: site.primaryColor }">{{ t('nav_opportunities') }} →</NuxtLink>
      </div>

      <div v-else-if="!isAccessible" class="mx-auto max-w-[720px] px-6 py-16">
        <div v-if="isClosed" class="text-center">
          <p class="mb-6 text-[16px] font-semibold text-[var(--brand-preview-text-heading)]">{{ t('job_closed_title') }}</p>
          <template v-if="recommendations.length">
            <div class="mb-6 text-[13px] font-semibold text-[var(--brand-preview-text-label)]">{{ t('job_closed_recommendations') }}</div>
            <div class="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
              <CareerSiteJobCard v-for="j in recommendations" :key="j.id" :job="j" />
            </div>
          </template>
        </div>
        <div v-else class="text-center">
          <p class="text-[15px] font-semibold text-[var(--brand-preview-text-heading)]">This role is only visible to verified employees.</p>
        </div>
      </div>

      <template v-else>
        <div class="mx-auto max-w-[820px] px-6 py-10">
          <NuxtLink to="/careers/opportunities" class="mb-4 inline-block text-[12.5px] font-semibold no-underline" :style="{ color: site.primaryColor }">← {{ t('job_back') }}</NuxtLink>

          <div class="mb-2 flex flex-wrap gap-1.5">
            <span class="rounded-md px-2 py-0.5 text-[11px] font-bold" :style="{ background: `${site.primaryColor}18`, color: site.primaryColor }">{{ job.employmentType }}</span>
            <span class="rounded-md bg-[var(--brand-preview-surface-alt)] px-2 py-0.5 text-[11px] font-bold text-[var(--brand-preview-text-label)]">{{ job.collar === 'white' ? t('filter_job_type_white') : t('filter_job_type_blue') }}</span>
            <span v-if="job.status === 'internal'" class="rounded-md px-2 py-0.5 text-[11px] font-bold text-white" :style="{ background: site.headerColor }">{{ t('nav_internal_opportunities') }}</span>
          </div>
          <h1 class="mb-2 text-[26px] font-extrabold text-[var(--brand-preview-text-heading)]">{{ job.title }}</h1>
          <div class="mb-6 flex flex-wrap items-center gap-4 text-[13px] text-[var(--brand-preview-text-muted)]">
            <span class="inline-flex items-center gap-1.5"><MapPin :size="13" />{{ job.location || 'Remote' }}</span>
            <span class="inline-flex items-center gap-1.5"><Clock :size="13" />{{ daysAgo(job.createdAt) }}</span>
            <span class="inline-flex items-center gap-1.5"><Briefcase :size="13" />{{ job.department }}</span>
          </div>

          <div class="mb-6 flex flex-wrap gap-2">
            <button type="button" class="rounded-xl px-5 py-2.5 text-[13.5px] font-bold text-white" :style="{ background: site.ctaColor }" @click="applyOpen = true">{{ t('job_apply') }}</button>
            <template v-if="portal.isVerified">
              <button type="button" class="rounded-xl border-[1.5px] px-5 py-2.5 text-[13.5px] font-bold" :style="{ borderColor: site.primaryColor, color: site.primaryColor }" @click="referOpen = true">{{ t('job_refer_someone') }}</button>
              <button type="button" class="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] px-5 py-2.5 text-[13.5px] font-bold" :style="{ borderColor: site.primaryColor, color: site.primaryColor }" @click="copyReferralLink">
                <Check v-if="linkCopied" :size="14" /><Copy v-else :size="14" />{{ linkCopied ? 'Copied!' : t('job_copy_referral_link') }}
              </button>
            </template>
          </div>

          <section class="mb-6">
            <h2 class="mb-2 text-[16px] font-bold text-[var(--brand-preview-text-heading)]">{{ t('job_description') }}</h2>
            <p class="text-[14px] leading-[1.7] text-[var(--brand-preview-text-body)]">{{ job.description }}</p>
          </section>
          <section v-if="job.responsibilities?.length" class="mb-6">
            <h2 class="mb-2 text-[16px] font-bold text-[var(--brand-preview-text-heading)]">{{ t('job_responsibilities') }}</h2>
            <ul class="list-disc space-y-1.5 pl-5 text-[14px] leading-[1.6] text-[var(--brand-preview-text-body)]">
              <li v-for="(r, i) in job.responsibilities" :key="i">{{ r }}</li>
            </ul>
          </section>
          <section v-if="job.requirements?.length" class="mb-6">
            <h2 class="mb-2 text-[16px] font-bold text-[var(--brand-preview-text-heading)]">{{ t('job_requirements') }}</h2>
            <ul class="list-disc space-y-1.5 pl-5 text-[14px] leading-[1.6] text-[var(--brand-preview-text-body)]">
              <li v-for="(r, i) in job.requirements" :key="i">{{ r }}</li>
            </ul>
          </section>
        </div>
      </template>

      <GeneralApplicationCta v-if="job && isClosed" />

      <CareerSiteFooter />
    </div>

    <JobApplicationModal v-if="job" v-model:open="applyOpen" :job="job" />
    <ReferSomeoneModal v-if="job" v-model:open="referOpen" :job="job" />
  </CareerSiteGate>
</template>
