<!--
  Standard settings page hero: title + subtitle + optional "Learn more" link,
  bottom-bordered per settings.html's section header pattern. Every settings
  page starts with this so heading size/weight/spacing/divider never drifts
  between sections. Slot `actions` for a page-level CTA that sits to the
  right of the title (rare — most settings pages put their CTA in
  SettingsTable's toolbar row instead). Slot `title-suffix` renders inline
  right after the title text (e.g. a master enable Switch). `noDivider`
  drops the bottom-border spacer for pages that build their own separator
  right below the header (e.g. a tab bar with its own border-bottom).
-->
<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
  learnMoreHref?: string
  learnMoreLabel?: string
  noDivider?: boolean
}>(), {
  learnMoreLabel: 'Learn more',
  noDivider: false,
})
</script>

<template>
  <div>
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-3.5 mb-1">
          <h1 class="text-[20px] font-bold text-[var(--brand-text)]">{{ title }}</h1>
          <slot name="title-suffix" />
        </div>
        <p v-if="subtitle" class="text-[13.5px] text-[var(--brand-text-quiet)] mb-0">
          {{ subtitle }}
          <a
            v-if="learnMoreHref"
            :href="learnMoreHref"
            class="text-[var(--brand-teal)] font-semibold underline"
          >{{ learnMoreLabel }}</a>
        </p>
      </div>
      <slot name="actions" />
    </div>
    <div v-if="!noDivider" class="h-px bg-[var(--brand-border-light)] mt-4 mb-5" />
  </div>
</template>
