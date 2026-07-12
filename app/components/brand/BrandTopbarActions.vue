<!--
  Right-hand topbar icon cluster: help/notifications/settings icon buttons +
  avatar. Shared between AppHeader (main app) and SettingsHeader (settings
  shell) so both stay pixel-identical to the design source instead of
  drifting apart as separate copies. Does NOT include the "Your trial" pill —
  its position differs between the two headers (left-grouped vs right-grouped).
-->
<script setup lang="ts">
import { HelpCircle, Bell, Settings as SettingsIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="flex items-center gap-1.5 shrink-0">
    <button class="w-[34px] h-[34px] rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-subtle)] hover:bg-black/[.05] transition-colors" aria-label="Help">
      <HelpCircle class="w-[19px] h-[19px]" />
    </button>
    <button class="w-[34px] h-[34px] rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-subtle)] hover:bg-black/[.05] transition-colors" aria-label="Notifications">
      <Bell class="w-[19px] h-[19px]" />
    </button>
    <button class="w-[34px] h-[34px] rounded-[9px] inline-flex items-center justify-center text-[var(--brand-text-subtle)] hover:bg-black/[.05] transition-colors" aria-label="Settings">
      <SettingsIcon class="w-[19px] h-[19px]" />
    </button>
    <button class="w-[34px] h-[34px] rounded-full bg-[var(--brand-teal)] text-[var(--brand-lime)] text-[12px] font-bold inline-flex items-center justify-center ml-1" aria-label="Account">MS</button>
  </div>
</template>
