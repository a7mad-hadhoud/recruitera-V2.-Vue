<!--
  Shared header row for every active filter: bold title on the left, × clear
  on the right. Optional `subtitle` renders below the title (used to show
  the chosen operator, e.g. "Disqualify reason is").
-->
<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ title: string; subtitle?: string }>()
defineEmits<{ clear: [] }>()
</script>

<template>
  <div class="flex items-center justify-between px-2 pt-3 pb-1">
    <div>
      <div class="text-[14px] font-bold text-[var(--brand-text)]">{{ title }}</div>
      <div v-if="subtitle" class="text-[12px] text-[var(--brand-text-quiet)]">{{ subtitle }}</div>
    </div>
    <button
      class="text-[var(--brand-icon-muted)] hover:text-[var(--brand-danger)] transition-colors"
      aria-label="Remove filter"
      @click="$emit('clear')"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
