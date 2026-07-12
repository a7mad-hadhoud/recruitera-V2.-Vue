<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import { Input } from '~/components/ui/input'
import ErrorBoundary from '~/components/ErrorBoundary.vue'
import CandidatesFilters from '~/components/candidates/CandidatesFilters.vue'
import CandidatesTable from '~/components/candidates/CandidatesTable.vue'
import CandidatesToolbar from '~/components/candidates/CandidatesToolbar.vue'
import CandidatesTableSkeleton from '~/components/candidates/CandidatesTableSkeleton.vue'
import CandidatesEmptyState from '~/components/candidates/CandidatesEmptyState.vue'
import CandidatesPerPage from '~/components/candidates/CandidatesPerPage.vue'
import SampleDataBanner from '~/components/candidates/SampleDataBanner.vue'
// Heavy / infrequently opened: lazy-loaded so JS ships only when the star is clicked.
const SaveSearchPopover = defineAsyncComponent(() => import('~/components/candidates/SaveSearchPopover.vue'))
import { useCandidates } from '~/composables/useCandidates'
import { useCandidateFilters } from '~/composables/useCandidateFilters'
import { useCandidatesStore } from '~/stores/candidates.store'

definePageMeta({ layout: 'default' })

const store = useCandidatesStore()
const { filters, setFilter, clearFilters, hasActiveFilters } = useCandidateFilters()

// 500ms debounce — search hits the API, dataset can be 100k rows
const searchInput = ref(filters.value.search)
const debouncedSearch = refDebounced(searchInput, 500)
watch(debouncedSearch, (v) => {
  if (v !== filters.value.search) setFilter('search', v)
})
// Reflect URL → input (back/forward)
watch(() => filters.value.search, (v) => {
  if (v !== searchInput.value) searchInput.value = v
})

// Vue Query keeps prior rows visible while the new page/filter loads
const { data, isLoading, isFetching } = useCandidates(computed(() => ({ ...filters.value })))
const candidates = computed(() => data.value?.data ?? [])
const total      = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 1)
const pageIds    = computed(() => candidates.value.map(c => c.id))

// Skeleton condition — matches the Recruitee/Tellent reference (skeleton on
// every fetch, not the placeholderData "dim previous data" pattern).
//
// Vue Query's `isLoading` alone is unreliable here: `placeholderData:
// keepPreviousData` collapses `isLoading` to false as soon as any placeholder
// exists, and Nuxt's payload extraction can seed the query cache before the
// component mounts. Using `isFetching` guarantees the skeleton renders while
// the API call is in flight, which is the loading state the design actually
// wants to communicate.
const showSkeleton = computed(() => isFetching.value)

// Clear selection on any filter change — bulk-action on wrong candidates is a real bug
watch(filters, () => store.clearSelection(), { deep: true })

function onPageChange(p: number) {
  setFilter('page', p)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function onPerPageChange(n: number) {
  setFilter('perPage', n)
  setFilter('page', 1)
}
</script>

<template>
  <div class="flex h-full overflow-hidden bg-[var(--brand-canvas)]">
    <ErrorBoundary>
      <CandidatesFilters />
    </ErrorBoundary>

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--brand-surface-white)] border-t border-[var(--brand-border)]">
      <!-- Page header -->
      <div class="flex items-center gap-2 px-6 pt-6 pb-4">
        <h1 class="text-[26px] font-bold tracking-tight text-[var(--brand-text)]">Candidates</h1>
        <SaveSearchPopover @save="(p) => console.log('Saved search', p)" />
      </div>

      <!-- Search -->
      <div class="px-6 pb-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-text-quiet)]" />
          <Input
            v-model="searchInput"
            placeholder="Search candidates by anything or use keywords e.g. John AND manager"
            class="pl-9 h-11 bg-white border-[var(--brand-border)] rounded-xl"
          />
        </div>
      </div>

      <!-- Toolbar (transforms on selection) -->
      <div class="px-6 pb-2">
        <CandidatesToolbar
          :page-ids="pageIds"
          :total="total"
          :current-page="filters.page"
          :total-pages="totalPages"
          :per-page="filters.perPage"
          @page-change="onPageChange"
        />
      </div>

      <!-- Sample data info banner -->
      <div class="px-6 pb-3">
        <SampleDataBanner @remove="console.log('TODO: wipe sample data')" />
      </div>

      <!-- Table area -->
      <div class="flex-1 overflow-auto px-6 pb-3">
        <ErrorBoundary>
          <CandidatesTableSkeleton v-if="showSkeleton" />
          <CandidatesEmptyState
            v-else-if="candidates.length === 0"
            :has-filters="hasActiveFilters"
            @clear="clearFilters()"
          />
          <div
            v-else
            :class="isFetching ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'"
          >
            <CandidatesTable :candidates="candidates" :is-fetching="isFetching" />

            <!-- Per-page selector + prev/next, scrolls with the table -->
            <CandidatesPerPage
              :per-page="filters.perPage"
              :current-page="filters.page"
              :total-pages="totalPages"
              @change="onPerPageChange"
              @page-change="onPageChange"
            />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  </div>
</template>
