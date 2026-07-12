<!--
  The page hero title pattern: bold H1 + optional "save as favorite" star.
  Standardises size + weight + tracking across every page so headers never
  drift out of sync.
-->
<script setup lang="ts">
import { Star } from 'lucide-vue-next'

defineProps<{
  label: string
  favoriteable?: boolean
}>()

const emit = defineEmits<{ favorite: [] }>()
</script>

<template>
  <div class="flex items-center gap-2 py-1">
    <h1 class="m-0 text-[26px] font-bold tracking-tight text-[var(--brand-text)]">
      {{ label }}
    </h1>
    <button
      v-if="favoriteable"
      class="w-[34px] h-[34px] inline-flex items-center justify-center rounded-lg text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
      aria-label="Save as favorite"
      @click="emit('favorite')"
    >
      <Star class="w-[19px] h-[19px]" stroke-width="1.7" />
    </button>
    <slot />
  </div>
</template>
