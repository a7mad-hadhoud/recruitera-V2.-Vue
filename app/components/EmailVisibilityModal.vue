<!--
  "Selected members" visibility picker for the email composer. Lets the sender
  restrict who can see the message to specific team members and/or hiring
  roles, with search + All/None across two tabs. Emits `save({ members, roles })`;
  visual-only until a message-visibility endpoint exists.
-->
<script setup lang="ts">
import { Search, Check } from 'lucide-vue-next'
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'
import { useTeamMembers, useHiringRoles } from '~/composables/useTeam'
import type { TeamMember, HiringRole } from '~/types'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ save: [payload: { members: string[], roles: string[] }] }>()

const tab = ref<'members' | 'roles'>('members')
const query = ref('')

const { data: teamData } = useTeamMembers()
const members = computed<TeamMember[]>(() => teamData.value?.data ?? [])
const { data: rolesData } = useHiringRoles()
const roles = computed<HiringRole[]>(() => rolesData.value?.data ?? [])

const pickedMembers = ref<Set<string>>(new Set())
const pickedRoles = ref<Set<string>>(new Set())

function initialsOf(name: string) {
  return ((name.split(' ')[0]?.[0] ?? '') + (name.split(' ').slice(-1)[0]?.[0] ?? '')).toUpperCase()
}
const fMembers = computed(() => {
  const q = query.value.trim().toLowerCase()
  return members.value.filter(m => !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
})
const fRoles = computed(() => {
  const q = query.value.trim().toLowerCase()
  return roles.value.filter(r => !q || r.label.toLowerCase().includes(q))
})

function toggle(set: Ref<Set<string>>, key: string) {
  const next = new Set(set.value)
  next.has(key) ? next.delete(key) : next.add(key)
  set.value = next
}
function selectAll() {
  if (tab.value === 'members') pickedMembers.value = new Set(fMembers.value.map(m => m.id))
  else pickedRoles.value = new Set(fRoles.value.map(r => r.id))
}
function selectNone() {
  if (tab.value === 'members') pickedMembers.value = new Set()
  else pickedRoles.value = new Set()
}
function save() {
  emit('save', { members: [...pickedMembers.value], roles: [...pickedRoles.value] })
  open.value = false
}
watch(open, (v) => { if (!v) { query.value = ''; tab.value = 'members' } })
</script>

<template>
  <Dialog v-model:open="open">
    <DialogScrollContent class="max-w-[640px] p-0 gap-0 overflow-hidden">
      <DialogHeader class="px-[26px] py-[22px] space-y-1 text-left">
        <DialogTitle class="text-[20px] font-bold text-[var(--brand-text)] tracking-[-0.01em]">Selected members</DialogTitle>
        <DialogDescription class="text-[14px] text-[var(--brand-text-secondary)]">Select which team members and hiring roles can view.</DialogDescription>
      </DialogHeader>

      <div class="px-[26px] py-5 bg-[var(--brand-canvas)] max-h-[60vh] overflow-y-auto">
        <div class="border border-[var(--brand-border-light)] rounded-[14px] bg-[var(--brand-surface-white)] overflow-hidden">
          <div class="p-3.5">
            <div class="flex items-center gap-2.5 border-[1.6px] border-[var(--brand-border)] rounded-[10px] px-3.5 py-2.5 focus-within:border-[var(--brand-lime)]">
              <Search class="w-[17px] h-[17px] text-[var(--brand-text-quiet)]" stroke-width="1.7" />
              <input v-model="query" type="text" :placeholder="tab === 'members' ? 'Search team members' : 'Search roles'" class="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] text-[var(--brand-text)]">
            </div>
          </div>

          <div class="flex items-center justify-between px-4 border-b border-[var(--brand-border-hairline)]">
            <div class="flex gap-5">
              <button
                v-for="t in (['members', 'roles'] as const)"
                :key="t"
                type="button"
                class="relative pb-2.5 text-[14px] cursor-pointer"
                :class="tab === t ? 'font-bold text-[var(--brand-text)]' : 'font-semibold text-[var(--brand-text-quiet)]'"
                @click="tab = t"
              >
                {{ t === 'members' ? 'Team members' : 'Hiring roles' }}
                <span v-if="tab === t" class="absolute left-0 right-0 -bottom-px h-[2.5px] rounded bg-[var(--brand-teal)]" />
              </button>
            </div>
            <div class="flex items-center gap-3 text-[13.5px] font-semibold">
              <button type="button" class="text-[var(--brand-teal)] cursor-pointer" @click="selectAll">All</button>
              <button type="button" class="text-[var(--brand-text-quiet)] cursor-pointer" @click="selectNone">None</button>
            </div>
          </div>

          <!-- Team members -->
          <template v-if="tab === 'members'">
            <button
              v-for="m in fMembers"
              :key="m.id"
              type="button"
              class="w-full flex items-center gap-3.5 px-4 py-3.5 border-b border-[var(--brand-border-hairline)] last:border-0 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
              @click="toggle(pickedMembers, m.id)"
            >
              <span class="w-6 h-6 shrink-0 rounded-[7px] border-[1.8px] inline-flex items-center justify-center" :class="pickedMembers.has(m.id) ? 'bg-[var(--brand-teal)] border-[var(--brand-teal)]' : 'border-[var(--brand-border-mid)]'">
                <Check v-if="pickedMembers.has(m.id)" class="w-3.5 h-3.5 text-white" stroke-width="3" />
              </span>
              <BrandAvatarInitials :initials="initialsOf(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="lg" />
              <span class="min-w-0"><span class="block font-bold text-[15px] text-[var(--brand-text)]">{{ m.name }}</span><span class="block text-[13.5px] text-[var(--brand-text-quiet)]">{{ m.role }}</span></span>
            </button>
            <p v-if="!fMembers.length" class="px-4 py-6 text-center text-[13.5px] text-[var(--brand-text-quiet)]">No team members match.</p>
          </template>

          <!-- Hiring roles -->
          <template v-else>
            <button
              v-for="r in fRoles"
              :key="r.id"
              type="button"
              class="w-full flex items-center gap-3.5 px-4 py-3.5 border-b border-[var(--brand-border-hairline)] last:border-0 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
              @click="toggle(pickedRoles, r.id)"
            >
              <span class="w-6 h-6 shrink-0 rounded-[7px] border-[1.8px] inline-flex items-center justify-center" :class="pickedRoles.has(r.id) ? 'bg-[var(--brand-teal)] border-[var(--brand-teal)]' : 'border-[var(--brand-border-mid)]'">
                <Check v-if="pickedRoles.has(r.id)" class="w-3.5 h-3.5 text-white" stroke-width="3" />
              </span>
              <BrandAvatarInitials :initials="r.label[0]?.toUpperCase() ?? '?'" size="lg" />
              <span class="min-w-0"><span class="block font-bold text-[15px] text-[var(--brand-text)]">{{ r.label }}</span><span class="block text-[13.5px] text-[var(--brand-text-quiet)]">{{ r.members.length }} team member{{ r.members.length === 1 ? '' : 's' }}</span></span>
            </button>
            <p v-if="!fRoles.length" class="px-4 py-6 text-center text-[13.5px] text-[var(--brand-text-quiet)]">No roles match.</p>
          </template>
        </div>
      </div>

      <DialogFooter class="px-[26px] py-4 border-t border-[var(--brand-border-hairline)] gap-3 sm:justify-end">
        <BrandButton variant="outline" size="md" @click="open = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" size="md" @click="save">Save</BrandButton>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
