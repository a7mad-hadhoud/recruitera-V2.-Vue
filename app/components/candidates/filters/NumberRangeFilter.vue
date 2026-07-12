<!-- number-range: Screening score / Evaluation score. Min-Max inputs. -->
<script setup lang="ts">
import type { FilterCatalogEntry, ActiveFilter } from '~/types/candidate-filter.types'
import FilterGroupHeader from './FilterGroupHeader.vue'

const props = defineProps<{ entry: FilterCatalogEntry; active: ActiveFilter }>()
const emit = defineEmits<{ remove: []; update: [patch: Partial<ActiveFilter>] }>()

function setMin(v: string) {
  const min = v === '' ? undefined : Number(v)
  emit('update', { range: { ...(props.active.range ?? {}), min } })
}
function setMax(v: string) {
  const max = v === '' ? undefined : Number(v)
  emit('update', { range: { ...(props.active.range ?? {}), max } })
}
</script>

<template>
  <div>
    <FilterGroupHeader :title="entry.name" @clear="$emit('remove')" />
    <div class="flex items-center gap-2 rounded-[12px] border border-[var(--brand-border)] bg-white px-3 py-2">
      <input
        type="number"
        placeholder="Min"
        :value="active.range?.min ?? ''"
        class="flex-1 h-8 px-2 rounded-md text-[13.5px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)] outline-none focus:bg-[var(--brand-canvas)] tabular-nums"
        @input="setMin(($event.target as HTMLInputElement).value)"
      />
      <span class="text-[var(--brand-text-quiet)]">–</span>
      <input
        type="number"
        placeholder="Max"
        :value="active.range?.max ?? ''"
        class="flex-1 h-8 px-2 rounded-md text-[13.5px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)] outline-none focus:bg-[var(--brand-canvas)] tabular-nums"
        @input="setMax(($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
