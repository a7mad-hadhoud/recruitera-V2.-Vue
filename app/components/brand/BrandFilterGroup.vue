<!--
  A single filter group inside a filter panel: bold title on the left,
  a `×` clear button on the right (only when `active` is true), then
  the option rows via the default slot.

  Usage:
    <BrandFilterGroup title="Job status" :active="jobStatusFilter.length > 0" @clear="clear">
      <BrandFilterOption ... />
      <BrandFilterOption ... />
    </BrandFilterGroup>
-->
<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ title: string; active?: boolean }>()
defineEmits<{ clear: [] }>()
</script>

<template>
  <div>
    <div class="flex items-center justify-between px-2 pt-3 pb-1">
      <span class="text-[14px] font-bold text-[var(--brand-text)]">{{ title }}</span>
      <button
        v-if="active"
        class="text-[var(--brand-icon-muted)] hover:text-[var(--brand-danger)] transition-colors"
        @click="$emit('clear')"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
    <div class="flex flex-col">
      <slot />
    </div>
  </div>
</template>
