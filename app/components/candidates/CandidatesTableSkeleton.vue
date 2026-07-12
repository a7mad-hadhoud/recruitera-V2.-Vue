<!--
  Renders 15 skeleton rows matching the real table's column structure.
  Prevents layout shift when data lands. Never use a spinner for table loading.
-->
<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow class="hover:bg-transparent border-b border-[var(--brand-border)]">
        <TableHead class="w-10" />
        <TableHead class="text-[13px] font-semibold text-[var(--brand-text)]">Name</TableHead>
        <TableHead class="text-[13px] font-semibold text-[var(--brand-text)]">Job</TableHead>
        <TableHead class="text-[13px] font-semibold text-[var(--brand-text)]">Date created</TableHead>
        <TableHead class="text-[13px] font-semibold text-[var(--brand-text)]">Talent pool</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="i in 15" :key="i" class="h-12 border-b border-[var(--brand-border-light)]">
        <TableCell>
          <Skeleton class="w-4 h-4 rounded" />
        </TableCell>
        <TableCell>
          <div class="flex items-center gap-3">
            <Skeleton class="w-8 h-8 rounded-full" />
            <Skeleton class="h-4 w-36" />
          </div>
        </TableCell>
        <TableCell><Skeleton class="h-4 w-28" /></TableCell>
        <TableCell><Skeleton class="h-4 w-20" /></TableCell>
        <TableCell><Skeleton class="h-5 w-24 rounded-full" /></TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
