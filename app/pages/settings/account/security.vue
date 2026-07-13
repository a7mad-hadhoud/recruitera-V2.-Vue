<script setup lang="ts">
import { Monitor } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsToggleCard from '~/components/settings/SettingsToggleCard.vue'
import { BrandCard, BrandStatusBadge, BrandButton } from '~/components/brand'

definePageMeta({ layout: 'settings' })

const twoFactor = ref(false)

// Active sessions — seeded once so revoke can mutate
interface Session { id: string; device: string; location: string; current: boolean }
const sessions = ref<Session[]>([
  { id: 's1', device: 'MacBook Pro', location: 'Cairo, EG', current: true },
])

function revokeSession(id: string) {
  sessions.value = sessions.value.filter(s => s.id !== id)
}

// ─────────────── Change password modal ───────────────
const modalOpen = ref(false)
const passwordForm = reactive({ current: '', next: '', confirm: '' })
function openChangePassword() {
  passwordForm.current = ''
  passwordForm.next = ''
  passwordForm.confirm = ''
  modalOpen.value = true
}
const canSave = computed(() =>
  passwordForm.current.length >= 1
  && passwordForm.next.length >= 8
  && passwordForm.next === passwordForm.confirm,
)
const lastChangedLabel = ref('Last changed 3 months ago')
function savePassword() {
  if (!canSave.value) return
  lastChangedLabel.value = 'Last changed just now'
  modalOpen.value = false
}
</script>

<template>
  <div>
    <SettingsPageHeader title="Security" />

    <div class="flex flex-col gap-4">
      <!-- Password -->
      <BrandCard padded>
        <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">Password</div>
        <div class="text-[13px] text-[var(--brand-text-quiet)] mb-3.5">{{ lastChangedLabel }}</div>
        <BrandButton variant="outline" @click="openChangePassword">Change password</BrandButton>
      </BrandCard>

      <!-- Two-factor authentication -->
      <SettingsToggleCard
        v-model="twoFactor"
        title="Two-factor authentication"
        description="Add an extra layer of security to your account"
      />

      <!-- Active sessions -->
      <BrandCard padded>
        <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">Active sessions</div>
        <div class="text-[13px] text-[var(--brand-text-quiet)] mb-3.5">Manage where you're logged in</div>
        <div class="flex flex-col gap-2">
          <div
            v-for="s in sessions"
            :key="s.id"
            class="flex items-center gap-2.5 px-3 py-3 bg-[var(--brand-canvas)] rounded-[8px]"
          >
            <Monitor class="w-[18px] h-[18px] text-[var(--brand-nav-text)] shrink-0" />
            <div class="flex-1">
              <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ s.device }} — {{ s.location }}</div>
              <div class="text-[12px] text-[var(--brand-text-quiet)]">{{ s.current ? 'Current session' : 'Signed in earlier' }}</div>
            </div>
            <BrandStatusBadge v-if="s.current" variant="text" label="Active" tone="approved" />
            <BrandButton v-else variant="danger-ghost" size="sm" @click="revokeSession(s.id)">Revoke</BrandButton>
          </div>
          <p v-if="!sessions.length" class="text-[13px] text-[var(--brand-text-quiet)] px-3 py-2">No active sessions.</p>
        </div>
      </BrandCard>
    </div>

    <!-- ─────────────── Change password modal ─────────────── -->
    <SettingsFormModal v-model="modalOpen" title="Change password" width="480px">
      <p class="text-[13px] text-[var(--brand-text-quiet)] -mt-4 mb-4">Update your account password.</p>
      <div class="flex flex-col gap-3">
        <div>
          <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">Current password</label>
          <input v-model="passwordForm.current" type="password" placeholder="••••••••" class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors">
        </div>
        <div>
          <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">New password</label>
          <input v-model="passwordForm.next" type="password" placeholder="At least 8 characters" class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors">
        </div>
        <div>
          <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">Confirm new password</label>
          <input v-model="passwordForm.confirm" type="password" placeholder="••••••••" class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors">
          <p v-if="passwordForm.next && passwordForm.confirm && passwordForm.next !== passwordForm.confirm" class="text-[12px] text-[var(--brand-settings-danger)] mt-1">Passwords don't match</p>
        </div>
      </div>
      <template #footer>
        <BrandButton variant="ghost" @click="modalOpen = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" :disabled="!canSave" @click="savePassword">Save</BrandButton>
      </template>
    </SettingsFormModal>
  </div>
</template>
