<!--
  Floating popover that lets the user pick an approver.
  Two sections: "Dynamic roles" (Hiring Manager, Requisition Owner, Department Head)
  and "Users" (name + avatar). Filtered by a Search box.
  Positioned via `anchor: {x, y}` (bottom-left of the "Add approver" button in the
  parent). Click outside → close.
-->
<script setup lang="ts">
import { User } from 'lucide-vue-next'
import { BrandSearchBar, BrandAvatarInitials } from '~/components/brand'

export interface DynamicRole { name: string, desc: string }
export interface UserApprover { name: string, initials: string, role?: string }

const props = withDefaults(defineProps<{
  open: boolean
  anchor: { x: number, y: number } | null
  roles: DynamicRole[]
  users: UserApprover[]
  clearLabel?: string
}>(), {
  clearLabel: '',
})

const emit = defineEmits<{
  close: []
  pick: [event: { type: 'user' | 'dynamic', name: string, initials?: string }]
  clear: []
}>()

const search = ref('')

watch(() => props.open, (v) => {
  if (v) search.value = ''
})

const filteredRoles = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? props.roles.filter(r => r.name.toLowerCase().includes(q)) : props.roles
})
const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? props.users.filter(u => u.name.toLowerCase().includes(q)) : props.users
})
</script>

<template>
  <Teleport to="body">
    <template v-if="open && anchor">
      <div class="fixed inset-0 z-[400]" @click="emit('close')" />
      <div
        class="fixed z-[500] bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,20,18,0.16)] border border-[var(--brand-border-light)] p-2 w-[280px] max-h-[400px] overflow-y-auto"
        :style="{ left: `${anchor.x}px`, top: `${anchor.y}px` }"
        @click.stop
      >
        <div class="px-2 pb-2 border-b border-[var(--brand-border-fade)] mb-1.5">
          <BrandSearchBar v-model="search" size="sm" placeholder="Search..." />
        </div>

        <button
          v-if="clearLabel && !search"
          type="button"
          class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[8px] border-none bg-transparent text-left outline-none hover:bg-[var(--brand-settings-modal-bg)] transition-colors text-[13px] text-[var(--brand-text-quiet)]"
          @click="emit('clear')"
        >
          {{ clearLabel }}
        </button>

        <div v-if="filteredRoles.length">
          <div class="text-[11px] font-bold text-[var(--brand-text-quiet)] px-2.5 py-1.5 uppercase tracking-[0.06em]">
            Dynamic roles
          </div>
          <button
            v-for="r in filteredRoles"
            :key="r.name"
            type="button"
            class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[8px] border-none bg-transparent text-left outline-none hover:bg-[var(--brand-settings-modal-bg)] transition-colors"
            @click="emit('pick', { type: 'dynamic', name: r.name })"
          >
            <div class="w-[26px] h-[26px] rounded-[6px] bg-[var(--brand-dynamic-role-icon-bg)] flex items-center justify-center shrink-0">
              <User class="w-3.5 h-3.5 text-[var(--brand-dynamic-role-text)]" />
            </div>
            <div>
              <div class="text-[13px] font-semibold text-[var(--brand-text)]">{{ r.name }}</div>
              <div class="text-[11.5px] text-[var(--brand-text-quiet)]">{{ r.desc }}</div>
            </div>
          </button>
        </div>

        <div v-if="filteredUsers.length" class="mt-1">
          <div class="text-[11px] font-bold text-[var(--brand-text-quiet)] px-2.5 py-1.5 uppercase tracking-[0.06em]">
            Users
          </div>
          <button
            v-for="u in filteredUsers"
            :key="u.name"
            type="button"
            class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[8px] border-none bg-transparent text-left outline-none hover:bg-[var(--brand-settings-modal-bg)] transition-colors"
            @click="emit('pick', { type: 'user', name: u.name, initials: u.initials })"
          >
            <BrandAvatarInitials :initials="u.initials" size="sm" />
            <div>
              <div class="text-[13px] font-semibold text-[var(--brand-text)]">{{ u.name }}</div>
              <div v-if="u.role" class="text-[11.5px] text-[var(--brand-text-quiet)]">{{ u.role }}</div>
            </div>
          </button>
        </div>

        <div v-if="!filteredRoles.length && !filteredUsers.length" class="text-center text-[13px] text-[var(--brand-text-quiet)] py-4">
          No matches
        </div>
      </div>
    </template>
  </Teleport>
</template>
