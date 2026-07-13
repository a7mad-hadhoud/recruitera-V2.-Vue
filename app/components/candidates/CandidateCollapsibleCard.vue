<!--
  Shared "collapsible section card" used across the Candidate Profile Overview
  tab (AI Summary, Contact, Details, AI Criteria, Talent pools, Tasks, Notes).
  Same border/radius/toggle-chevron behavior in every place it appears —
  ported from the cp-ovsec / cp-card-toggle pattern in the reference mockup.
-->
<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title: string
  defaultOpen?: boolean
}>(), {
  defaultOpen: true,
})

const open = ref(props.defaultOpen)
</script>

<template>
  <div class="shrink-0 rounded-[14px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-white)] overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2 px-5 pt-3 pb-1.5 min-h-[30px] cursor-pointer text-left"
      @click="open = !open"
    >
      <span class="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--brand-text)]">
        <slot name="icon" />
        {{ title }}
        <ChevronDown
          class="w-4 h-4 text-[var(--brand-text-quiet)] transition-transform duration-150 shrink-0"
          :class="{ 'rotate-180': open }"
          stroke-width="2"
        />
        <span v-if="$slots['title-controls']" @click.stop>
          <slot name="title-controls" />
        </span>
      </span>
      <span class="inline-flex items-center gap-2" @click.stop>
        <slot name="actions" />
      </span>
    </button>
    <div v-show="open" class="px-5 pb-4">
      <div class="h-px bg-[var(--brand-border-hairline)] mb-3" />
      <slot />
    </div>
  </div>
</template>
