<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
      >
        <MoreHorizontal class="w-3.5 h-3.5" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="min-w-[160px] p-1.5 rounded-[12px] border border-[var(--brand-border-light)] shadow-[var(--brand-settings-dropdown-shadow)]"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenu>
</template>
