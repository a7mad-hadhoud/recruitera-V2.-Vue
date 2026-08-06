<script setup lang="ts">
const site = useCareerSite()
const { t } = useCareerSiteI18n()
</script>

<template>
  <section v-if="site.generalApplicationOn" class="px-6 py-8">
    <div class="flex flex-col items-center gap-4 rounded-2xl border-[1.5px] border-dashed px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left" :style="{ borderColor: `${site.primaryColor}55`, background: `${site.primaryColor}0a` }">
      <div>
        <p class="mb-1 text-[14.5px] font-bold text-[var(--brand-preview-text-heading)]">{{ t('general_app_cta') }}</p>
        <p class="max-w-[440px] text-[12.5px] leading-[1.55] text-[var(--brand-preview-text-secondary)]">{{ t('general_app_cta_sub') }}</p>
      </div>
      <NuxtLink
        to="/careers/apply/general"
        class="shrink-0 whitespace-nowrap rounded-xl px-5 py-2.5 text-[13.5px] font-bold text-white no-underline"
        :style="{ background: site.ctaColor }"
      >
        {{ t('general_app_apply_now') }} →
      </NuxtLink>
    </div>
  </section>
</template>
