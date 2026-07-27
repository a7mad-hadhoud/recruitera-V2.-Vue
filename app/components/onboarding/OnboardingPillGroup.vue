<!--
  Single-select pill row used across the onboarding steps. Selected pill gets the
  brand teal outline + lime tint; the rest are quiet outlines. v-model is the
  chosen option string.
-->
<script setup lang="ts">
defineProps<{ options: readonly string[] }>()
const model = defineModel<string>()
</script>

<template>
  <div class="flex flex-wrap gap-2.5">
    <button
      v-for="o in options"
      :key="o"
      type="button"
      class="px-4 py-2 rounded-full text-[14px] font-semibold outline-none cursor-pointer transition-colors"
      :class="model === o
        ? 'border-[1.5px] border-[var(--brand-teal)] text-[var(--brand-teal)] bg-[var(--brand-lime-tint)]'
        : 'border border-[var(--brand-border)] text-[var(--brand-text-secondary)] hover:border-[var(--brand-border-mid)] hover:bg-[var(--brand-surface-hover)]'"
      @click="model = o"
    >
      {{ o }}
    </button>
  </div>
</template>
