<!--
  One pool's candidates. Owns search, sorting and row selection locally; every
  action that mutates data is emitted up to the page, which holds the store.

  The General Application pool is read-only and shows a reduced column set —
  no stage, scores or tags, since nothing has triaged those candidates yet.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ArrowRight, Briefcase, ChevronRight, Filter, ListFilter, MoreVertical,
  Pencil, Plus, Trash2, Users,
} from 'lucide-vue-next'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { BrandButton, BrandDataTable, BrandEmptyState, BrandLimeCheckbox, BrandSearchBar } from '~/components/brand'
import { POOL_CATEGORY, STAGE_TONE, poolCategoryDetail, poolNeedsJobTitle, scoreTone } from './poolCategory'
import type { PoolCandidate, TalentPool } from '~/types'

const props = defineProps<{
  pool: TalentPool
  candidates: PoolCandidate[]
}>()

const emit = defineEmits<{
  back: []
  edit: []
  archive: []
  restore: []
  remove: []
  openForm: []
  addCandidate: []
  openCandidate: [c: PoolCandidate]
  moveToPool: [ids: string[]]
  moveToJob: [ids: string[]]
  deleteCandidates: [ids: string[]]
}>()

const search = ref('')
const sortCol = ref<'name' | 'date'>('date')
const sortDir = ref<'asc' | 'desc'>('desc')
const selected = ref<string[]>([])

// Leaving the pool or filtering it away should never keep a stale selection.
watch(() => props.pool.id, () => { selected.value = []; search.value = '' })

const isSystem = computed(() => !!props.pool.system)
const showJobTitle = computed(() => poolNeedsJobTitle(props.pool))
const category = computed(() => POOL_CATEGORY[props.pool.category])

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  const rows = props.candidates.filter(c =>
    !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
  )
  return [...rows].sort((a, b) => {
    const av = sortCol.value === 'name' ? a.name.toLowerCase() : a.date
    const bv = sortCol.value === 'name' ? b.name.toLowerCase() : b.date
    return (av < bv ? -1 : av > bv ? 1 : 0) * (sortDir.value === 'asc' ? 1 : -1)
  })
})

function toggleSort(col: 'name' | 'date') {
  if (sortCol.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortCol.value = col; sortDir.value = 'asc' }
}

const allSelected = computed(() =>
  visible.value.length > 0 && visible.value.every(c => selected.value.includes(c.id)),
)

function toggleAll(on: boolean) {
  selected.value = on ? visible.value.map(c => c.id) : []
}

function toggleRow(id: string, on: boolean) {
  selected.value = on ? [...selected.value, id] : selected.value.filter(x => x !== id)
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const HEAD_CLASS = 'px-[18px] py-3 h-auto text-[12.5px] font-semibold text-[var(--brand-text-secondary)]'
const PILL_CLASS = 'inline-flex items-center rounded-[6px] px-2.5 py-[3px] text-[12px] font-bold'
</script>

<template>
  <div class="p-6 flex flex-col gap-4 h-full min-h-0">
    <!-- Breadcrumb -->
    <button
      type="button"
      class="flex items-center gap-1.5 self-start text-[12.5px] text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] transition-colors"
      @click="emit('back')"
    >
      Talent Pools
      <ChevronRight class="w-3 h-3" />
      <span class="font-semibold text-[var(--brand-text)]">{{ pool.name }}</span>
    </button>

    <!-- Pool header -->
    <div class="flex items-start justify-between gap-4 pb-5 border-b border-[var(--brand-border-light)]">
      <div class="min-w-0">
        <div class="flex items-center gap-2.5">
          <span
            class="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center shrink-0"
            :style="{ background: category.bg, color: category.text }"
          >
            <component :is="category.icon" class="w-[18px] h-[18px]" :stroke-width="1.7" />
          </span>
          <h2 class="text-[21px] font-extrabold text-[var(--brand-text)] truncate">{{ pool.name }}</h2>
          <span
            class="inline-flex items-center rounded-[6px] px-2.5 py-[3px] text-[11.5px] font-bold shrink-0"
            :style="{ background: category.bg, color: category.text }"
          >{{ category.label }}</span>
        </div>
        <p class="mt-1 ml-12 text-[13px] text-[var(--brand-text-quiet)]">
          {{ pool.description }}<span v-if="poolCategoryDetail(pool)"> · {{ poolCategoryDetail(pool) }}</span>
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <BrandButton v-if="pool.category === 'event'" variant="outline" size="md" @click="emit('openForm')">
          <ListFilter class="w-3.5 h-3.5" />
          {{ pool.formStatus === 'live' ? 'Edit Form' : 'Build Form' }}
        </BrandButton>
        <BrandButton v-if="!isSystem" variant="outline" size="md" @click="emit('edit')">
          <Pencil class="w-3.5 h-3.5" />
          Edit Pool
        </BrandButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <BrandButton variant="outline" size="icon" aria-label="Pool actions">
              <MoreVertical class="w-4 h-4" />
            </BrandButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem v-if="!pool.archived" :disabled="isSystem" @click="emit('archive')">
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem v-else @click="emit('restore')">Restore</DropdownMenuItem>
            <DropdownMenuItem :disabled="isSystem" @click="emit('remove')">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-2.5 flex-wrap">
      <div class="flex-1 min-w-[200px] max-w-[420px]">
        <BrandSearchBar
          v-model="search"
          placeholder="Search by name or email…"
          class="bg-[var(--brand-surface-white)] border-[var(--brand-border)] rounded-[11px]"
        />
      </div>
      <span class="text-[13px] text-[var(--brand-text-muted)] whitespace-nowrap">
        {{ candidates.length }} candidate{{ candidates.length === 1 ? '' : 's' }}
      </span>
      <BrandButton variant="outline" size="md" disabled>
        <Filter class="w-3.5 h-3.5" />
        Filters
      </BrandButton>
      <BrandButton v-if="!isSystem" variant="primary-teal" size="md" @click="emit('addCandidate')">
        <Plus class="w-3.5 h-3.5" :stroke-width="2.2" />
        Add Candidate
      </BrandButton>
    </div>

    <!-- Bulk bar -->
    <div
      v-if="selected.length"
      class="flex items-center gap-2.5 flex-wrap rounded-[12px] border border-[var(--brand-border-mid)] bg-[var(--brand-lime-tint)] px-4 py-2.5"
    >
      <span class="flex-1 text-[13.5px] font-bold text-[var(--brand-olive)] whitespace-nowrap">
        {{ selected.length }} selected
      </span>
      <BrandButton variant="outline" size="sm" @click="emit('moveToPool', [...selected])">
        <ArrowRight class="w-3.5 h-3.5" />
        Move to another Talent Pool
      </BrandButton>
      <BrandButton variant="outline" size="sm" @click="emit('moveToJob', [...selected])">
        <Briefcase class="w-3.5 h-3.5" />
        Move to a Job
      </BrandButton>
      <BrandButton variant="danger-ghost" size="sm" @click="emit('deleteCandidates', [...selected])">
        <Trash2 class="w-3.5 h-3.5" />
        Delete
      </BrandButton>
      <BrandButton variant="ghost" size="sm" @click="selected = []">Clear selection</BrandButton>
    </div>

    <!-- Candidates -->
    <BrandDataTable v-if="visible.length" class="bg-[var(--brand-surface-white)]">
      <template #header>
        <TableHeader class="sticky top-0 z-10 bg-[var(--brand-canvas)]">
          <TableRow class="hover:bg-transparent border-b border-[var(--brand-border-light)]">
            <TableHead :class="[HEAD_CLASS, 'w-[46px]']">
              <BrandLimeCheckbox :model-value="allSelected" @update:model-value="toggleAll" />
            </TableHead>
            <TableHead :class="[HEAD_CLASS, 'cursor-pointer select-none']" @click="toggleSort('name')">
              Candidate Name
              <span v-if="sortCol === 'name'" class="ml-1">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </TableHead>
            <template v-if="isSystem">
              <TableHead :class="HEAD_CLASS">Job Applied For</TableHead>
              <TableHead :class="HEAD_CLASS">Applied Via</TableHead>
            </template>
            <template v-else>
              <TableHead :class="HEAD_CLASS">Stage</TableHead>
              <TableHead :class="HEAD_CLASS">Applied Via</TableHead>
              <TableHead v-if="showJobTitle" :class="HEAD_CLASS">Job Title</TableHead>
              <TableHead :class="HEAD_CLASS">AI Score</TableHead>
              <TableHead :class="HEAD_CLASS">Evaluation Score</TableHead>
              <TableHead :class="HEAD_CLASS">Tags</TableHead>
            </template>
            <TableHead :class="[HEAD_CLASS, 'cursor-pointer select-none']" @click="toggleSort('date')">
              Application Date
              <span v-if="sortCol === 'date'" class="ml-1">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </TableHead>
            <TableHead :class="[HEAD_CLASS, 'w-[44px]']" />
          </TableRow>
        </TableHeader>
      </template>
      <TableBody>
        <TableRow
          v-for="c in visible"
          :key="c.id"
          class="border-b border-[var(--brand-border-hairline)] last:border-b-0 even:bg-[var(--brand-canvas)] hover:bg-[var(--brand-lime-tint)] [&>td]:px-[18px] [&>td]:py-3 [&>td]:align-middle [&>td]:text-[13.5px]"
        >
          <TableCell>
            <BrandLimeCheckbox
              :model-value="selected.includes(c.id)"
              @update:model-value="(v: boolean) => toggleRow(c.id, v)"
            />
          </TableCell>
          <TableCell>
            <button
              type="button"
              class="font-bold text-[var(--brand-text)] outline-none hover:underline"
              @click="emit('openCandidate', c)"
            >{{ c.name }}</button>
          </TableCell>

          <template v-if="isSystem">
            <TableCell class="text-[var(--brand-text-muted)]">{{ c.jobTitle ?? '—' }}</TableCell>
            <TableCell class="text-[var(--brand-text-muted)]">{{ c.appliedVia }}</TableCell>
          </template>
          <template v-else>
            <TableCell>
              <span :class="PILL_CLASS" :style="{ background: STAGE_TONE[c.stage].bg, color: STAGE_TONE[c.stage].text }">
                {{ c.stage }}
              </span>
            </TableCell>
            <TableCell class="text-[var(--brand-text-muted)]">{{ c.appliedVia }}</TableCell>
            <TableCell v-if="showJobTitle" class="text-[var(--brand-text-muted)]">{{ c.jobTitle ?? '—' }}</TableCell>
            <TableCell>
              <span :class="PILL_CLASS" :style="{ background: scoreTone(c.aiScore).bg, color: scoreTone(c.aiScore).text }">
                {{ c.aiScore ?? '—' }}
              </span>
            </TableCell>
            <TableCell>
              <span :class="PILL_CLASS" :style="{ background: scoreTone(c.evalScore).bg, color: scoreTone(c.evalScore).text }">
                {{ c.evalScore ?? '—' }}
              </span>
            </TableCell>
            <TableCell>
              <span v-if="!c.tags.length" class="text-[var(--brand-text-faint)]">—</span>
              <span v-else class="flex flex-wrap gap-1">
                <span
                  v-for="t in c.tags"
                  :key="t"
                  class="inline-flex items-center rounded-[6px] bg-[var(--brand-badge-settings-bg)] px-2 py-[3px] text-[11.5px] font-semibold text-[var(--brand-text-secondary)]"
                >{{ t }}</span>
              </span>
            </TableCell>
          </template>

          <TableCell class="text-[var(--brand-text-muted)]">{{ formatDate(c.date) }}</TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BrandButton variant="ghost" size="icon" :aria-label="`Actions for ${c.name}`">
                  <MoreVertical class="w-4 h-4" />
                </BrandButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="emit('openCandidate', c)">View profile</DropdownMenuItem>
                <DropdownMenuItem @click="emit('moveToPool', [c.id])">Move to another pool</DropdownMenuItem>
                <DropdownMenuItem @click="emit('moveToJob', [c.id])">Move to a job</DropdownMenuItem>
                <DropdownMenuItem @click="emit('deleteCandidates', [c.id])">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </BrandDataTable>

    <BrandEmptyState
      v-else
      :icon="Users"
      title="No candidates match."
      :description="isSystem
        ? 'Candidates who apply through the General Application form will show up here.'
        : 'Add candidates manually, via CV upload, or from a CSV file.'"
    />
  </div>
</template>
