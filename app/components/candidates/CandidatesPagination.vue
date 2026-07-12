<!--
  Prev/next arrows + count only. Deliberately NO page number buttons — datasets
  can be 100k+ candidates, so windowed pagination is wrong (25k / 15 = ~1700 pages).
  Count uses toLocaleString for grouping ("100,000" not "100000").
-->
<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const props = defineProps<{
  currentPage: number
  totalPages: number
  total: number
  perPage: number
}>()

const emit = defineEmits<{ change: [page: number] }>()

const start = computed(() => (props.currentPage - 1) * props.perPage + 1)
const end   = computed(() => Math.min(props.currentPage * props.perPage, props.total))
const isFirst = computed(() => props.currentPage <= 1)
const isLast  = computed(() => props.currentPage >= props.totalPages)
</script>

<template>
  <div class="flex items-center gap-1">
    <span class="text-[13px] tabular-nums mr-2 text-[var(--brand-text-muted)]">
      <template v-if="total === 0">0 candidates</template>
      <template v-else>
        {{ start.toLocaleString() }} – {{ end.toLocaleString() }} of {{ total.toLocaleString() }} candidates
      </template>
    </span>
    <Button
      variant="outline"
      size="icon"
      class="h-8 w-8 border-[var(--brand-border)] text-[var(--brand-text-subtle)]"
      :disabled="isFirst"
      aria-label="Previous page"
      @click="emit('change', currentPage - 1)"
    >
      <ChevronLeft class="w-4 h-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      class="h-8 w-8 border-[var(--brand-border)] text-[var(--brand-text-subtle)]"
      :disabled="isLast"
      aria-label="Next page"
      @click="emit('change', currentPage + 1)"
    >
      <ChevronRight class="w-4 h-4" />
    </Button>
  </div>
</template>
