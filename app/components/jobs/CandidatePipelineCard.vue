<!--
  Single source of truth for a candidate card on the pipeline board.
  Every column renders this — hand-rolled variants risk drift the same way
  we've already caught in tables, search bars, and buttons elsewhere.

  Owns:
   • avatar ↔ select-checkbox swap (idle: avatar, hover/selected: checkbox)
   • name + optional NEW pill
   • AI score / notes / replies row
   • location footer
   • the "More" (⋯) menu that includes the keyboard-accessible
     "Move to…" fallback for HTML5 drag-and-drop (a11y — DnD alone is not
     keyboard-reachable)
   • drag start/end hooks — the page owns the drop targets

  Data shape is PipelineCandidate. Emits are the semantic events; parent
  wires them to useJobPipeline mutations so the DnD path and the menu path
  share one code path (as required by the a11y spec).
-->
<script setup lang="ts">
import { MapPin, MessageSquare, CornerUpLeft, MoreHorizontal, ArrowLeftRight } from 'lucide-vue-next'
import { BrandLimeCheckbox } from '~/components/brand'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import type { PipelineCandidate, PipelineStage } from '~/types'

const props = defineProps<{
  candidate: PipelineCandidate
  stageKey: string
  /** Stages the "Move to…" menu can jump to (usually every stage minus the current). */
  moveTargets: PipelineStage[]
  /** true when this card is in the parent's selection Set. */
  selected: boolean
  /** true when this card is the one being dragged — parent uses drag state for opacity. */
  dragging: boolean
}>()

const emit = defineEmits<{
  'toggle-select': [id: string]
  'move':          [id: string, fromKey: string, toKey: string]
  'drag-start':    [id: string, fromKey: string, event: DragEvent]
  'drag-end':      []
}>()

function onDragStart(e: DragEvent) {
  emit('drag-start', props.candidate.id, props.stageKey, e)
}
</script>

<template>
  <article
    draggable="true"
    class="group border rounded-[12px] overflow-hidden hover:shadow-[0_2px_8px_rgba(0,20,18,0.06)] transition-all cursor-grab active:cursor-grabbing"
    :class="[
      props.selected
        ? 'bg-[var(--brand-lime-tint)] border-[var(--brand-teal)]/40'
        : 'bg-white border-[var(--brand-border-light)]',
      props.dragging ? 'opacity-40 border-dashed' : '',
    ]"
    @dragstart="onDragStart"
    @dragend="emit('drag-end')"
  >
    <div class="flex items-start gap-2.5 px-3.5 py-3">
      <!-- Avatar ↔ checkbox swap. Idle: avatar. Hover: checkbox replaces
           avatar in-place. Selected: checkbox stays.
           Kept inline (not BrandAvatarInitials) so we can absolute-overlay
           the checkbox at the exact same slot. -->
      <span class="relative inline-flex w-6 h-6 shrink-0 mt-px">
        <img
          v-if="props.candidate.avatarUrl"
          :src="props.candidate.avatarUrl"
          :alt="props.candidate.name"
          class="absolute inset-0 w-6 h-6 rounded-full object-cover bg-[var(--brand-canvas)] transition-opacity"
          :class="props.selected ? 'opacity-0' : 'group-hover:opacity-0'"
          :aria-hidden="props.selected ? 'true' : undefined"
        >
        <span
          v-else
          class="absolute inset-0 rounded-full bg-[var(--brand-teal)] text-white inline-flex items-center justify-center font-bold text-[10px] transition-opacity"
          :class="props.selected ? 'opacity-0' : 'group-hover:opacity-0'"
          :aria-hidden="props.selected ? 'true' : undefined"
        >{{ props.candidate.initials }}</span>
        <span
          class="absolute inset-0 inline-flex items-center justify-center transition-opacity"
          :class="props.selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
          @click.stop
        >
          <BrandLimeCheckbox
            :model-value="props.selected"
            :aria-label="`Select ${props.candidate.name}`"
            @update:model-value="() => emit('toggle-select', props.candidate.id)"
          />
        </span>
      </span>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <span class="text-[14px] font-semibold text-[var(--brand-text)] truncate">{{ props.candidate.name }}</span>
          <span
            v-if="props.candidate.isNew"
            class="text-[10px] font-bold tracking-wider text-[var(--brand-pipeline-blue)] border border-[color-mix(in_srgb,var(--brand-pipeline-blue)_30%,white)] bg-[color-mix(in_srgb,var(--brand-pipeline-blue)_10%,white)] rounded px-1.5 py-px shrink-0"
          >NEW</span>
        </div>
        <div class="flex items-center gap-3 mt-1.5 text-[12.5px] text-[var(--brand-text-quiet)]">
          <span class="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)] rounded px-1.5 py-0.5">
            AI SCORE
            <span class="text-[10px] text-[var(--brand-text)]">{{ props.candidate.aiScore }}%</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <MessageSquare class="w-3.5 h-3.5" stroke-width="1.5" />
            {{ props.candidate.notes }}
          </span>
          <span class="inline-flex items-center gap-1">
            <CornerUpLeft class="w-3.5 h-3.5" stroke-width="1.5" />
            {{ props.candidate.replies }}
          </span>
        </div>
      </div>

      <!-- Keyboard-accessible action menu. "Move to…" mirrors what
           drag-and-drop does, so keyboard-only users reach the same
           functionality without touching HTML5 DnD. -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-[var(--brand-canvas)] transition"
            :aria-label="`Actions for ${props.candidate.name}`"
            @click.stop
            @keydown.stop
          >
            <MoreHorizontal class="w-4 h-4" stroke-width="1.8" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-[220px] p-1">
          <div class="px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)]">
            Move to
          </div>
          <DropdownMenuItem
            v-for="target in props.moveTargets"
            :key="target.key"
            class="flex items-center gap-2.5 px-2 py-1.5 text-[13.5px] cursor-pointer"
            @select="emit('move', props.candidate.id, props.stageKey, target.key)"
          >
            <ArrowLeftRight class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
            <span class="flex-1">{{ target.label }}</span>
            <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: target.dot }" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div v-if="props.candidate.location" class="border-t border-[var(--brand-border-fade)] px-3.5 py-2 flex items-center gap-3.5 text-[12.5px] text-[var(--brand-text-quiet)]">
      <span class="inline-flex items-center gap-1.5">
        <MapPin class="w-3.5 h-3.5" stroke-width="1.5" />
        {{ props.candidate.location }}
      </span>
    </div>
  </article>
</template>
