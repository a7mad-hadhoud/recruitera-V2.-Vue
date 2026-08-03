<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Archive, MoreHorizontal, Pencil, Pin, Plus, RotateCcw, Trash2, Users } from 'lucide-vue-next'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import {
  BrandAvatarInitials, BrandButton, BrandCountBadge, BrandDataTable,
  BrandEmptyState, BrandPageTitle, BrandSearchBar, BrandStatusBadge,
} from '~/components/brand'
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
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
})

const hasFilters = computed(() => !!(search.value || category.value || assignee.value))

function resetFilters() {
  search.value = ''
  category.value = ''
  assignee.value = ''
}

const CATEGORY_LABELS: Record<TalentPool['category'], string> = {
  general: 'General',
  department: 'Department',
  event: 'Event',
}

function categoryLabel(p: TalentPool) {
  if (p.category === 'department' && p.department) return p.department
  if (p.category === 'event' && p.event) return p.event
  return CATEGORY_LABELS[p.category]
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

    <!-- Tabs -->
    <Tabs v-model="tab">
      <TabsList class="border-b border-[var(--brand-border-light)]">
        <TabsTrigger value="active" class="gap-2">
          Active Talent Pools <BrandCountBadge :count="activeCount" />
        </TabsTrigger>
        <TabsTrigger value="archived" class="gap-2">
          Archived Talent Pools <BrandCountBadge :count="archivedCount" />
        </TabsTrigger>
      </TabsList>
    </Tabs>

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
    <BrandDataTable v-if="visiblePools.length">
      <template #header>
        <TableHeader>
          <TableRow>
            <TableHead>Talent Pool Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead class="text-center">Total Talents</TableHead>
            <TableHead>Creation Date</TableHead>
            <TableHead>Team Members</TableHead>
            <TableHead class="w-[44px]" />
          </TableRow>
        </TableHeader>
      </template>
      <TableBody>
        <TableRow v-for="p in visiblePools" :key="p.id">
          <TableCell>
            <span class="flex items-center gap-1.5">
              <Pin v-if="p.pinned" class="w-3 h-3 shrink-0 text-[var(--brand-text-quiet)]" fill="currentColor" :stroke-width="0" />
              <span class="font-semibold text-[var(--brand-text)]">{{ p.name }}</span>
              <BrandStatusBadge v-if="p.system" label="System" tone="neutral" />
              <BrandStatusBadge v-if="p.formStatus" :label="p.formStatus === 'live' ? 'Form live' : 'Form draft'" :tone="p.formStatus === 'live' ? 'live' : 'expired'" variant="dot" />
            </span>
            <span class="block mt-0.5 text-[12.5px] text-[var(--brand-text-quiet)] line-clamp-1">{{ p.description }}</span>
          </TableCell>
          <TableCell>{{ categoryLabel(p) }}</TableCell>
          <TableCell class="text-center tabular-nums">{{ p.total }}</TableCell>
          <TableCell>{{ formatDate(p.created) }}</TableCell>
          <TableCell>
            <span class="flex items-center -space-x-1.5">
              <BrandAvatarInitials
                v-for="id in p.members"
                :key="id"
                :initials="initialsOf(memberById(id)?.name ?? '?')"
                size="sm"
                :bg="memberById(id)?.avatarBg"
                :color="memberById(id)?.avatarText"
              />
            </span>
          </TableCell>
          <TableCell>
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
