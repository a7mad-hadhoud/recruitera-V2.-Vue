<script setup lang="ts">
import { Filter, Search, X } from 'lucide-vue-next'
import CareerSiteGate from '~/components/careers/CareerSiteGate.vue'
import CareerSiteHeader from '~/components/careers/CareerSiteHeader.vue'
import CareerSiteFooter from '~/components/careers/CareerSiteFooter.vue'
import CareerSiteJobCard from '~/components/careers/CareerSiteJobCard.vue'
import GeneralApplicationCta from '~/components/careers/GeneralApplicationCta.vue'
import { CAREER_SITE_CATEGORIES, CAREER_SITE_CAREER_LEVELS, CAREER_SITE_EMPLOYMENT_TYPES } from '~/composables/useCareerSiteFilters'

definePageMeta({ layout: false })

const site = useCareerSite()
const { t } = useCareerSiteI18n()
const { jobs: allJobs } = useJobs()
const { data: locationsData } = useLocations()

// Dropdown filters — apply instantly on selection (PRD Feature 5 AC).
const category = ref('')
const employmentType = ref('')
const careerLevel = ref('')
const jobType = ref<'' | 'white' | 'blue'>('')

// Search + location — only applied on Find click / Enter (PRD Feature 5 AC).
const searchDraft = ref('')
const locationDraft = ref('')
const appliedSearch = ref('')
const appliedLocationId = ref('')
function find() {
  appliedSearch.value = searchDraft.value.trim()
  appliedLocationId.value = locationDraft.value
}

function locationMatches(jobLocation: string | null, locationId: string) {
  if (!locationId) return true
  const loc = locationsData.value?.data.find(l => l.id === locationId)
  if (!loc || !jobLocation) return false
  if (loc.city.toLowerCase() === 'worldwide') return jobLocation.toLowerCase() === 'remote'
  return jobLocation.toLowerCase() === loc.city.toLowerCase()
}

const openJobs = computed(() => allJobs.value.filter(j => j.status === 'published'))
const filteredJobs = computed(() => openJobs.value.filter((j) => {
  if (category.value && j.category !== category.value) return false
  if (employmentType.value && j.employmentType !== employmentType.value) return false
  if (careerLevel.value && j.careerLevel !== careerLevel.value) return false
  if (jobType.value && j.collar !== jobType.value) return false
  if (appliedSearch.value && !j.title.toLowerCase().includes(appliedSearch.value.toLowerCase())) return false
  if (appliedLocationId.value && !locationMatches(j.location, appliedLocationId.value)) return false
  return true
}))

const mobileFiltersOpen = ref(false)
function clearFilters() {
  category.value = ''; employmentType.value = ''; careerLevel.value = ''; jobType.value = ''
  searchDraft.value = ''; locationDraft.value = ''; appliedSearch.value = ''; appliedLocationId.value = ''
}
</script>

<template>
  <CareerSiteGate>
    <div class="min-h-screen bg-white" :style="{ fontFamily: `${site.font}, system-ui, sans-serif` }">
      <CareerSiteHeader />

      <div class="mx-auto max-w-[1200px] px-6 py-8">
        <h1 class="mb-5 text-[24px] font-extrabold text-[var(--brand-preview-text-heading)]">{{ t('nav_opportunities') }}</h1>

        <div class="flex flex-col gap-6 sm:flex-row">
          <!-- Filters panel — desktop -->
          <aside class="hidden w-[220px] shrink-0 flex-col gap-4 sm:flex">
            <div>
              <label class="mb-1 block text-[12px] font-semibold text-[var(--brand-preview-text-label)]">{{ t('filter_category') }}</label>
              <select v-model="category" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-2.5 py-2 text-[13px]">
                <option value="">{{ t('filter_choose_category') }}</option>
                <option v-for="c in CAREER_SITE_CATEGORIES" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-[12px] font-semibold text-[var(--brand-preview-text-label)]">{{ t('filter_type') }}</label>
              <select v-model="employmentType" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-2.5 py-2 text-[13px]">
                <option value="">{{ t('filter_choose_type') }}</option>
                <option v-for="ty in CAREER_SITE_EMPLOYMENT_TYPES" :key="ty" :value="ty">{{ ty }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-[12px] font-semibold text-[var(--brand-preview-text-label)]">{{ t('filter_career_level') }}</label>
              <select v-model="careerLevel" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-2.5 py-2 text-[13px]">
                <option value="">{{ t('filter_choose_level') }}</option>
                <option v-for="lv in CAREER_SITE_CAREER_LEVELS" :key="lv" :value="lv">{{ lv }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-[12px] font-semibold text-[var(--brand-preview-text-label)]">{{ t('filter_job_type') }}</label>
              <select v-model="jobType" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-2.5 py-2 text-[13px]">
                <option value="">{{ t('filter_job_type') }}</option>
                <option value="white">{{ t('filter_job_type_white') }}</option>
                <option value="blue">{{ t('filter_job_type_blue') }}</option>
              </select>
            </div>
            <button type="button" class="self-start text-[12px] font-semibold underline" :style="{ color: site.primaryColor }" @click="clearFilters">Clear filters</button>
          </aside>

          <!-- Mobile: filter drawer trigger -->
          <button type="button" class="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--brand-preview-border)] px-3.5 py-2 text-[13px] font-semibold sm:hidden" @click="mobileFiltersOpen = true">
            <Filter :size="14" />Filters
          </button>

          <div class="min-w-0 flex-1">
            <!-- Search + location + Find -->
            <div class="mb-4 flex flex-col gap-2 sm:flex-row">
              <div class="flex flex-1 items-center gap-2 rounded-[9px] border border-[var(--brand-preview-border)] px-3 py-2">
                <Search :size="14" class="shrink-0 text-[var(--brand-preview-text-muted)]" />
                <input v-model="searchDraft" type="text" :placeholder="t('filter_search_placeholder')" class="min-w-0 flex-1 border-none text-[13.5px] outline-none" @keydown.enter="find">
              </div>
              <select v-model="locationDraft" class="rounded-[9px] border border-[var(--brand-preview-border)] px-2.5 py-2 text-[13.5px] sm:w-[180px]">
                <option value="">{{ t('filter_choose_location') }}</option>
                <option v-for="loc in locationsData?.data ?? []" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
              </select>
              <button type="button" class="shrink-0 rounded-[9px] px-5 py-2 text-[13.5px] font-bold text-white" :style="{ background: site.primaryColor }" @click="find">{{ t('filter_find') }}</button>
            </div>

            <div class="mb-3.5 text-[13px] text-[var(--brand-preview-text-muted)]">{{ t('filter_found_jobs', { n: filteredJobs.length }) }}</div>

            <div v-if="filteredJobs.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CareerSiteJobCard v-for="j in filteredJobs" :key="j.id" :job="j" />
            </div>
            <div v-else class="rounded-2xl border border-dashed border-[var(--brand-preview-border-card)] px-6 py-14 text-center text-[13.5px] text-[var(--brand-preview-text-muted)]">
              {{ t('filter_no_results') }}
            </div>

            <GeneralApplicationCta />
          </div>
        </div>
      </div>

      <CareerSiteFooter />
    </div>

    <!-- Mobile filter drawer -->
    <Teleport to="body">
      <div v-if="mobileFiltersOpen" class="fixed inset-0 z-50 flex sm:hidden" @click.self="mobileFiltersOpen = false">
        <div class="absolute inset-0 bg-black/40" @click="mobileFiltersOpen = false" />
        <div class="relative ml-auto flex h-full w-[86%] max-w-[340px] flex-col gap-4 overflow-y-auto bg-white p-5 shadow-2xl">
          <div class="flex items-center justify-between">
            <div class="text-[15px] font-bold">{{ t('filter_category') }}</div>
            <button type="button" class="grid size-8 place-items-center rounded-md hover:bg-black/5" @click="mobileFiltersOpen = false"><X :size="16" /></button>
          </div>
          <select v-model="category" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-2.5 py-2 text-[13px]">
            <option value="">{{ t('filter_choose_category') }}</option>
            <option v-for="c in CAREER_SITE_CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
          <select v-model="employmentType" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-2.5 py-2 text-[13px]">
            <option value="">{{ t('filter_choose_type') }}</option>
            <option v-for="ty in CAREER_SITE_EMPLOYMENT_TYPES" :key="ty" :value="ty">{{ ty }}</option>
          </select>
          <select v-model="careerLevel" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-2.5 py-2 text-[13px]">
            <option value="">{{ t('filter_choose_level') }}</option>
            <option v-for="lv in CAREER_SITE_CAREER_LEVELS" :key="lv" :value="lv">{{ lv }}</option>
          </select>
          <select v-model="jobType" class="w-full rounded-[9px] border border-[var(--brand-preview-border)] px-2.5 py-2 text-[13px]">
            <option value="">{{ t('filter_job_type') }}</option>
            <option value="white">{{ t('filter_job_type_white') }}</option>
            <option value="blue">{{ t('filter_job_type_blue') }}</option>
          </select>
          <button type="button" class="mt-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold text-white" :style="{ background: site.primaryColor }" @click="mobileFiltersOpen = false">Apply filters</button>
          <button type="button" class="text-[12.5px] font-semibold underline" :style="{ color: site.primaryColor }" @click="clearFilters">Clear filters</button>
        </div>
      </div>
    </Teleport>
  </CareerSiteGate>
</template>
