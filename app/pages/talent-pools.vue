<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Archive, MoreHorizontal, Pencil, Pin, Plus, RotateCcw, Trash2, Users } from 'lucide-vue-next'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import {
  BrandAvatarInitials, BrandButton, BrandDataTable,
  BrandEmptyState, BrandPageTitle, BrandSearchBar,
} from '~/components/brand'
import { POOL_CATEGORY, poolCategoryDetail } from '~/components/talent-pools/poolCategory'
import PoolConfirmDialog from '~/components/talent-pools/PoolConfirmDialog.vue'
import PoolDeleteDialog from '~/components/talent-pools/PoolDeleteDialog.vue'
import PoolFormDialog from '~/components/talent-pools/PoolFormDialog.vue'
import type { DeleteDestination } from '~/components/talent-pools/PoolDeleteDialog.vue'
import { useTalentPools } from '~/composables/useTalentPools'
import { useTeamMembers } from '~/composables/useTeam'
import type { PoolCandidate, TalentPool } from '~/types'

definePageMeta({ layout: 'default' })

const toast = useToast()

// ─────────────── Data ───────────────
// Mocks are read-only (see app/mocks/handlers/), so the page owns a local copy and
// mutates it directly — the same pattern as the settings list pages.
const { data } = useTalentPools()
const { data: teamData } = useTeamMembers()

const pools = ref<TalentPool[]>([])
const candidates = ref<PoolCandidate[]>([])
const seeded = ref(false)

watch(data, (v) => {
  if (!v || seeded.value) return
  pools.value = v.pools.map(p => ({ ...p }))
  candidates.value = v.candidates.map(c => ({ ...c }))
  seeded.value = true
}, { immediate: true })

const team = computed(() => teamData.value?.data ?? [])
const memberById = (id: string) => team.value.find(m => m.id === id)

function initialsOf(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─────────────── Filters ───────────────
const tab = ref<'active' | 'archived'>('active')
const search = ref('')
const category = ref('')
const assignee = ref('')

const activeCount = computed(() => pools.value.filter(p => !p.archived).length)
const archivedCount = computed(() => pools.value.filter(p => p.archived).length)

const visiblePools = computed(() => {
  const q = search.value.trim().toLowerCase()
  return pools.value
    .filter(p => p.archived === (tab.value === 'archived'))
    .filter(p => !category.value || p.category === category.value)
    .filter(p => !assignee.value || p.members.includes(assignee.value))
    .filter(p => !q || p.name.toLowerCase().includes(q))
    // System pool first, then pinned, then newest — matches the prototype's ordering.
    .sort((a, b) =>
      Number(!!b.system) - Number(!!a.system)
      || Number(b.pinned) - Number(a.pinned)
      || b.created.localeCompare(a.created),
    )
})

const hasFilters = computed(() => !!(search.value || category.value || assignee.value))

function resetFilters() {
  search.value = ''
  category.value = ''
  assignee.value = ''
}

// Table header cells: 18px gutters and the muted 12.5px label the prototype uses,
// rather than the shadcn defaults.
const HEAD_CLASS = 'px-[18px] py-3 h-auto text-[12.5px] font-semibold text-[var(--brand-text-secondary)]'

function formStatusBadge(p: TalentPool) {
  if (p.category !== 'event' || !p.formStatus) return null
  return p.formStatus === 'live'
    ? { label: 'Form Live', bg: 'var(--brand-success-bg)', text: 'var(--brand-success)' }
    : { label: 'Form Draft', bg: 'var(--brand-category-general-bg)', text: 'var(--brand-category-general-text)' }
}

// ─────────────── Create / edit ───────────────
const formOpen = ref(false)
const editingPool = ref<TalentPool | null>(null)

function openCreate() {
  editingPool.value = null
  formOpen.value = true
}

function openEdit(p: TalentPool) {
  editingPool.value = p
  formOpen.value = true
}

function savePool(payload: Pick<TalentPool, 'name' | 'description' | 'category' | 'department' | 'event' | 'members'>) {
  const existing = editingPool.value
  if (existing) {
    Object.assign(existing, payload)
    toast.success(`${payload.name} updated.`)
  }
  else {
    pools.value.unshift({
      id: `p-${Date.now()}`,
      ...payload,
      total: 0,
      created: new Date().toISOString().slice(0, 10),
      archived: false,
      pinned: false,
    })
    toast.success(`${payload.name} created.`)
  }
  formOpen.value = false
}

// ─────────────── Archive / restore / delete ───────────────
const archiveTarget = ref<TalentPool | null>(null)
const restoreTarget = ref<TalentPool | null>(null)
const deleteTarget = ref<TalentPool | null>(null)

const archiveOpen = computed({
  get: () => archiveTarget.value !== null,
  set: v => !v && (archiveTarget.value = null),
})
const restoreOpen = computed({
  get: () => restoreTarget.value !== null,
  set: v => !v && (restoreTarget.value = null),
})
const deleteOpen = computed({
  get: () => deleteTarget.value !== null,
  set: v => !v && (deleteTarget.value = null),
})

function requestArchive(p: TalentPool) {
  archiveTarget.value = p
}

function requestRestore(p: TalentPool) {
  restoreTarget.value = p
}

function requestDelete(p: TalentPool) {
  deleteTarget.value = p
}

function confirmArchive() {
  const p = archiveTarget.value
  if (!p) return
  p.archived = true
  archiveTarget.value = null
  toast.success(`${p.name} archived.`)
}

function confirmRestore() {
  const p = restoreTarget.value
  if (!p) return
  p.archived = false
  restoreTarget.value = null
  toast.success(`${p.name} restored.`)
}

const deleteDestinations = computed<DeleteDestination[]>(() =>
  pools.value
    .filter(p => p.id !== deleteTarget.value?.id && !p.archived)
    .map(p => ({ value: `pool:${p.id}`, label: p.name, group: 'Talent Pools' as const })),
)

function confirmDelete({ mode, destination }: { mode: 'all' | 'move'; destination: string | null }) {
  const p = deleteTarget.value
  if (!p) return
  const moved = candidates.value.filter(c => c.poolId === p.id)

  if (mode === 'move' && destination?.startsWith('pool:')) {
    const targetId = destination.slice('pool:'.length)
    const target = pools.value.find(t => t.id === targetId)
    for (const c of moved) c.poolId = targetId
    if (target) target.total += moved.length
    toast.success(`${p.name} deleted — ${moved.length} candidate(s) moved to ${target?.name ?? 'the destination'}.`)
  }
  else {
    candidates.value = candidates.value.filter(c => c.poolId !== p.id)
    toast.success(`${p.name} deleted.`)
  }

  pools.value = pools.value.filter(x => x.id !== p.id)
  deleteTarget.value = null
}
</script>

<template>
  <div class="p-6 flex flex-col gap-3 h-full min-h-0">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <BrandPageTitle label="Talent Pools" />
        <p class="mt-1 text-[13.5px] text-[var(--brand-text-quiet)]">
          Organize, rediscover, and re-engage candidates for future roles.
        </p>
      </div>
      <BrandButton variant="primary-teal" size="lg" @click="openCreate">
        <Plus class="w-3.5 h-3.5" :stroke-width="2.2" />
        Create Talent Pool
      </BrandButton>
    </div>

    <!-- Tabs — underline style, matching the rest of the product -->
    <div class="flex gap-0 border-b border-[var(--brand-border-light)]">
      <button
        v-for="t in ([
          { value: 'active', label: 'Active Talent Pools', count: activeCount },
          { value: 'archived', label: 'Archived Talent Pools', count: archivedCount },
        ] as const)"
        :key="t.value"
        type="button"
        class="flex items-center gap-[7px] border-0 border-b-[2.5px] pr-[22px] py-[7px] text-[13.5px] outline-none -mb-[1px] transition-colors whitespace-nowrap"
        :class="tab === t.value
          ? 'border-[var(--brand-teal)] text-[var(--brand-text)] font-bold'
          : 'border-transparent text-[var(--brand-text-quiet)] font-semibold hover:text-[var(--brand-text)]'"
        @click="tab = t.value"
      >
        {{ t.label }}
        <span
          class="rounded-full px-[7px] py-px text-[11.5px] font-bold"
          :class="tab === t.value
            ? 'bg-[var(--brand-lime-active-bg)] text-[var(--brand-olive)]'
            : 'bg-[var(--brand-badge-settings-bg)] text-[var(--brand-text-muted)]'"
        >{{ t.count }}</span>
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-2.5 flex-wrap">
      <BrandSearchBar
        v-model="search"
        placeholder="Search talent pools by name…"
        class="flex-1 min-w-[220px]"
      />
      <Select v-model="category">
        <SelectTrigger class="w-[170px]"><SelectValue placeholder="All categories" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="general">General</SelectItem>
          <SelectItem value="department">Department</SelectItem>
          <SelectItem value="event">Event</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="assignee">
        <SelectTrigger class="w-[170px]"><SelectValue placeholder="Assigned to" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="m in team" :key="m.id" :value="m.id">{{ m.name }}</SelectItem>
        </SelectContent>
      </Select>
      <BrandButton variant="outline" size="md" :disabled="!hasFilters" @click="resetFilters">
        Reset Filters
      </BrandButton>
    </div>

    <!-- Table -->
    <!-- BrandDataTable ships the border, radius and shadow but no surface; the pools
         table reads as a white card over the canvas, same as the prototype. -->
    <BrandDataTable v-if="visiblePools.length" class="bg-[var(--brand-surface-white)]">
      <template #header>
        <TableHeader class="sticky top-0 z-10 bg-[var(--brand-canvas)]">
          <TableRow class="hover:bg-transparent border-b border-[var(--brand-border-light)]">
            <TableHead :class="HEAD_CLASS">Talent Pool Name</TableHead>
            <TableHead :class="HEAD_CLASS">Category</TableHead>
            <TableHead :class="[HEAD_CLASS, 'text-center']">Total Talents</TableHead>
            <TableHead :class="HEAD_CLASS">Creation Date</TableHead>
            <TableHead :class="HEAD_CLASS">Team Members</TableHead>
            <TableHead :class="[HEAD_CLASS, 'w-[44px]']" />
          </TableRow>
        </TableHeader>
      </template>
      <TableBody>
        <TableRow
          v-for="p in visiblePools"
          :key="p.id"
          class="cursor-pointer border-b border-[var(--brand-border-hairline)] last:border-b-0 hover:bg-[var(--brand-canvas)] [&>td]:px-[18px] [&>td]:py-3 [&>td]:align-middle [&>td]:text-[13.5px]"
        >
          <!-- Name: category icon tile + pin + status dot + name + badges, description beneath -->
          <TableCell>
            <span class="flex items-center gap-3">
              <span
                class="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0"
                :style="{ background: POOL_CATEGORY[p.category].bg, color: POOL_CATEGORY[p.category].text }"
              >
                <component :is="POOL_CATEGORY[p.category].icon" class="w-4 h-4" :stroke-width="1.7" />
              </span>
              <span class="min-w-0">
                <span class="flex items-center font-bold text-[var(--brand-text)]">
                  <Pin v-if="p.pinned" class="w-[13px] h-[13px] mr-1.5 shrink-0 text-[var(--brand-pin)]" fill="currentColor" :stroke-width="0" />
                  <span class="w-[7px] h-[7px] mr-[7px] rounded-full shrink-0 bg-[var(--brand-success)]" />
                  {{ p.name }}
                  <span
                    v-if="p.system"
                    class="ml-2 rounded-[5px] px-1.5 py-0.5 text-[10px] font-bold"
                    :style="{ background: 'var(--brand-category-general-bg)', color: 'var(--brand-category-general-text)' }"
                  >System</span>
                  <span
                    v-if="formStatusBadge(p)"
                    class="ml-2 rounded-[5px] px-1.5 py-0.5 text-[10px] font-bold"
                    :style="{ background: formStatusBadge(p)!.bg, color: formStatusBadge(p)!.text }"
                  >{{ formStatusBadge(p)!.label }}</span>
                </span>
                <span class="block mt-0.5 max-w-[420px] truncate text-[12.5px] text-[var(--brand-text-quiet)]">{{ p.description }}</span>
              </span>
            </span>
          </TableCell>

          <!-- Category: coloured pill + the department / event it belongs to -->
          <TableCell>
            <span
              class="inline-flex items-center rounded-[6px] px-2.5 py-[3px] text-[11.5px] font-bold"
              :style="{ background: POOL_CATEGORY[p.category].bg, color: POOL_CATEGORY[p.category].text }"
            >{{ POOL_CATEGORY[p.category].label }}</span>
            <span class="block mt-1 text-[12px] text-[var(--brand-text-quiet)]">{{ poolCategoryDetail(p) }}</span>
          </TableCell>

          <TableCell class="text-center font-bold tabular-nums">{{ p.total }}</TableCell>
          <TableCell class="text-[var(--brand-text-muted)]">{{ formatDate(p.created) }}</TableCell>
          <TableCell>
            <span class="flex items-center">
              <BrandAvatarInitials
                v-for="(id, i) in p.members"
                :key="id"
                :initials="initialsOf(memberById(id)?.name ?? '?')"
                size="sm"
                :bg="memberById(id)?.avatarBg"
                :color="memberById(id)?.avatarText"
                :class="['ring-2 ring-[var(--brand-surface-white)]', i > 0 ? '-ml-2' : '']"
              />
            </span>
          </TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BrandButton variant="ghost" size="icon" :aria-label="`Actions for ${p.name}`">
                  <MoreHorizontal class="w-4 h-4" />
                </BrandButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem :disabled="p.system" @click="openEdit(p)">
                  <Pencil class="w-4 h-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem v-if="!p.archived" :disabled="p.system" @click="requestArchive(p)">
                  <Archive class="w-4 h-4" /> Archive
                </DropdownMenuItem>
                <DropdownMenuItem v-else @click="requestRestore(p)">
                  <RotateCcw class="w-4 h-4" /> Restore
                </DropdownMenuItem>
                <DropdownMenuItem :disabled="p.system" @click="requestDelete(p)">
                  <Trash2 class="w-4 h-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </BrandDataTable>

    <BrandEmptyState
      v-else
      :icon="Users"
      title="No Talent Pools found."
      :description="hasFilters
        ? 'Try adjusting your search or filters, or create a new talent pool.'
        : 'Create a talent pool to start grouping candidates for future roles.'"
    />

    <!-- Dialogs -->
    <PoolFormDialog v-model="formOpen" :pool="editingPool" @save="savePool" />

    <PoolConfirmDialog
      v-model="archiveOpen"
      tone="warning"
      :icon="Archive"
      title="Archive this Talent Pool?"
      confirm-label="Archive Pool"
      @confirm="confirmArchive"
    >
      Are you sure you want to archive <strong>{{ archiveTarget?.name }}</strong>? It will move to the
      Archived tab and be excluded from active workflows. You can retrieve it anytime.
    </PoolConfirmDialog>

    <PoolConfirmDialog
      v-model="restoreOpen"
      tone="success"
      :icon="RotateCcw"
      title="Restore this Talent Pool?"
      confirm-label="Restore Pool"
      @confirm="confirmRestore"
    >
      This will move <strong>{{ restoreTarget?.name }}</strong> back to the Active tab with all data intact.
    </PoolConfirmDialog>

    <PoolDeleteDialog
      v-model="deleteOpen"
      :pool-name="deleteTarget?.name ?? ''"
      :destinations="deleteDestinations"
      @confirm="confirmDelete"
    />
  </div>
</template>
