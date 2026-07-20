<!--
  Columns dropdown, matching the reference (Recruitera Jobs Standalone.html):
   - 260px card with "Adjust columns" header
   - Scrollable list of checkboxes for every column key
   - Title + Status locked (always shown, disabled)
  Anchored to the Columns button via <Popover>.
-->
<script setup lang="ts">
import { Columns3 } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Checkbox } from '~/components/ui/checkbox'
import { useJobsColumns, JOB_COLUMN_KEYS, JOB_COLUMN_LABELS } from '~/composables/useJobsColumns'

const { isVisible, isLocked, toggle } = useJobsColumns()
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
      class="w-[260px] p-0 rounded-[12px] border border-[var(--brand-border-light)] shadow-[0_8px_32px_rgba(0,20,18,0.16)]"
    >
      <div class="px-4 py-3 text-[13px] font-bold text-[var(--brand-text-secondary)] border-b border-[var(--brand-border-fade)]">
        Adjust columns
      </div>
      <div class="py-1.5 max-h-[400px] overflow-y-auto">
        <label
          v-for="k in JOB_COLUMN_KEYS"
          :key="k"
          class="flex items-center gap-2.5 px-4 py-2 text-[13.5px] text-[var(--brand-text)] cursor-pointer hover:bg-[var(--brand-lime-tint)]/40"
          :class="isLocked(k) ? 'opacity-60 cursor-not-allowed' : ''"
        >
          <Checkbox
            :model-value="isVisible(k)"
            :disabled="isLocked(k)"
            @update:model-value="() => toggle(k)"
          />
          {{ JOB_COLUMN_LABELS[k] }}
        </label>
      </div>
    </PopoverContent>
  </Popover>
</template>
