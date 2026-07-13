<!--
  A single filter group inside a filter panel: bold title (with optional
  subtitle, e.g. the chosen operator) on the left, a `×` clear button on
  the right (shown by default, or gated behind `active`), then the option
  rows via the default slot.

  Usage:
    <BrandFilterGroup title="Job status" :active="jobStatusFilter.length > 0" @clear="clear">
      <BrandFilterOption ... />
      <BrandFilterOption ... />
    </BrandFilterGroup>
-->
<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(defineProps<{ title: string; subtitle?: string; active?: boolean }>(), {
  active: true,
})
defineEmits<{ clear: [] }>()
</script>

<template>
  <div>
    <div class="flex items-center justify-between px-2 pt-3 pb-1">
      <div>
        <div class="text-[14px] font-bold text-[var(--brand-text)]">{{ title }}</div>
        <div v-if="subtitle" class="text-[12px] text-[var(--brand-text-quiet)]">{{ subtitle }}</div>
      </div>
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
