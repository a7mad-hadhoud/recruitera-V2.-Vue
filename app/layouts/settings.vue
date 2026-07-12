<script setup lang="ts">
import SettingsSidebar from '~/components/layout/SettingsSidebar.vue'
import SettingsHeader from '~/components/layout/SettingsHeader.vue'
import TrialBanner from '~/components/layout/TrialBanner.vue'
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-[var(--brand-canvas)]">
    <TrialBanner />
    <!-- Flat canvas top bar — no SidebarCurve/white-panel here, unlike the main
         app shell. settings.html's source has no notch: sidebar, header, and
         content all share the same canvas bg; sections use their own white
         s-card panels instead of one big wrapper. -->
    <header class="flex items-center h-[52px] bg-[var(--brand-canvas)] flex-none">
      <SettingsHeader />
    </header>
    <!-- Body: settings sidebar + content -->
    <div class="flex flex-1 min-h-0 bg-[var(--brand-canvas)]">
      <SettingsSidebar />
      <main class="flex-1 min-w-0 overflow-y-auto bg-white border-t border-l border-[var(--brand-border-light)] rounded-tl-2xl px-10 py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
