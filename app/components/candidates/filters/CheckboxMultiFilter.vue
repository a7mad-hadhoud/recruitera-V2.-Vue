<!-- checkbox-multi: Candidate origin / Hiring status / Disqualification type / etc. -->
<script setup lang="ts">
import type { FilterCatalogEntry, ActiveFilter } from '~/types/candidate-filter.types'
import { BrandFilterGroup, BrandFilterOption } from '~/components/brand'

const props = defineProps<{ entry: FilterCatalogEntry; active: ActiveFilter }>()
const emit = defineEmits<{ remove: []; update: [patch: Partial<ActiveFilter>] }>()

function toggle(v: string) {
  const cur = props.active.values ?? []
  const next = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]
  emit('update', { values: next })
}
</script>

<template>
  <BrandFilterGroup :title="entry.name" @clear="$emit('remove')">
    <BrandFilterOption
      v-for="opt in entry.options ?? []"
      :key="opt.value"
      :label="opt.label"
      :count="opt.count ?? 0"
      :model-value="(active.values ?? []).includes(opt.value)"
      @update:model-value="toggle(opt.value)"
    />
  </BrandFilterGroup>
</template>
