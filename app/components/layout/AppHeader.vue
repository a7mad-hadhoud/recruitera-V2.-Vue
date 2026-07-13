<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { BrandSearchBar, BrandTopbarActions } from '~/components/brand'
</script>

<template>
  <div class="flex flex-1 items-center gap-4">
    <!-- Left group: logo + Recruitera + Your trial pill -->
    <div class="flex items-center gap-3 shrink-0">
      <div class="w-[30px] h-[30px] bg-[var(--brand-teal)] rounded-lg flex items-center justify-center font-bold text-[15px] text-[var(--brand-lime)]">R</div>
      <span class="font-bold text-[17px] tracking-tight text-[var(--brand-text)] whitespace-nowrap">Recruitera</span>
      <button class="inline-flex items-center gap-2 h-9 rounded-lg bg-[var(--brand-topbar-pill-bg)] border border-[var(--brand-topbar-pill-border)] px-3 text-[13px] font-semibold text-[var(--brand-text)] hover:brightness-95 transition whitespace-nowrap">
        Your trial
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Middle: search (centered, max 560px) -->
    <div class="flex-1 flex justify-center">
      <div class="w-full max-w-[560px]">
        <BrandSearchBar placeholder="Search, jump to, and more" hint="⌘ K" />
      </div>
    </div>

    <!-- Right: icon buttons + avatar -->
    <BrandTopbarActions />
  </div>
</template>
