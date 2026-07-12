<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Pencil, MoreHorizontal, Plus, Search } from 'lucide-vue-next'
import { useLocations } from '~/composables/useLocations'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useLocations()
const locations = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.total ?? 0)
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return locations.value
  return locations.value.filter(l =>
    l.name.toLowerCase().includes(q)
    || l.country.toLowerCase().includes(q)
    || l.city.toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="p-6 max-w-5xl">
    <div class="mb-1 text-[24px] font-bold tracking-tight text-[var(--brand-text)]">Locations</div>
    <div class="text-[13.5px] text-[var(--brand-text-quiet)] mb-6">Manage locations for your organization</div>

    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-text-quiet)]" />
        <Input v-model="search" placeholder="Search locations" class="pl-9 h-10 rounded-lg" />
      </div>
      <span class="text-[13px] text-[var(--brand-text-muted)] tabular-nums">
        1–{{ filtered.length }} of {{ total }} locations
      </span>
      <Button class="ml-auto bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90 h-10 rounded-lg font-semibold">
        <Plus class="w-4 h-4 mr-1" />
        New location
      </Button>
    </div>

    <div class="rounded-xl border border-[var(--brand-border)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="border-b border-[var(--brand-border)] bg-[var(--brand-canvas)]">
            <TableHead class="text-[12.5px] font-semibold text-[var(--brand-text)]">Location name</TableHead>
            <TableHead class="text-[12.5px] font-semibold text-[var(--brand-text)]">Country / City</TableHead>
            <TableHead class="text-[12.5px] font-semibold text-[var(--brand-text)]">Jobs</TableHead>
            <TableHead class="text-right w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="4" class="text-center py-8 text-[13px] text-[var(--brand-text-muted)]">Loading…</TableCell>
          </TableRow>
          <TableRow v-else-if="!filtered.length">
            <TableCell colspan="4" class="text-center py-8 text-[13px] text-[var(--brand-text-muted)]">No locations match.</TableCell>
          </TableRow>
          <TableRow
            v-for="loc in filtered"
            :key="loc.id"
            class="hover:bg-[var(--brand-surface-table-alt)]/60 border-b border-[var(--brand-border-light)] last:border-0"
          >
            <TableCell class="font-semibold text-[13.5px] text-[var(--brand-text)]">{{ loc.name }}</TableCell>
            <TableCell class="text-[13px] text-[var(--brand-text-secondary)]">{{ loc.country }} · {{ loc.city }}</TableCell>
            <TableCell>
              <Badge variant="secondary" class="bg-[var(--brand-lime-tint)] text-[var(--brand-text-secondary)] border-0 text-[11px] font-semibold">
                {{ loc.jobCount }} jobs
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center gap-1 justify-end">
                <button class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-muted)] hover:bg-black/[.05]">
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-muted)] hover:bg-black/[.05]">
                  <MoreHorizontal class="w-3.5 h-3.5" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
