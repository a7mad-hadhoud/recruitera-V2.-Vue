<!--
  Radio filter — one-of-two boolean choice.
  CV or resume: "Has CV or resume" / "Does not have a CV or resume".
  Similar profiles: "Matching data" / "Not matching data".
  The chosen value lives in `active.text` (single string) to reuse the schema.
-->
<script setup lang="ts">
import type { FilterCatalogEntry, ActiveFilter } from '~/types/candidate-filter.types'
import { BrandFilterGroup } from '~/components/brand'

const props = defineProps<{ entry: FilterCatalogEntry; active: ActiveFilter }>()
const emit = defineEmits<{ remove: []; update: [patch: Partial<ActiveFilter>] }>()

function pick(v: string) {
  emit('update', { text: v })
}
</script>

<template>
  <BrandFilterGroup :title="entry.name" @clear="$emit('remove')">
    <div class="flex flex-col">
      <label
        v-for="opt in entry.options ?? []"
        :key="opt.value"
        class="flex items-center gap-3 px-2.5 py-2 rounded-lg text-[14px] cursor-pointer text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)] transition-colors"
      >
        <span
          class="w-[18px] h-[18px] rounded-full border-[1.6px] shrink-0 flex items-center justify-center transition-colors"
          :class="active.text === opt.value
            ? 'border-[var(--brand-lime)]'
            : 'border-[var(--brand-border-mid)] hover:border-[var(--brand-text-quiet)]'"
        >
          <span
            v-if="active.text === opt.value"
            class="w-[10px] h-[10px] rounded-full bg-[var(--brand-lime)]"
          />
        </span>
        <input
          type="radio"
          class="sr-only"
          :checked="active.text === opt.value"
          @change="pick(opt.value)"
        />
        <span class="flex-1">{{ opt.label }}</span>
      </label>
    </div>
  </BrandFilterGroup>
</template>
