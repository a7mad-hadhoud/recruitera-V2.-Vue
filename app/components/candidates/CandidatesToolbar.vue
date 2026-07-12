<!--
  Toolbar row. Transforms in place when rows are selected (Recruitee pattern) —
  bulk-action buttons replace the sort/view controls; the pagination + add-button
  on the right stay put. No floating bottom bar.
-->
<script setup lang="ts">
import {
  ChevronDown, Tag, Share2, X, Minus, MoreHorizontal,
  Trash2, Mail, MessageCircle, Ban, RotateCcw, Download,
  CheckSquare, UserPlus, ArrowUpRight, Bookmark, BookmarkX,
  GitMerge, Copy,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { BrandLimeCheckbox } from '~/components/brand'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import CandidatesPagination from './CandidatesPagination.vue'
import SortByDropdown from './SortByDropdown.vue'
import CandidatesColumnToggle from './CandidatesColumnToggle.vue'
import AddCandidatesModal from './AddCandidatesModal.vue'
import { useCandidatesStore } from '~/stores/candidates.store'

const props = defineProps<{
  pageIds: string[]      // ids of rows currently on the page
  total: number
  currentPage: number
  totalPages: number
  perPage: number
}>()

const emit = defineEmits<{ pageChange: [n: number] }>()

const store = useCandidatesStore()

const allOnPageSelected = computed(() =>
  props.pageIds.length > 0 && props.pageIds.every(id => store.selectedIds.includes(id)),
)

function toggleAllOnPage(next: boolean) {
  if (next) store.selectAll(props.pageIds)
  else store.clearSelection()
}
</script>

<template>
  <div class="flex items-center gap-3 py-2 flex-wrap">
    <!-- Checkbox + dropdown -->
    <div class="inline-flex items-center h-9 border border-[var(--brand-border)] rounded-lg overflow-hidden bg-white">
      <span class="flex items-center justify-center h-full px-2 hover:bg-[var(--brand-lime-tint-hover)] transition-colors">
        <BrandLimeCheckbox
          :model-value="allOnPageSelected"
          class="size-[18px] rounded-[5px]"
          @update:model-value="toggleAllOnPage"
        />
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button class="flex items-center justify-center h-full px-1.5 border-l border-[var(--brand-border)] text-[var(--brand-text-subtle)] hover:bg-[var(--brand-lime-tint-hover)] transition-colors">
            <ChevronDown class="w-3 h-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-28">
          <DropdownMenuItem @click="store.selectAll(pageIds)">All</DropdownMenuItem>
          <DropdownMenuItem @click="store.clearSelection()">None</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- SELECTION MODE -->
    <template v-if="store.hasSelection">
      <Button
        variant="outline"
        size="sm"
        class="h-8 gap-1.5 text-[13px] border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)]"
      >
        <Tag class="w-3.5 h-3.5" />
        Add tag
      </Button>
      <Button
        variant="outline"
        size="sm"
        class="h-8 gap-1.5 text-[13px] border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)]"
      >
        <Share2 class="w-3.5 h-3.5" />
        Share
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="sm"
            class="h-8 gap-1.5 text-[13px] border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)]"
          >
            More…
            <ChevronDown class="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-52">
          <DropdownMenuItem><CheckSquare class="w-3.5 h-3.5 mr-2" />Add task</DropdownMenuItem>
          <DropdownMenuItem><Ban class="w-3.5 h-3.5 mr-2" />Disqualify</DropdownMenuItem>
          <DropdownMenuItem><RotateCcw class="w-3.5 h-3.5 mr-2" />Requalify</DropdownMenuItem>
          <DropdownMenuItem><Mail class="w-3.5 h-3.5 mr-2" />Send email</DropdownMenuItem>
          <DropdownMenuItem><MessageCircle class="w-3.5 h-3.5 mr-2" />Send WhatsApp</DropdownMenuItem>
          <DropdownMenuItem><UserPlus class="w-3.5 h-3.5 mr-2" />Assign</DropdownMenuItem>
          <DropdownMenuItem><Minus class="w-3.5 h-3.5 mr-2" />Remove</DropdownMenuItem>
          <DropdownMenuItem><ArrowUpRight class="w-3.5 h-3.5 mr-2" />Add source</DropdownMenuItem>
          <DropdownMenuItem><Bookmark class="w-3.5 h-3.5 mr-2" />Follow</DropdownMenuItem>
          <DropdownMenuItem><BookmarkX class="w-3.5 h-3.5 mr-2" />Unfollow</DropdownMenuItem>
          <DropdownMenuItem><GitMerge class="w-3.5 h-3.5 mr-2" />Merge</DropdownMenuItem>
          <DropdownMenuItem><Copy class="w-3.5 h-3.5 mr-2" />Copy to other job</DropdownMenuItem>
          <DropdownMenuItem><Download class="w-3.5 h-3.5 mr-2" />Export CSV</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-[var(--brand-danger)] focus:text-[var(--brand-danger)]">
            <Trash2 class="w-3.5 h-3.5 mr-2" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-[var(--brand-text-quiet)]"
        aria-label="Clear selection"
        @click="store.clearSelection()"
      >
        <X class="w-4 h-4" />
      </Button>
    </template>

    <!-- Right side: count/pagination · Add candidates · Sort · Columns · More
         In selection mode the bulk action buttons appear on the LEFT above
         (via the template above), and the count replaces pagination here. -->
    <div class="ml-auto flex items-center gap-2">
      <span
        v-if="store.hasSelection"
        class="text-[13px] text-[var(--brand-text-muted)] tabular-nums whitespace-nowrap mr-1"
      >
        {{ store.selectedCount }} selected
      </span>
      <CandidatesPagination
        v-else
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        :per-page="perPage"
        @change="(p) => emit('pageChange', p)"
      />
      <AddCandidatesModal />
      <SortByDropdown />
      <CandidatesColumnToggle />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 rounded-lg border-[var(--brand-border)] text-[var(--brand-text-subtle)] hover:bg-[var(--brand-lime-tint-hover)]"
            aria-label="More"
          >
            <MoreHorizontal class="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuItem><Download class="w-3.5 h-3.5 mr-2" />Export to CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>
