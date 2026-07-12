<!--
  "Per page: 15 ▾" dropdown that sits bottom-right of the table.
  Options 15/25/50/100. Changing it should also reset to page 1 in the parent.
-->
<script setup lang="ts">
import { ChevronDown, ChevronLeft, ChevronRight, ListFilter } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

const props = defineProps<{
  perPage: number
  currentPage: number
  totalPages: number
}>()
const emit = defineEmits<{ change: [n: number]; pageChange: [n: number] }>()

const PER_PAGE_OPTIONS = [15, 25, 50, 100]
const isFirst = computed(() => props.currentPage <= 1)
const isLast = computed(() => props.currentPage >= props.totalPages)
</script>

<template>
  <div class="flex items-center justify-end gap-2 py-2 px-1">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="outline"
          size="sm"
          class="text-[13px] text-[var(--brand-text-secondary)] gap-1.5 h-9 rounded-xl border-[var(--brand-border)]"
        >
          <ListFilter class="w-3.5 h-3.5" />
          Per page: {{ perPage }}
          <ChevronDown class="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-40">
        <DropdownMenuItem
          v-for="n in PER_PAGE_OPTIONS"
          :key="n"
          class="text-[13.5px] cursor-pointer"
          :class="n === perPage
            ? 'font-semibold text-[var(--brand-text)]'
            : 'text-[var(--brand-text-secondary)]'"
          @click="$emit('change', n)"
        >
          {{ n }} per page
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <div class="flex items-center h-9 rounded-xl border border-[var(--brand-border)] overflow-hidden">
      <button
        class="h-9 w-9 flex items-center justify-center text-[var(--brand-text-subtle)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
        :disabled="isFirst"
        aria-label="Previous page"
        @click="emit('pageChange', currentPage - 1)"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>
      <div class="w-px self-stretch bg-[var(--brand-border)]" />
      <button
        class="h-9 w-9 flex items-center justify-center text-[var(--brand-text-subtle)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
        :disabled="isLast"
        aria-label="Next page"
        @click="emit('pageChange', currentPage + 1)"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
