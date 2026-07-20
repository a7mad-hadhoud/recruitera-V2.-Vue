<!--
  Status pill/dot/text indicator — consolidates the three hand-rolled variants
  found across settings (solid-bg pill, dot+text, text-only) onto one component
  driven by a semantic `tone`. Add a new tone here (and its --brand-status-*
  token pair in main.css) before reaching for an ad-hoc color.
-->
<script setup lang="ts">
import { computed } from 'vue'

type Tone = 'approved' | 'pending' | 'neutral' | 'live' | 'expired' | 'teal-green' | 'orange' | 'gray' | 'pipeline-blue' | 'pipeline-purple' | 'new' | 'danger' | 'closed'
type Variant = 'solid' | 'dot' | 'text' | 'dot-only'

const props = withDefaults(defineProps<{
  label: string
  tone?: Tone
  variant?: Variant
  /** dot variant only: keep the label in default body text instead of the tone color */
  plainLabel?: boolean
  /** dot-only variant: visually dim the dot (e.g. archived/inactive state) */
  faded?: boolean
}>(), {
  tone: 'neutral',
  variant: 'solid',
  plainLabel: false,
  faded: false,
})

const TONES: Record<Tone, { bg: string; text: string }> = {
  approved: { bg: 'var(--brand-status-approved-bg)', text: 'var(--brand-status-approved-text)' },
  pending: { bg: 'var(--brand-status-pending-bg)', text: 'var(--brand-status-pending-text)' },
  neutral: { bg: 'var(--brand-canvas)', text: 'var(--brand-text-quiet)' },
  live: { bg: 'var(--brand-canvas)', text: 'var(--brand-settings-status-active)' },
  expired: { bg: 'var(--brand-canvas)', text: 'var(--brand-settings-status-neutral)' },
  'teal-green': { bg: 'var(--brand-canvas)', text: 'var(--brand-status-teal-green)' },
  'orange': { bg: 'var(--brand-canvas)', text: 'var(--brand-status-orange)' },
  'gray': { bg: 'var(--brand-canvas)', text: 'var(--brand-status-gray)' },
  'pipeline-blue': { bg: 'var(--brand-canvas)', text: 'var(--brand-pipeline-blue)' },
  'pipeline-purple': { bg: 'var(--brand-canvas)', text: 'var(--brand-pipeline-purple)' },
  'new': { bg: 'var(--brand-badge-new-bg)', text: 'var(--brand-badge-new-text)' },
  'danger': { bg: 'var(--brand-canvas)', text: 'var(--brand-danger)' },
  'closed': { bg: 'var(--brand-status-closed-bg)', text: 'var(--brand-status-closed-text)' },
}

const colors = computed(() => TONES[props.tone])
</script>

<template>
  <span
    v-if="variant === 'solid'"
    class="inline-flex items-center rounded-[6px] px-2 py-[3px] text-[12px] font-bold"
    :style="{ background: colors.bg, color: colors.text }"
  >{{ label }}</span>

  <span
    v-else-if="variant === 'dot'"
    class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
    :style="{ color: plainLabel ? 'var(--brand-text)' : colors.text }"
  >
    <span class="w-[7px] h-[7px] rounded-full shrink-0" :style="{ background: colors.text }" />{{ label }}
  </span>

  <!-- dot-only: color-coded dot with no visible label text (used next to a different
       visible label, e.g. a job title or stage name) — label is exposed as an
       accessible name via sr-only text so the state isn't color-only. -->
  <span
    v-else-if="variant === 'dot-only'"
    class="inline-flex items-center shrink-0"
    :class="faded ? 'opacity-50' : ''"
    role="img"
    :aria-label="label"
  >
    <span class="w-[7px] h-[7px] rounded-full shrink-0" :style="{ background: colors.text }" />
    <span class="sr-only">{{ label }}</span>
  </span>

  <span v-else class="text-[12px] font-semibold" :style="{ color: colors.text }">{{ label }}</span>
</template>
