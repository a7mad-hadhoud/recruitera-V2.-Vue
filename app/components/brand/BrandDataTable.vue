<!--
  Standard data-table shell shared by every list page. Owns the outer border,
  rounded corner, subtle shadow, and horizontal scroll behaviour. Slots:
   - `header` for <TableHeader>
   - default for <TableBody>
  Change the outer chrome here → propagates to every table (Candidates,
  Jobs, Talent pools, Interviews, etc.).
-->
<script setup lang="ts">
import { Table } from '~/components/ui/table'
</script>

<template>
  <div class="rounded-[14px] border border-[var(--brand-border-light)] overflow-x-auto shadow-[0_1px_2px_rgba(0,20,18,0.04)]">
    <Table class="table-fixed border-collapse w-auto min-w-full">
      <slot name="header" />
      <slot />
    </Table>
  </div>
</template>
