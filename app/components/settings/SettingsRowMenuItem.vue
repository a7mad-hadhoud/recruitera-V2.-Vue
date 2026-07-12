<script setup lang="ts">
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'

withDefaults(defineProps<{
  danger?: boolean
}>(), {
  danger: false,
})
</script>

<template>
  <DropdownMenuItem
    :class="[
      'flex items-center gap-2.5 w-full px-3 py-[9px] rounded-[8px] text-[13.5px] font-semibold cursor-pointer',
      danger
        ? 'text-[var(--brand-settings-danger)] focus:bg-[var(--brand-settings-danger-hover-bg)] focus:text-[var(--brand-settings-danger)]'
        : 'text-[var(--brand-text)] focus:bg-[var(--brand-settings-modal-bg)] focus:text-[var(--brand-text)]',
    ]"
  >
    <slot />
  </DropdownMenuItem>
</template>
