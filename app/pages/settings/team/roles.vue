<script setup lang="ts">
import { Plus, X, Trash2, Star, Save, Check } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import { BrandSearchBar } from '~/components/brand'
import { useHiringRoles, PERM_TABS, PERM_TABS_ORDER } from '~/composables/useTeam'
import type { HiringRole, HiringRoleId } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useHiringRoles()

const roles = ref<HiringRole[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    roles.value = v.data.map(r => ({
      ...r,
      permissions: { ...r.permissions },
      members: r.members.map(m => ({ ...m })),
    }))
    seeded.value = true
  }
}, { immediate: true })

const search = ref('')
const activeRoleId = ref<HiringRoleId>('admin')
const activeTab = ref<string>('General')

const defaultRoles = computed(() => roles.value.filter(r => !r.custom))
const customRoles = computed(() => roles.value.filter(r => r.custom))
const filteredDefault = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return defaultRoles.value
  return defaultRoles.value.filter(r => r.label.toLowerCase().includes(q))
})
const filteredCustom = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return customRoles.value
  return customRoles.value.filter(r => r.label.toLowerCase().includes(q))
})

const activeRole = computed(() => roles.value.find(r => r.id === activeRoleId.value) ?? null)

const savedFlash = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | undefined
function togglePerm(permId: string) {
  const role = activeRole.value
  if (!role || role.locked) return
  role.permissions[permId] = !role.permissions[permId]
  savedFlash.value = true
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => { savedFlash.value = false }, 1500)
}

function selectRole(id: HiringRoleId) {
  activeRoleId.value = id
  activeTab.value = 'General'
}

// ─────────────── Members modal ───────────────
const membersModalOpen = ref(false)
const membersSearch = ref('')
const filteredMembers = computed(() => {
  if (!activeRole.value) return []
  const q = membersSearch.value.trim().toLowerCase()
  if (!q) return activeRole.value.members
  return activeRole.value.members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
})
function openMembers() {
  if (!activeRole.value) return
  membersSearch.value = ''
  membersModalOpen.value = true
}
function initials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]!).slice(0, 2).join('').toUpperCase()
}

// ─────────────── Create new role modal ───────────────
const createModalOpen = ref(false)
const newRoleName = ref('')
const copyFromId = ref<HiringRoleId | ''>('')
function openCreate() {
  newRoleName.value = ''
  copyFromId.value = ''
  createModalOpen.value = true
}
function createRole() {
  const name = newRoleName.value.trim()
  if (!name) return
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const source = copyFromId.value ? roles.value.find(r => r.id === copyFromId.value) : null
  const permissions: Record<string, boolean> = {}
  for (const tab of PERM_TABS_ORDER) {
    for (const p of PERM_TABS[tab]!) {
      permissions[p.id] = source ? !!source.permissions[p.id] : false
    }
  }
  const role: HiringRole = {
    id, label: name, locked: false, custom: true,
    description: `Custom role: ${name}. Configure permissions below.`,
    members: [],
    permissions,
  }
  roles.value.push(role)
  activeRoleId.value = id
  activeTab.value = 'General'
  createModalOpen.value = false
}
function deleteCustomRole(role: HiringRole) {
  roles.value = roles.value.filter(r => r.id !== role.id)
  if (activeRoleId.value === role.id) activeRoleId.value = 'admin'
}
</script>

<template>
  <div class="flex h-[calc(100vh-120px)] min-h-[600px] -m-6 overflow-hidden">
    <!-- LEFT: role list -->
    <div class="w-[280px] shrink-0 border-r border-[var(--brand-border-light)] flex flex-col bg-[var(--brand-surface-white)] overflow-hidden">
      <div class="px-4 pt-[18px] pb-3 border-b border-[var(--brand-border-fade)]">
        <div class="text-[15px] font-bold text-[var(--brand-text)] mb-1">Hiring roles</div>
        <p class="text-[12px] text-[var(--brand-text-quiet)] mb-3.5">
          Set access permissions for your team members.
          <a href="#" class="text-[var(--brand-teal)] font-semibold">Learn more</a>
        </p>
        <Button size="sm" class="w-full gap-1.5 bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90 py-[9px]" @click="openCreate">
          <Plus class="w-3.5 h-3.5" />
          New role
        </Button>
      </div>

      <div class="px-3 py-2.5 border-b border-[var(--brand-border-fade)]">
        <BrandSearchBar v-model="search" placeholder="Search roles" size="sm" />
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <p v-if="isLoading && !roles.length" class="px-4 py-4 text-[13px] text-[var(--brand-text-muted)]">Loading…</p>
        <template v-else>
          <div class="px-4 pt-1.5 pb-1 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[var(--brand-text-quiet)]">Default Roles</div>
          <button
            v-for="r in filteredDefault"
            :key="r.id"
            class="w-full flex items-center justify-between gap-2 mx-1.5 px-3.5 py-[9px] rounded-[8px] text-left text-[13.5px] transition-colors"
            :class="activeRoleId === r.id
              ? 'bg-[var(--brand-badge-settings-bg)] text-[var(--brand-text)] font-semibold'
              : 'text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)]'"
            :style="{ width: 'calc(100% - 12px)' }"
            @click="selectRole(r.id)"
          >
            <span class="flex-1 truncate">{{ r.label }}</span>
          </button>

          <template v-if="customRoles.length">
            <div class="px-4 pt-3 pb-1 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[var(--brand-text-quiet)]">Custom Roles</div>
            <div
              v-for="r in filteredCustom"
              :key="r.id"
              class="flex items-center justify-between gap-2 mx-1.5 px-3.5 py-[9px] rounded-[8px] cursor-pointer text-[13.5px] transition-colors"
              :class="activeRoleId === r.id
                ? 'bg-[var(--brand-badge-settings-bg)] text-[var(--brand-text)] font-semibold'
                : 'text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)]'"
              :style="{ width: 'calc(100% - 12px)' }"
              @click="selectRole(r.id)"
            >
              <span class="flex-1 truncate">{{ r.label }}</span>
              <button type="button" class="text-[var(--brand-settings-danger)] outline-none opacity-70 hover:opacity-100" title="Delete role" @click.stop="deleteCustomRole(r)">
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- RIGHT: permissions editor -->
    <div class="flex-1 flex flex-col min-w-0 bg-[var(--brand-surface-white)] overflow-hidden">
      <div v-if="!activeRole" class="flex-1 flex items-center justify-center text-[13px] text-[var(--brand-text-muted)]">
        Select a role
      </div>
      <template v-else>
        <div class="flex-1 overflow-y-auto">
          <div class="px-8 py-6 border-b border-[var(--brand-border-light)] text-[13.5px] text-[var(--brand-text-secondary)] leading-[1.6]">
            {{ activeRole.description }}
          </div>

          <div class="px-8 py-4 border-b border-[var(--brand-border-light)] flex items-center gap-3">
            <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">Members assigned</span>
            <button type="button" class="inline-flex items-center justify-center w-7 h-7 rounded-full border-[1.5px] border-dashed border-[var(--brand-border)] bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="View members" @click="openMembers">
              <Plus class="w-3 h-3" />
            </button>
            <div v-if="activeRole.members.length" class="flex items-center">
              <span
                v-for="(m, i) in activeRole.members"
                :key="m.email"
                class="inline-flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[var(--brand-teal)] text-[var(--brand-lime)] text-[11px] font-bold border-2 border-[var(--brand-surface-white)]"
                :style="{ marginLeft: i === 0 ? '4px' : '-6px' }"
              >
                {{ initials(m.name) }}
              </span>
            </div>
            <span v-else class="text-[13px] text-[var(--brand-text-quiet)]">No members yet</span>
          </div>

          <div class="flex gap-0 px-8 border-b border-[var(--brand-border-light)]">
            <button
              v-for="tab in PERM_TABS_ORDER"
              :key="tab"
              type="button"
              class="border-0 border-b-[2.5px] px-4 py-3 text-[14px] font-semibold outline-none -mb-[1px] transition-colors whitespace-nowrap"
              :class="activeTab === tab
                ? 'border-[var(--brand-teal)] text-[var(--brand-text)] font-bold'
                : 'border-transparent text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </div>

          <div class="px-8 py-6">
            <div
              v-for="p in PERM_TABS[activeTab]"
              :key="p.id"
              class="flex items-start gap-3.5 mb-5"
            >
              <button
                type="button"
                :disabled="activeRole.locked"
                class="mt-0.5 w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center shrink-0 outline-none transition-colors disabled:cursor-not-allowed"
                :style="activeRole.permissions[p.id]
                  ? { background: 'var(--brand-teal)', borderColor: 'var(--brand-teal)' }
                  : { background: 'var(--brand-surface-white)', borderColor: 'var(--brand-border)' }"
                @click="togglePerm(p.id)"
              >
                <Check v-if="activeRole.permissions[p.id]" class="w-2.5 h-2.5" :style="{ color: activeRole.locked ? 'var(--brand-lime)' : 'var(--brand-avatar-text)' }" />
              </button>
              <div>
                <div class="text-[14px] font-semibold text-[var(--brand-text)] mb-0.5">{{ p.label }}</div>
                <div class="text-[13px] text-[var(--brand-text-quiet)] leading-[1.5]">{{ p.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!activeRole.locked" class="flex-none border-t border-[var(--brand-border-light)] px-8 py-2.5 flex items-center gap-2 bg-[var(--brand-canvas)]">
          <Save class="w-3.5 h-3.5" :style="{ color: savedFlash ? 'var(--brand-status-approved-text)' : 'var(--brand-text-quiet)' }" />
          <span class="text-[13px]" :style="{ color: savedFlash ? 'var(--brand-status-approved-text)' : 'var(--brand-text-quiet)' }">
            {{ savedFlash ? 'Saved' : 'Changes are saved automatically' }}
          </span>
        </div>
      </template>
    </div>

    <!-- ─────────────── Members modal ─────────────── -->
    <SettingsFormModal v-if="activeRole" v-model="membersModalOpen" :title="`${activeRole.label} Members`" width="560px">
      <div class="text-[12px] text-[var(--brand-text-quiet)] -mt-4 mb-4">
        {{ activeRole.members.length }} member{{ activeRole.members.length === 1 ? '' : 's' }}
      </div>
      <div class="mb-3">
        <BrandSearchBar v-model="membersSearch" placeholder="Search members..." size="sm" />
      </div>
      <div class="max-h-[50vh] overflow-y-auto -mx-1 px-1">
        <div v-if="!filteredMembers.length" class="text-center py-8 text-[13px] text-[var(--brand-text-quiet)]">
          {{ activeRole.members.length ? 'No members match.' : 'No members yet.' }}
        </div>
        <div
          v-for="m in filteredMembers"
          :key="m.email"
          class="flex items-center gap-3 py-3 border-b border-[var(--brand-border-fade)] last:border-0"
        >
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--brand-teal)] text-[var(--brand-lime)] text-[11.5px] font-bold shrink-0">
            {{ initials(m.name) }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ m.name }}</div>
            <div class="text-[12px] text-[var(--brand-text-quiet)]">{{ m.email }}</div>
          </div>
          <span
            class="text-[12px] font-semibold rounded-[6px] px-2 py-[3px]"
            :style="m.status === 'Active'
              ? { background: 'var(--brand-status-approved-bg)', color: 'var(--brand-status-approved-text)' }
              : { background: 'var(--brand-status-pending-bg)', color: 'var(--brand-status-pending-text)' }"
          >{{ m.status }}</span>
        </div>
      </div>
      <template #footer>
        <button type="button" class="px-7 py-2.5 rounded-[10px] bg-[var(--brand-teal)] text-white text-[13.5px] font-bold outline-none" @click="membersModalOpen = false">Close</button>
      </template>
    </SettingsFormModal>

    <!-- ─────────────── Create new role modal ─────────────── -->
    <SettingsFormModal v-model="createModalOpen" title="Create new role" width="480px">
      <div class="mb-4">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Role name <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="newRoleName"
          type="text"
          placeholder="e.g. Marketing Manager"
          class="w-full box-border px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
          @keyup.enter="createRole"
        >
      </div>
      <div>
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">Copy permissions from</label>
        <select
          v-model="copyFromId"
          class="w-full box-border px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] cursor-pointer"
        >
          <option value="">Start from scratch</option>
          <option v-for="r in defaultRoles" :key="r.id" :value="r.id">{{ r.label }}</option>
        </select>
      </div>
      <template #footer>
        <button type="button" class="px-[18px] py-2 text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none" @click="createModalOpen = false">Cancel</button>
        <button type="button" class="px-6 py-2 rounded-[10px] bg-[var(--brand-teal)] text-white text-[13.5px] font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newRoleName.trim()" @click="createRole">Create role</button>
      </template>
    </SettingsFormModal>
  </div>
</template>
