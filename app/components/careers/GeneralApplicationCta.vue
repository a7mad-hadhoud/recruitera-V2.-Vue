<script setup lang="ts">
const site = useCareerSite()
const { t } = useCareerSiteI18n()
</script>

<template>
  <section v-if="site.generalApplicationOn" class="px-6 py-8">
    <div class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--brand-preview-border-card)] px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
      <p class="text-[14px] font-medium text-[var(--brand-preview-text-heading)]">{{ t('general_app_cta') }}</p>
      <NuxtLink
        to="/careers/apply/general"
        class="shrink-0 whitespace-nowrap rounded-xl px-5 py-2.5 text-[13.5px] font-bold text-white no-underline"
        :style="{ background: site.ctaColor }"
      >
        {{ t('general_app_title') }} →
      </NuxtLink>
    </div>
  </section>
</template>
