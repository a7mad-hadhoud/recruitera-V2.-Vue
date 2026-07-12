<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app.store'

const app = useAppStore()
</script>

<template>
  <div
    v-if="app.trialBannerVisible"
    class="flex-none bg-[var(--brand-banner-bg)] text-[var(--brand-banner-text)] flex items-center justify-center relative px-12 py-2.5 text-sm"
  >
    <span>
      Sample data active —
      <a href="#" class="text-[var(--brand-banner-link)] font-bold underline">remove it</a>
      before entering your real data.
    </span>
    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center cursor-pointer text-[var(--brand-banner-icon)] hover:text-[var(--brand-danger)] transition-colors"
      aria-label="Dismiss trial banner"
      @click="app.dismissTrialBanner"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>
