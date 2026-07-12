<!--
  Top bar used only by the settings layout. Ported 1:1 from settings.html's
  topbar markup: left = "Settings" title (232px column matching sidebar
  width) + icon-grid button, divider, right = trial pill + icon cluster.
  No logo, no search — unlike AppHeader.
-->
<script setup lang="ts">
import { LayoutGrid, ChevronRight } from 'lucide-vue-next'
import { BrandTopbarActions } from '~/components/brand'
</script>

<template>
  <div class="flex flex-1 items-stretch">
    <div class="w-[232px] shrink-0 flex items-center justify-between px-[14px]">
      <h1 class="font-bold text-[18px] text-[var(--brand-text)] tracking-[-0.01em]">Settings</h1>
      <button class="w-[30px] h-[30px] rounded-lg inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-black/[.05] transition-colors" aria-label="Grid view">
        <LayoutGrid class="w-4 h-4" />
      </button>
    </div>
    <div class="w-px bg-[var(--brand-border)] my-[10px]" />

    <div class="flex-1 flex items-center gap-2 px-4">
      <button class="inline-flex items-center gap-[7px] h-[34px] rounded-[9px] bg-[var(--brand-topbar-pill-bg)] border border-[var(--brand-topbar-pill-border)] px-3 text-[13px] font-semibold text-[var(--brand-text)] hover:brightness-95 transition whitespace-nowrap">
        Your trial
        <ChevronRight class="w-[13px] h-[13px]" />
      </button>
      <div class="flex-1" />
      <BrandTopbarActions />
    </div>
  </div>
</template>
