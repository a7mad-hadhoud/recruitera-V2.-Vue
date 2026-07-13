<!--
  event-scheduled composite: multi-select event types + a date range picker
  in the same panel. `values` holds the ticked event types, `date` holds the
  chosen date preset (same shape DateRangeFilter uses).
-->
<script setup lang="ts">
import type { FilterCatalogEntry, ActiveFilter } from '~/types/candidate-filter.types'
import { BrandFilterGroup, BrandFilterOption } from '~/components/brand'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

const props = defineProps<{ entry: FilterCatalogEntry; active: ActiveFilter }>()
const emit = defineEmits<{ remove: []; update: [patch: Partial<ActiveFilter>] }>()

function toggle(v: string) {
  const cur = props.active.values ?? []
  const next = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]
  emit('update', { values: next })
}

const open = ref(false)
const presets = [
  ['Today', 'today'], ['Yesterday', 'yesterday'],
  ['This week', 'this-week'], ['Last week', 'last-week'],
  ['This month', 'this-month'], ['Last month', 'last-month'],
  ['Custom date range', 'custom'],
] as const

const dateLabel = computed(() => {
  const p = props.active.date?.preset
  if (!p) return 'Select date range'
  return presets.find(([, v]) => v === p)?.[0] ?? p
})

function pickDate(preset: string) {
  emit('update', { date: { preset } })
  open.value = false
}
</script>

<template>
  <BrandFilterGroup :title="entry.name" @clear="$emit('remove')">
    <div class="flex flex-col mb-2">
      <BrandFilterOption
        v-for="opt in entry.options ?? []"
        :key="opt.value"
        :label="opt.label"
        :count="opt.count ?? 0"
        :model-value="(active.values ?? []).includes(opt.value)"
        @update:model-value="toggle(opt.value)"
      />
    </div>
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <button
          class="w-full flex items-center gap-2 h-10 px-3 rounded-[10px] border border-[var(--brand-border)] bg-white text-[13.5px] text-[var(--brand-text-quiet)] hover:border-[var(--brand-border-mid)] transition-colors"
        >
          <Calendar class="w-3.5 h-3.5" />
          <span
            class="flex-1 text-left"
            :class="active.date?.preset ? 'text-[var(--brand-text)] font-medium' : ''"
          >{{ dateLabel }}</span>
          <component :is="open ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" stroke-width="1.7" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        :side-offset="4"
        class="w-[280px] p-0 rounded-[10px] border-[var(--brand-border-light)] shadow-[0_8px_24px_rgba(0,20,18,0.12)] overflow-hidden"
      >
        <div class="py-1">
          <button
            v-for="[l, v] in presets"
            :key="v"
            class="w-full text-left px-4 py-2.5 text-[14px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] transition-colors"
            @click="pickDate(v)"
          >{{ l }}</button>
        </div>
      </PopoverContent>
    </Popover>
  </BrandFilterGroup>
</template>
