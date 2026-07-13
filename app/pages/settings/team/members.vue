<script setup lang="ts">
import { Pencil, Trash2, Plus, Mail } from 'lucide-vue-next'
import { TableCell, TableHead, TableRow } from '~/components/ui/table'
import { BrandButton, BrandAvatarInitials, BrandStatusBadge } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsTable from '~/components/settings/SettingsTable.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import { useTeamMembers } from '~/composables/useTeam'
import type { TeamMember, TeamMemberRole } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useTeamMembers()

const members = ref<TeamMember[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    members.value = v.data.map(m => ({ ...m }))
    seeded.value = true
  }
}, { immediate: true })

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return members.value
  return members.value.filter(m =>
    m.name.toLowerCase().includes(q)
    || m.email.toLowerCase().includes(q)
    || m.role.toLowerCase().includes(q),
  )
})

const ROLE_OPTIONS: TeamMemberRole[] = ['Recruiter', 'Hiring Manager', 'Administrator', 'Viewer']

function newId() { return `tm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
function initials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]!).slice(0, 2).join('').toUpperCase()
}

// ─────────────── Add / Edit member modal ───────────────
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<{ name: string; email: string; phone: string; role: TeamMemberRole | '' }>({
  name: '', email: '', phone: '', role: '',
})

function openInvite() {
  editingId.value = null
  form.name = ''; form.email = ''; form.phone = ''; form.role = ''
  modalOpen.value = true
}
function openEdit(m: TeamMember) {
  editingId.value = m.id
  form.name = m.name; form.email = m.email; form.phone = ''; form.role = m.role
  modalOpen.value = true
}
const canSave = computed(() => form.name.trim() && form.email.trim() && form.role)

const AVATAR_PALETTE = ['var(--brand-teal-secondary)', 'var(--brand-avatar-4)', 'var(--brand-settings-danger)', 'var(--brand-avatar-5)', 'var(--brand-avatar-6)']
function nextAvatarBg() { return AVATAR_PALETTE[members.value.length % AVATAR_PALETTE.length]! }

function saveMember() {
  if (!canSave.value) return
  if (editingId.value) {
    const idx = members.value.findIndex(m => m.id === editingId.value)
    if (idx !== -1) {
      members.value[idx] = {
        ...members.value[idx]!,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role as TeamMemberRole,
      }
    }
  }
  else {
    members.value.push({
      id: newId(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role as TeamMemberRole,
      status: 'Pending',
      avatarBg: nextAvatarBg(),
      avatarText: 'var(--brand-avatar-text)',
    })
  }
  modalOpen.value = false
}

function deleteMember(m: TeamMember) {
  members.value = members.value.filter(x => x.id !== m.id)
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Team members"
      subtitle="Manage who has access to your Recruitera account."
    />

    <SettingsTable
      :total="members.length"
      :filtered-count="filtered.length"
      item-label="members"
      search-placeholder="Search members"
      :loading="isLoading && !members.length"
      :empty="!filtered.length"
      empty-message="No members match your search."
      :colspan="5"
      @update:search="v => search = v"
    >
      <template #actions>
        <BrandButton variant="primary-teal" @click="openInvite">
          <Plus class="w-3.5 h-3.5 mr-1" />
          Invite member
        </BrandButton>
      </template>

      <template #header>
        <TableRow class="bg-[var(--brand-surface-table-alt)] hover:bg-[var(--brand-surface-table-alt)]">
          <TableHead class="px-5 py-[14px] text-[13px] font-semibold text-[var(--brand-text-secondary)] border-r border-[var(--brand-border-hairline)]">Name</TableHead>
          <TableHead class="px-5 py-[14px] text-[13px] font-semibold text-[var(--brand-text-secondary)] border-r border-[var(--brand-border-hairline)]">Email</TableHead>
          <TableHead class="px-5 py-[14px] text-[13px] font-semibold text-[var(--brand-text-secondary)] border-r border-[var(--brand-border-hairline)]">Role</TableHead>
          <TableHead class="px-5 py-[14px] text-[13px] font-semibold text-[var(--brand-text-secondary)] border-r border-[var(--brand-border-hairline)]">Status</TableHead>
          <TableHead class="px-5 py-[14px] text-[13px] font-semibold text-[var(--brand-text-secondary)] text-right">Actions</TableHead>
        </TableRow>
      </template>

      <TableRow
        v-for="(m, i) in filtered"
        :key="m.id"
        class="border-b border-[var(--brand-border-row)] last:border-b-0"
        :style="i % 2 === 1 ? { background: 'var(--brand-surface-table-alt)' } : undefined"
      >
        <TableCell class="px-5 py-[13px] border-r border-[var(--brand-border-hairline)]">
          <div class="flex items-center gap-2.5">
            <BrandAvatarInitials :initials="initials(m.name)" :bg="m.avatarBg" :color="m.avatarText" />
            <span class="text-[14px] font-semibold text-[var(--brand-text)]">{{ m.name }}</span>
          </div>
        </TableCell>
        <TableCell class="px-5 py-[13px] border-r border-[var(--brand-border-hairline)] text-[13.5px] text-[var(--brand-text-secondary)]">{{ m.email }}</TableCell>
        <TableCell class="px-5 py-[13px] border-r border-[var(--brand-border-hairline)]">
          <span class="text-[12px] font-bold rounded-[6px] px-2 py-[3px] bg-[var(--brand-badge-settings-bg)] text-[var(--brand-badge-settings-text)]">
            {{ m.role }}
          </span>
        </TableCell>
        <TableCell class="px-5 py-[13px] border-r border-[var(--brand-border-hairline)]">
          <BrandStatusBadge
            variant="dot"
            :label="m.status"
            :tone="m.status === 'Active' ? 'approved' : m.status === 'Pending' ? 'pending' : 'neutral'"
          />
        </TableCell>
        <TableCell class="px-5 py-[13px] text-right">
          <div class="inline-flex items-center gap-1.5">
            <button type="button" class="inline-flex items-center justify-center w-[30px] h-[30px] rounded-[8px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Edit" @click="openEdit(m)">
              <Pencil class="w-3 h-3" />
            </button>
            <button type="button" class="inline-flex items-center justify-center w-[30px] h-[30px] rounded-[8px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors" title="Delete" @click="deleteMember(m)">
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </TableCell>
      </TableRow>
    </SettingsTable>

    <!-- ─────────────── Add / Edit member modal ─────────────── -->
    <SettingsFormModal
      v-model="modalOpen"
      :title="editingId ? 'Edit team member' : 'Add Team Member'"
      width="600px"
    >
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-[13.5px] font-semibold text-[var(--brand-text)] mb-2">
            Name <span class="text-[var(--brand-settings-danger)]">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Name"
            class="w-full box-border px-4 py-3 rounded-[12px] border-[1.5px] border-[var(--brand-border-light)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
          >
        </div>
        <div>
          <label class="block text-[13.5px] font-semibold text-[var(--brand-text)] mb-2">
            Business Email <span class="text-[var(--brand-settings-danger)]">*</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Business Email"
            class="w-full box-border px-4 py-3 rounded-[12px] border-[1.5px] border-[var(--brand-border-light)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
          >
        </div>
        <div>
          <label class="block text-[13.5px] font-semibold text-[var(--brand-text)] mb-2">Phone Number</label>
          <div class="flex items-center border-[1.5px] border-[var(--brand-border-light)] rounded-[12px] bg-[var(--brand-surface-white)] overflow-hidden">
            <div class="flex items-center gap-1 pl-3.5 pr-2.5 py-3 border-r border-[var(--brand-border-light)] text-[13.5px] text-[var(--brand-text-secondary)] whitespace-nowrap">
              🇪🇬 +20
            </div>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="10 01234567"
              class="flex-1 border-0 outline-none px-3.5 py-3 text-[14px] text-[var(--brand-text)] bg-transparent"
            >
          </div>
        </div>
        <div>
          <label class="block text-[13.5px] font-semibold text-[var(--brand-text)] mb-2">
            Role <span class="text-[var(--brand-settings-danger)]">*</span>
          </label>
          <select
            v-model="form.role"
            class="w-full box-border px-4 py-3 rounded-[12px] border-[1.5px] border-[var(--brand-border-light)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] cursor-pointer"
          >
            <option value="" disabled>Role</option>
            <option v-for="r in ROLE_OPTIONS" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>

      <template #footer>
        <BrandButton variant="outline" size="lg" @click="modalOpen = false">Discard</BrandButton>
        <BrandButton variant="primary-teal" size="lg" :disabled="!canSave" @click="saveMember">
          <Mail v-if="!editingId" class="w-3.5 h-3.5" />
          {{ editingId ? 'Save' : 'Submit' }}
        </BrandButton>
      </template>
    </SettingsFormModal>
  </div>
</template>
