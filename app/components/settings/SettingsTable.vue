<!--
  Toolbar (search + count + CTA slot) + table shell shared by every settings
  list page (Locations, Departments, Job Titles, Team members, …). Wraps
  BrandDataTable for the outer chrome so settings tables stay pixel-identical
  to Candidates/Jobs tables. Search is debounced 250ms via refDebounced so
  callers can filter client- or server-side off `update:search` without
  re-filtering on every keystroke.

  Slots:
   - `actions`  toolbar-right CTA (e.g. "New location" button)
   - `header`   <TableRow> of <TableHead>s
   - default    <TableRow> of <TableCell>s (body)
-->
<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { Search } from 'lucide-vue-next'
import { BrandDataTable } from '~/components/brand'
import { TableBody, TableCell, TableHeader, TableRow } from '~/components/ui/table'

const props = withDefaults(defineProps<{
  searchPlaceholder?: string
  itemLabel: string
  total: number
  filteredCount: number
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  colspan: number
}>(), {
  searchPlaceholder: 'Search',
  loading: false,
  empty: false,
  emptyMessage: 'No results match.',
})

const emit = defineEmits<{ 'update:search': [v: string] }>()

const search = ref('')
const debouncedSearch = refDebounced(search, 250)
watch(debouncedSearch, v => emit('update:search', v))
</script>

<template>
  <div class="flex items-center gap-2.5 mb-4">
    <div class="flex-1 flex items-center gap-2.5 bg-[var(--brand-surface-white)] border border-[var(--brand-border)] rounded-[12px] px-[14px] py-[10px] text-[var(--brand-text-quiet)]">
      <Search class="w-4 h-4 shrink-0" />
      <input
        v-model="search"
        type="text"
        :placeholder="searchPlaceholder"
        class="flex-1 border-0 outline-none bg-transparent text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]"
      >
    </div>
    <span class="text-[13.5px] text-[var(--brand-text-muted)] tabular-nums whitespace-nowrap">
      <strong>1–{{ filteredCount }}</strong> of <strong>{{ total }}</strong> {{ itemLabel }}
    </span>
    <slot name="actions" />
  </div>

  <BrandDataTable>
    <template #header>
      <TableHeader>
        <slot name="header" />
      </TableHeader>
    </template>
    <TableBody>
      <TableRow v-if="loading">
        <TableCell :colspan="colspan" class="text-center py-8 text-[13px] text-[var(--brand-text-muted)]">Loading…</TableCell>
      </TableRow>
      <TableRow v-else-if="empty">
        <TableCell :colspan="colspan" class="text-center py-8 text-[13px] text-[var(--brand-text-muted)]">{{ emptyMessage }}</TableCell>
      </TableRow>
      <slot v-else />
    </TableBody>
  </BrandDataTable>
</template>
