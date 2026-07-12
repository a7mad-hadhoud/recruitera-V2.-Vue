<!--
  Info banner shown at the top of the candidates list content area.
  Dismissible via the app store the same way TrialBanner is dismissible.
-->
<script setup lang="ts">
import { Info } from 'lucide-vue-next'

defineEmits<{ remove: [] }>()
</script>

<template>
  <div class="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--brand-lime-tint-hover)] border border-[var(--brand-border-light)]">
    <Info class="w-4 h-4 mt-0.5 text-[var(--brand-teal)] shrink-0" stroke-width="1.8" />
    <p class="text-[13.5px] text-[var(--brand-text-secondary)] leading-relaxed">
      Your company account is filled with sample candidates, talent pools, and jobs.
      When you're ready to start hiring, you can
      <button
        class="underline text-[var(--brand-text)] font-semibold hover:text-[var(--brand-teal)] transition-colors"
        @click="$emit('remove')"
      >remove the sample data</button>.
    </p>
  </div>
</template>
