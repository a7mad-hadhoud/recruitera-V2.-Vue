<!--
  List row in Pipeline → Screening view.
  Recruitee-style triage row: avatar (or hover-swap checkbox), name,
  headline, tag pills, source + created-at, optional rating icon.
  Clicking selects the row (parent renders profile pane). NOT a link
  — that would defeat the whole point of the screening layout.

  Row shape maps 1:1 to PipelineCandidate; if we later carry more
  fields (rating, education), extend the type and add slots here.
-->
<script setup lang="ts">
import { ThumbsUp, ThumbsDown } from 'lucide-vue-next'
import { BrandLimeCheckbox } from '~/components/brand'
import type { PipelineCandidate } from '~/types'

const props = defineProps<{
  candidate: PipelineCandidate
  selected: boolean
  checked: boolean
  /** Optional headline / role — some fixtures don't carry this yet. */
  headline?: string
  /** Optional tag list (e.g. #fashion, #senior). */
  tags?: string[]
  /** Optional source (e.g. "monster.com"). */
  source?: string
  /** Optional created-at label (e.g. "3 months ago"). */
  createdAt?: string
  /** Optional rating: 'up' | 'down' — hides when absent. */
  rating?: 'up' | 'down'
}>()

const emit = defineEmits<{
  'select':         [id: string]
  'toggle-check':   [id: string]
}>()
</script>

<template>
  <button
    type="button"
    class="group relative w-full text-left flex items-start gap-3 px-4 py-3 border-b border-[var(--brand-border-fade)] transition"
    :class="props.selected
      ? 'bg-[var(--brand-lime-tint)]'
      : 'hover:bg-[var(--brand-canvas)]'"
    :aria-current="props.selected ? 'true' : undefined"
    @click="emit('select', props.candidate.id)"
  >
    <!-- Left rail highlight for selected row -->
    <span
      v-if="props.selected"
      class="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--brand-teal)]"
      aria-hidden="true"
    />

    <!-- Avatar ↔ checkbox swap (matches CandidatePipelineCard pattern) -->
    <span class="relative inline-flex w-9 h-9 shrink-0 mt-px">
      <img
        v-if="props.candidate.avatarUrl"
        :src="props.candidate.avatarUrl"
        :alt="props.candidate.name"
        class="absolute inset-0 w-9 h-9 rounded-full object-cover bg-[var(--brand-canvas)] transition-opacity"
        :class="props.checked ? 'opacity-0' : 'group-hover:opacity-0'"
        :aria-hidden="props.checked ? 'true' : undefined"
      >
      <span
        v-else
        class="absolute inset-0 rounded-full bg-[var(--brand-teal)] text-white inline-flex items-center justify-center font-bold text-[12px] transition-opacity"
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
          :aria-label="`Select ${props.candidate.name} for bulk actions`"
          @update:model-value="() => emit('toggle-check', props.candidate.id)"
        />
      </span>
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5">
        <span class="text-[14px] font-semibold text-[var(--brand-text)] truncate">
          {{ props.candidate.name }}
        </span>
        <span v-if="props.candidate.isNew"
              class="text-[10px] font-bold tracking-wider text-[var(--brand-pipeline-blue)] border border-[color-mix(in_srgb,var(--brand-pipeline-blue)_30%,white)] bg-[color-mix(in_srgb,var(--brand-pipeline-blue)_10%,white)] rounded px-1.5 py-px shrink-0">NEW</span>
        <ThumbsUp v-if="props.rating === 'up'"
                  class="w-3.5 h-3.5 text-[var(--brand-status-approved-text)] shrink-0" stroke-width="2" />
        <ThumbsDown v-else-if="props.rating === 'down'"
                    class="w-3.5 h-3.5 text-[var(--brand-status-closed-text)] shrink-0" stroke-width="2" />
      </div>

      <div v-if="props.headline"
           class="text-[12.5px] text-[var(--brand-text-secondary)] mt-0.5 truncate">
        {{ props.headline }}
      </div>

      <div v-if="props.tags?.length" class="flex items-center gap-1.5 mt-2 flex-wrap">
        <span v-for="tag in props.tags?.slice(0, 3)" :key="tag"
              class="text-[11px] font-semibold text-[var(--brand-teal-secondary)] bg-[var(--brand-canvas)] rounded px-1.5 py-[2px]">
          #{{ tag }}
        </span>
        <span v-if="(props.tags?.length ?? 0) > 3"
              class="text-[11px] font-semibold text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)] rounded px-1.5 py-[2px]">
          +{{ (props.tags?.length ?? 0) - 3 }}
        </span>
      </div>

      <div v-if="props.source || props.createdAt"
           class="flex items-center gap-2 mt-2 text-[11.5px] text-[var(--brand-text-quiet)]">
        <span v-if="props.source">via <strong class="font-semibold text-[var(--brand-text-secondary)]">{{ props.source }}</strong></span>
        <span v-if="props.source && props.createdAt" class="w-1 h-1 rounded-full bg-[var(--brand-border)]" />
        <span v-if="props.createdAt">{{ props.createdAt }}</span>
      </div>
    </div>
  </button>
</template>
