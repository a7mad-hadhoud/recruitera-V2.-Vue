<!-- date-range: Hire date / Start date / Date created. Preset picker per screen 9. -->
<script setup lang="ts">
import { Calendar, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { FilterCatalogEntry, ActiveFilter } from '~/types/candidate-filter.types'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { BrandFilterGroup } from '~/components/brand'

const props = defineProps<{ entry: FilterCatalogEntry; active: ActiveFilter }>()
const emit = defineEmits<{ remove: []; update: [patch: Partial<ActiveFilter>] }>()

const open = ref(false)

const presets = [
  ['Today',     'today'],     ['Yesterday',   'yesterday'],
  ['This week', 'this-week'], ['Last week',   'last-week'],
  ['This month','this-month'],['Last month',  'last-month'],
  ['This quarter','this-quarter'],['Last quarter','last-quarter'],
  ['This year', 'this-year'], ['Last year',   'last-year'],
  ['Last 30 days','last-30'], ['Last 60 days','last-60'],
] as const

const label = computed(() => {
  const p = props.active.date?.preset
  if (!p) return 'Select date range'
  return presets.find(([, v]) => v === p)?.[0] ?? p
})

function pick(preset: string) {
  emit('update', { date: { preset } })
  open.value = false
}
</script>

<template>
  <BrandFilterGroup :title="entry.name" @clear="$emit('remove')">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <button
          class="w-full flex items-center gap-2 h-10 px-3 rounded-[10px] border border-[var(--brand-border)] bg-white text-[13.5px] text-[var(--brand-text-quiet)] hover:border-[var(--brand-border-mid)] transition-colors"
        >
          <Calendar class="w-3.5 h-3.5" />
          <span class="flex-1 text-left" :class="active.date?.preset ? 'text-[var(--brand-text)] font-medium' : ''">
            {{ label }}
          </span>
          <component :is="open ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" stroke-width="1.7" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        :side-offset="4"
        class="w-[420px] p-0 rounded-[10px] border-[var(--brand-border-light)] shadow-[0_8px_24px_rgba(0,20,18,0.14)] overflow-hidden"
      >
        <div class="text-center font-bold text-[14px] text-[var(--brand-text)] py-3 border-b border-[var(--brand-border-fade)] bg-[var(--brand-canvas)]">
          Custom date range
        </div>
        <div class="grid grid-cols-2">
          <button
            v-for="[l, v] in presets"
            :key="v"
            class="text-left px-4 py-2.5 text-[14px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] border-r border-b border-[var(--brand-border-fade)] last:border-r-0 [&:nth-last-child(-n+2)]:border-b-0"
            @click="pick(v)"
          >{{ l }}</button>
        </div>
        <button
          class="w-full text-left px-4 py-3 text-[14px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] border-t border-[var(--brand-border-fade)]"
          @click="pick('custom')"
        >Custom date range</button>
      </PopoverContent>
    </Popover>
  </BrandFilterGroup>
</template>
