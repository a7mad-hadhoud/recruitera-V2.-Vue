<!--
  Compact list row per mockup:
    avatar · name + NEW pill · stage dot + label     [AI score badge]

  AI score badge colors (thresholds):
    ≥ 80 → --brand-lime bg + teal fg          ("hot")
    ≥ 70 → mint / lime-tint bg + teal fg      ("warm")
    < 70 → amber-ish bg + muted fg            ("cool")

  Selected row: lime-tint bg + 3px lime left rail.
  Bulk-select checkbox is hover-only, replaces avatar in-place.
-->
<script setup lang="ts">
import { BrandLimeCheckbox } from '~/components/brand'
import type { PipelineCandidate } from '~/types'

const props = defineProps<{
  candidate: PipelineCandidate
  /** Colored dot for the stage this row lives in (e.g. `var(--brand-pipeline-blue)`). */
  stageDot: string
  /** Human label for the stage (e.g. "Applied", "Phone interview"). */
  stageLabel: string
  selected: boolean
  checked: boolean
}>()

const emit = defineEmits<{
  'select':       [id: string]
  'toggle-check': [id: string]
}>()

const scorePalette = computed(() => {
  const s = props.candidate.aiScore
  if (s >= 80) return { bg: 'var(--brand-lime)',                              fg: 'var(--brand-teal)' }
  if (s >= 70) return { bg: 'color-mix(in srgb, var(--brand-lime-tint) 90%, white)', fg: 'var(--brand-teal-secondary)' }
  return          { bg: 'color-mix(in srgb, orange 22%, white)',              fg: 'color-mix(in srgb, orange 60%, black)' }
})
</script>

<template>
  <button
    type="button"
    class="group relative w-full text-left flex items-center gap-2.5 px-3 py-2.5 border-b border-[var(--brand-border-fade)] transition"
    :class="props.selected
      ? 'bg-[var(--brand-lime-tint)]'
      : 'hover:bg-[var(--brand-canvas)]'"
    :aria-current="props.selected ? 'true' : undefined"
    @click="emit('select', props.candidate.id)"
  >
    <span
      v-if="props.selected"
      class="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--brand-lime)]"
      aria-hidden="true"
    />

    <!-- Avatar ↔ checkbox swap -->
    <span class="relative inline-flex w-[34px] h-[34px] shrink-0">
      <img
        v-if="props.candidate.avatarUrl"
        :src="props.candidate.avatarUrl"
        :alt="props.candidate.name"
        class="absolute inset-0 w-[34px] h-[34px] rounded-full object-cover bg-[var(--brand-canvas)] transition-opacity"
        :class="props.checked ? 'opacity-0' : 'group-hover:opacity-0'"
        :aria-hidden="props.checked ? 'true' : undefined"
      >
      <span
        v-else
        class="absolute inset-0 rounded-full bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)] inline-flex items-center justify-center font-bold text-[12px] transition-opacity"
        :class="props.checked ? 'opacity-0' : 'group-hover:opacity-0'"
        :aria-hidden="props.checked ? 'true' : undefined"
      >{{ props.candidate.initials }}</span>
      <span
        class="absolute inset-0 inline-flex items-center justify-center transition-opacity"
        :class="props.checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        @click.stop
      >
        <BrandLimeCheckbox
          :model-value="props.checked"
          :aria-label="`Select ${props.candidate.name}`"
          @update:model-value="() => emit('toggle-check', props.candidate.id)"
        />
      </span>
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5">
        <span class="text-[13px] font-bold text-[var(--brand-text)] truncate">{{ props.candidate.name }}</span>
        <span
          v-if="props.candidate.isNew"
          class="text-[9px] font-bold tracking-wider text-[var(--brand-pipeline-blue)] bg-[color-mix(in_srgb,var(--brand-pipeline-blue)_10%,white)] rounded px-1 py-px shrink-0"
        >NEW</span>
      </div>
      <div class="flex items-center gap-1.5 mt-0.5 text-[11px] text-[var(--brand-text-quiet)]">
        <span class="inline-block w-[5px] h-[5px] rounded-full shrink-0" :style="{ background: props.stageDot }" />
        <span class="truncate">{{ props.stageLabel }}</span>
      </div>
    </div>

    <span
      class="shrink-0 rounded-md px-2 py-0.5 text-[12.5px] font-bold tabular-nums"
      :style="{ background: scorePalette.bg, color: scorePalette.fg }"
    >{{ props.candidate.aiScore }}%</span>
  </button>
</template>
