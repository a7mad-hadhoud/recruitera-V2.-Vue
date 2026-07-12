<script setup lang="ts">
import { HelpCircle, Bell, Settings as SettingsIcon, Search, ChevronRight } from 'lucide-vue-next'
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
      <div class="relative w-full max-w-[560px]">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-text-quiet)]" />
        <input
          type="text"
          placeholder="Search, jump to, and more"
          class="w-full h-9 pl-10 pr-16 rounded-lg bg-[var(--brand-topbar-pill-bg)] border border-[var(--brand-topbar-pill-border)] text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)] outline-none focus:bg-white focus:border-[var(--brand-border-mid)] transition-colors"
        />
        <kbd class="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-mono text-[var(--brand-text-subtle)] border border-[var(--brand-border-key)] rounded-md px-1.5 py-0.5 bg-transparent">⌘ K</kbd>
      </div>
    </div>

    <!-- Right: icon buttons + avatar -->
    <div class="flex items-center gap-1.5 shrink-0 text-[var(--brand-text-subtle)]">
      <button class="w-9 h-9 rounded-lg inline-flex items-center justify-center hover:bg-black/[.05] transition-colors" aria-label="Help">
        <HelpCircle class="w-[19px] h-[19px]" />
      </button>
      <button class="w-9 h-9 rounded-lg inline-flex items-center justify-center hover:bg-black/[.05] transition-colors" aria-label="Notifications">
        <Bell class="w-[19px] h-[19px]" />
      </button>
      <button class="w-9 h-9 rounded-lg inline-flex items-center justify-center hover:bg-black/[.05] transition-colors" aria-label="Settings">
        <SettingsIcon class="w-[19px] h-[19px]" />
      </button>
      <button class="w-[34px] h-[34px] rounded-full bg-[var(--brand-teal)] text-white text-[13px] font-bold inline-flex items-center justify-center ml-1" aria-label="Account">MS</button>
    </div>
  </div>
</template>
