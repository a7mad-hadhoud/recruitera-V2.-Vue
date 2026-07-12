<!--
  Generic skeleton rows for settings list pages — column widths are passed in
  so each page's skeleton matches its real column layout without a bespoke
  skeleton component per page. Prevents layout shift while data loads; never
  use a spinner here (see CandidatesTableSkeleton for the same convention).
-->
<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'
import { TableCell, TableRow } from '~/components/ui/table'

withDefaults(defineProps<{
  columns?: number
  rows?: number
}>(), {
  columns: 3,
  rows: 6,
})
</script>

<template>
  <TableRow
    v-for="i in rows"
    :key="i"
    class="h-12 border-b border-[var(--brand-border-light)] last:border-0"
    :class="i % 2 === 0 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
  >
    <TableCell v-for="c in columns" :key="c">
      <Skeleton class="h-4" :class="c === 1 ? 'w-36' : 'w-24'" />
    </TableCell>
  </TableRow>
</template>
