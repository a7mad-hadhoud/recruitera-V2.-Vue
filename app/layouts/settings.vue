<script setup lang="ts">
import SettingsSidebar from '~/components/layout/SettingsSidebar.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import TrialBanner from '~/components/layout/TrialBanner.vue'
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-[var(--brand-canvas)]">
    <TrialBanner />
    <!-- Top bar -->
    <header class="flex-none h-14 bg-white border-b border-[var(--brand-border)] flex items-center px-4 z-10">
      <AppHeader />
    </header>
    <div class="flex flex-1 overflow-hidden">
      <SettingsSidebar />
      <main class="flex-1 overflow-auto bg-white">
        <slot />
      </main>
    </div>
  </div>
</template>
