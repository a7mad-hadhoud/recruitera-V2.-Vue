<!--
  Consistent empty state: icon + title + optional description + optional CTA slot.
  Use for "no results", "no items yet", 404 areas etc.
-->
<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon?: Component
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <component
      :is="icon"
      v-if="icon"
      class="w-10 h-10 text-[var(--brand-text-faint)]"
      stroke-width="1.4"
    />
    <p class="m-0 text-[15px] font-bold text-[var(--brand-text)]">
      {{ title }}
    </p>
    <p
      v-if="description"
      class="m-0 text-[13px] text-[var(--brand-text-quiet)] max-w-[380px]"
    >
      {{ description }}
    </p>
    <div class="mt-2">
      <slot />
    </div>
  </div>
</template>
