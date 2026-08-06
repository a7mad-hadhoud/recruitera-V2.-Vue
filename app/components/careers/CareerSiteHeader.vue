<script setup lang="ts">
import { LogOut, Menu, X } from 'lucide-vue-next'
import ForEmployeesTrigger from '~/components/careers/ForEmployeesTrigger.vue'

const site = useCareerSite()
const { data: companyData } = useCompany()
const companyName = computed(() => companyData.value?.name || 'Your Company')
const companyInitials = computed(() => companyName.value.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?')

const { t, locale, toggleLocale, dir } = useCareerSiteI18n()
useHead({ htmlAttrs: { dir, lang: locale } })

const portal = useEmployeePortalStore()
const mobileOpen = ref(false)

function logout() {
  portal.logout()
  mobileOpen.value = false
  navigateTo('/careers')
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-black/5 bg-white px-4 py-3.5 sm:px-6" :style="{ fontFamily: `${site.font}, system-ui, sans-serif` }">
    <div class="mx-auto flex max-w-[1200px] items-center justify-between">
      <div class="flex items-center gap-6">
        <NuxtLink to="/careers" class="flex items-center gap-2.5 no-underline">
          <div class="grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white" :style="{ background: site.primaryColor }">{{ companyInitials }}</div>
          <span class="text-[15px] font-semibold" :style="{ color: site.headerColor }">{{ companyName }}</span>
        </NuxtLink>

        <!-- Desktop nav — kept next to the logo at the leading edge -->
        <nav class="hidden items-center gap-6 text-[13.5px] font-medium sm:flex">
          <NuxtLink to="/careers" class="text-[var(--brand-preview-text-heading)] no-underline hover:opacity-70">{{ t('nav_home') }}</NuxtLink>
          <NuxtLink to="/careers/opportunities" class="no-underline hover:opacity-70" :style="{ color: site.primaryColor }">{{ t('nav_opportunities') }}</NuxtLink>
          <NuxtLink v-if="portal.isVerified" to="/careers/internal-opportunities" class="no-underline hover:opacity-70" :style="{ color: site.primaryColor }">{{ t('nav_internal_opportunities') }}</NuxtLink>
        </nav>
      </div>

      <!-- Desktop: employee state + language + logout, pushed to the trailing edge -->
      <div class="hidden items-center gap-3 sm:flex">
        <template v-if="site.forEmployeesOn">
          <NuxtLink v-if="portal.isVerified" to="/careers/portal#referrals" class="rounded-lg border px-3 py-1.5 text-[13.5px] font-medium no-underline" :style="{ color: site.primaryColor, borderColor: site.primaryColor }">{{ t('nav_my_referrals') }}</NuxtLink>
          <ForEmployeesTrigger v-else />
        </template>

        <button type="button" class="relative grid size-8 shrink-0 place-items-center rounded-md" :style="{ background: site.headerColor }" :aria-label="locale === 'en' ? 'Switch to Arabic' : 'Switch to English'" @click="toggleLocale">
          <span class="absolute left-[6px] top-[3px] text-[9px] font-black leading-none text-white">A</span>
          <span class="absolute bottom-[3px] right-[6px] text-[10px] font-black leading-none text-white">ع</span>
        </button>

        <button v-if="portal.isVerified" type="button" class="ms-1 inline-flex items-center gap-1.5 border-s border-[var(--brand-preview-border)] ps-3 text-[13.5px] font-medium" :style="{ color: site.headerColor }" @click="logout">
          <LogOut :size="13" :stroke-width="1.9" />{{ t('nav_logout') }}
        </button>
      </div>

      <!-- Mobile: hamburger -->
      <button type="button" class="grid size-9 place-items-center sm:hidden" :aria-label="mobileOpen ? 'Close menu' : 'Open menu'" @click="mobileOpen = !mobileOpen">
        <X v-if="mobileOpen" :size="20" :style="{ color: site.headerColor }" />
        <Menu v-else :size="20" :style="{ color: site.headerColor }" />
      </button>
    </div>

    <!-- Mobile nav sheet -->
    <div v-if="mobileOpen" class="mx-auto mt-3.5 flex max-w-[1200px] flex-col gap-1 border-t border-black/5 pt-3.5 text-[14px] font-medium sm:hidden">
      <NuxtLink to="/careers" class="rounded-lg px-2 py-2.5 no-underline" :style="{ color: site.headerColor }" @click="mobileOpen = false">{{ t('nav_home') }}</NuxtLink>
      <NuxtLink to="/careers/opportunities" class="rounded-lg px-2 py-2.5 no-underline" :style="{ color: site.headerColor }" @click="mobileOpen = false">{{ t('nav_opportunities') }}</NuxtLink>
      <NuxtLink v-if="portal.isVerified" to="/careers/internal-opportunities" class="rounded-lg px-2 py-2.5 no-underline" :style="{ color: site.headerColor }" @click="mobileOpen = false">{{ t('nav_internal_opportunities') }}</NuxtLink>
      <NuxtLink v-if="portal.isVerified" to="/careers/portal#referrals" class="rounded-lg px-2 py-2.5 no-underline" :style="{ color: site.headerColor }" @click="mobileOpen = false">{{ t('nav_my_referrals') }}</NuxtLink>
      <button v-if="site.forEmployeesOn && portal.isVerified" type="button" class="rounded-lg px-2 py-2.5 text-left" :style="{ color: site.headerColor }" @click="logout">{{ t('nav_logout') }}</button>
      <ForEmployeesTrigger v-else-if="site.forEmployeesOn" full-width @click="mobileOpen = false" />
      <button type="button" class="mt-1 self-start rounded-md px-3 py-1.5 text-[12px] font-bold" :style="{ background: site.headerColor, color: 'white' }" @click="toggleLocale">
        {{ locale === 'en' ? 'العربية' : 'English' }}
      </button>
    </div>
  </header>
</template>
