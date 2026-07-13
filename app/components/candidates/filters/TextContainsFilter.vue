<!-- text-contains: Education (School / Degree / Subject contains). -->
<script setup lang="ts">
import { CornerDownLeft } from 'lucide-vue-next'
import type { FilterCatalogEntry, ActiveFilter } from '~/types/candidate-filter.types'
import { BrandFilterGroup } from '~/components/brand'

const props = defineProps<{ entry: FilterCatalogEntry; active: ActiveFilter }>()
const emit = defineEmits<{ remove: []; update: [patch: Partial<ActiveFilter>] }>()

const operatorLabel = computed(() =>
  props.entry.operators.find(o => o.value === props.active.op)?.label ?? props.entry.name,
)

function setText(v: string) { emit('update', { text: v }) }
</script>

<template>
  <BrandFilterGroup :title="operatorLabel" @clear="$emit('remove')">
    <div class="relative">
      <input
        type="text"
        placeholder="Type name…"
        :value="active.text ?? ''"
        class="w-full h-10 px-3 pr-9 rounded-[10px] border-[1.5px] border-[var(--brand-lime)] bg-white text-[13.5px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)] outline-none focus-visible:border-[var(--brand-lime)]"
        @input="setText(($event.target as HTMLInputElement).value)"
      />
      <CornerDownLeft class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
    </div>
  </BrandFilterGroup>
</template>
