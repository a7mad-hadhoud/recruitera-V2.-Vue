<!--
  Inline status picker for a Job. Same dot+label+chevron trigger + dropdown
  used by both the Status column and the Card view — one component instead of
  duplicated markup.

  The dot+label rendering delegates to BrandStatusBadge (variant="dot",
  plainLabel) so the design system stays the source of truth: change a
  --brand-status-* token in main.css and every status pill in the app
  updates together.
-->
<script setup lang="ts">
import { ChevronDown, Check } from 'lucide-vue-next'
import { BrandStatusBadge } from '~/components/brand'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import type { JobStatus } from '~/types'

type Tone = 'approved' | 'teal-green' | 'gray' | 'closed' | 'neutral'

// Map JobStatus → { label (verb form), BrandStatusBadge tone }.
// Keeps the display + option list in one place so both trigger and menu
// items agree on labels + colors.
const STATUS: Record<JobStatus, { label: string; tone: Tone }> = {
  published: { label: 'Publish',        tone: 'approved' },
  internal:  { label: 'Use Internally', tone: 'teal-green' },
  draft:     { label: 'Draft',          tone: 'gray' },
  closed:    { label: 'Close',          tone: 'closed' },
  archived:  { label: 'Archived',       tone: 'neutral' },
}
const OPTIONS: JobStatus[] = ['published', 'internal', 'draft', 'closed', 'archived']

const props = defineProps<{
  modelValue: JobStatus
  align?: 'start' | 'end' | 'center'
}>()

const emit = defineEmits<{
  'update:modelValue': [status: JobStatus]
}>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        class="inline-flex items-center gap-1.5 h-8 px-2 rounded-md text-[13.5px] hover:bg-[var(--brand-lime-tint)]/50 transition"
        :aria-label="`Change status (currently ${STATUS[props.modelValue].label})`"
        @click.stop
      >
        <BrandStatusBadge
          variant="dot"
          plain-label
          :tone="STATUS[props.modelValue].tone"
          :label="STATUS[props.modelValue].label"
        />
        <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)] shrink-0" stroke-width="2" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent :align="props.align ?? 'start'" class="w-[180px] p-1">
      <DropdownMenuItem
        v-for="opt in OPTIONS"
        :key="opt"
        class="flex items-center gap-2 px-2 py-1.5 text-[13.5px] cursor-pointer"
        @select="emit('update:modelValue', opt)"
      >
        <BrandStatusBadge
          variant="dot"
          plain-label
          :tone="STATUS[opt].tone"
          :label="STATUS[opt].label"
        />
        <span class="flex-1" />
        <Check
          v-if="opt === props.modelValue"
          class="w-3.5 h-3.5 text-[var(--brand-status-approved-text)] shrink-0"
          stroke-width="2.5"
        />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
