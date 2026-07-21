<!--
  Rich list row (Wilson McClure sample style):
    checkbox · avatar (with online-dot) · name + NEW pill
                                         · headline
                                         · tag pills
                                         · "via source · N ago"

  Uses OUR design system colors:
    tags       = --brand-teal-secondary text on --brand-canvas bg
    avatar dot = --brand-pipeline-blue online indicator
    selected   = --brand-lime-tint bg + --brand-lime 3px left rail

  Bulk-select checkbox is hover-only and sits to the LEFT of the avatar
  (not swapping into it) — matches the reference where the checkbox is
  a separate hit target.
-->
<script setup lang="ts">
import { BrandLimeCheckbox } from '~/components/brand'
import type { PipelineCandidate } from '~/types'

const props = defineProps<{
  candidate: PipelineCandidate
  selected: boolean
  checked: boolean
  headline?: string
  tags?: string[]
  source?: string
  createdAt?: string
  /** Blue "online" / "unread" indicator on the avatar (matches ref). */
  online?: boolean
}>()

const emit = defineEmits<{
  'select':       [id: string]
  'toggle-check': [id: string]
}>()
</script>

<template>
  <div
    class="group relative flex items-start gap-3 pl-3 pr-4 py-3 border-b border-[var(--brand-border-fade)] transition cursor-pointer"
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

    <!-- Bulk-select checkbox — hover-only, or persistent when checked. -->
    <span
      class="pt-1 shrink-0 transition-opacity"
      :class="props.checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
      @click.stop
    >
      <BrandLimeCheckbox
        :model-value="props.checked"
        :aria-label="`Select ${props.candidate.name}`"
        @update:model-value="() => emit('toggle-check', props.candidate.id)"
      />
    </span>

    <!-- Avatar with optional online dot. -->
    <span class="relative inline-flex w-[44px] h-[44px] shrink-0">
      <img
        v-if="props.candidate.avatarUrl"
        :src="props.candidate.avatarUrl"
        :alt="props.candidate.name"
        class="w-[44px] h-[44px] rounded-full object-cover bg-[var(--brand-canvas)]"
      >
      <span
        v-else
        class="w-[44px] h-[44px] rounded-full bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)] inline-flex items-center justify-center font-bold text-[13px]"
      >{{ props.candidate.initials }}</span>
      <span
        v-if="props.online"
        class="absolute top-0.5 right-0.5 w-[9px] h-[9px] rounded-full bg-[var(--brand-pipeline-blue)] border-2 border-white"
        aria-hidden="true"
      />
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5">
        <span class="text-[14px] font-bold text-[var(--brand-text)] truncate">{{ props.candidate.name }}</span>
        <span
          v-if="props.candidate.isNew"
          class="text-[9.5px] font-bold tracking-wider text-[var(--brand-pipeline-blue)] bg-[color-mix(in_srgb,var(--brand-pipeline-blue)_10%,white)] rounded px-1.5 py-px shrink-0"
        >NEW</span>
      </div>

      <div v-if="props.headline"
           class="text-[12.5px] text-[var(--brand-text-secondary)] mt-0.5 truncate">
        {{ props.headline }}
      </div>

      <div v-if="props.tags?.length" class="flex items-center gap-x-2 gap-y-1 mt-1.5 flex-wrap">
        <span
          v-for="tag in props.tags?.slice(0, 4)"
          :key="tag"
          class="text-[11.5px] font-semibold text-[var(--brand-teal-secondary)]"
        >#{{ tag }}</span>
        <span
          v-if="(props.tags?.length ?? 0) > 4"
          class="text-[11px] font-semibold text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)] rounded px-1.5"
        >+{{ (props.tags?.length ?? 0) - 4 }}</span>
      </div>

      <div v-if="props.source || props.createdAt"
           class="flex items-center gap-1 mt-2 text-[11.5px] text-[var(--brand-text-quiet)]">
        <template v-if="props.source">
          via <strong class="font-bold text-[var(--brand-text)]">{{ props.source }}</strong>
        </template>
        <template v-if="props.source && props.createdAt"><span class="mx-0.5">·</span></template>
        <span v-if="props.createdAt">{{ props.createdAt }}</span>
      </div>
    </div>
  </div>
</template>
