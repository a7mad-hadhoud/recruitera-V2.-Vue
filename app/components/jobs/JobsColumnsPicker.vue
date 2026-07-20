<!--
  Column visibility popover — Recruitee-style "Properties" panel:
   • search input at the top
   • "Displayed" section listing currently-visible columns
   • "Hidden" section listing the rest
   • Drag handle affordance on every row (reorder wiring lands with
     `useJobsColumns.reorder()` — visual only for now)
   • Title + Status are locked at the top of Displayed (checkbox disabled)
  All colors are design-system tokens so a future palette swap propagates.
-->
<script setup lang="ts">
import { Columns3, Search, GripVertical } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Checkbox } from '~/components/ui/checkbox'
import {
  useJobsColumns,
  JOB_COLUMN_KEYS,
  JOB_COLUMN_LABELS,
  type JobColumnKey,
} from '~/composables/useJobsColumns'

const { isVisible, isLocked, toggle } = useJobsColumns()

const search = ref('')
const matches = (k: JobColumnKey) => {
  const term = search.value.trim().toLowerCase()
  return !term || JOB_COLUMN_LABELS[k].toLowerCase().includes(term)
}

const displayedKeys = computed(() => JOB_COLUMN_KEYS.filter(k => isVisible(k) && matches(k)))
const hiddenKeys    = computed(() => JOB_COLUMN_KEYS.filter(k => !isVisible(k) && matches(k)))
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <BrandButton variant="outline">
        <Columns3 class="w-4 h-4 mr-1.5" stroke-width="1.8" />
        Columns
      </BrandButton>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      :side-offset="8"
      class="w-[320px] p-0 rounded-[12px] border border-[var(--brand-border-light)] shadow-[0_8px_32px_rgba(0,20,18,0.16)] overflow-hidden"
    >
      <!-- Search -->
      <div class="p-2.5 border-b border-[var(--brand-border-fade)]">
        <div class="flex items-center gap-2 px-3 h-9 rounded-[8px] bg-[var(--brand-canvas)] border border-[var(--brand-border-light)]">
          <Search class="w-3.5 h-3.5 text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.8" />
          <input
            v-model="search"
            type="text"
            placeholder="Search properties"
            class="flex-1 bg-transparent outline-none text-[13px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]"
          >
        </div>
      </div>

      <div class="max-h-[420px] overflow-y-auto">
        <!-- Displayed section -->
        <template v-if="displayedKeys.length">
          <div class="px-4 py-2.5 text-center text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-secondary)] border-b border-[var(--brand-border-fade)]">
            Displayed
          </div>
          <label
            v-for="k in displayedKeys"
            :key="k"
            class="flex items-center gap-2.5 px-4 py-2 text-[13.5px] text-[var(--brand-text)] cursor-pointer hover:bg-[var(--brand-lime-tint)]/40"
            :class="isLocked(k) ? 'opacity-70' : ''"
          >
            <Checkbox
              :model-value="true"
              :disabled="isLocked(k)"
              @update:model-value="() => toggle(k)"
            />
            <span class="flex-1">{{ JOB_COLUMN_LABELS[k] }}</span>
            <GripVertical class="w-3.5 h-3.5 text-[var(--brand-text-faint)]" stroke-width="1.6" />
          </label>
        </template>

        <!-- Hidden section -->
        <template v-if="hiddenKeys.length">
          <div class="px-4 py-2.5 text-center text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-secondary)] border-t border-b border-[var(--brand-border-fade)] bg-[var(--brand-canvas)]/60">
            Hidden
          </div>
          <label
            v-for="k in hiddenKeys"
            :key="k"
            class="flex items-center gap-2.5 px-4 py-2 text-[13.5px] text-[var(--brand-text)] cursor-pointer hover:bg-[var(--brand-lime-tint)]/40"
          >
            <Checkbox
              :model-value="false"
              @update:model-value="() => toggle(k)"
            />
            <span class="flex-1">{{ JOB_COLUMN_LABELS[k] }}</span>
            <GripVertical class="w-3.5 h-3.5 text-[var(--brand-text-faint)]" stroke-width="1.6" />
          </label>
        </template>

        <div v-if="!displayedKeys.length && !hiddenKeys.length" class="px-4 py-6 text-center text-[13px] text-[var(--brand-text-quiet)]">
          No properties match "{{ search }}"
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
