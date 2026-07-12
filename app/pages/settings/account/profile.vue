<script setup lang="ts">
import { Pencil, Lock, Upload, Phone } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsToggleCard from '~/components/settings/SettingsToggleCard.vue'
import { BrandAvatarInitials } from '~/components/brand'

definePageMeta({ layout: 'settings' })

// ─────────────── Profile (seeded to match ground truth) ───────────────
const profile = reactive({
  firstName: 'Mohamed',
  lastName: 'Salem',
  email: 'm.salem@icareer.ai',
  phone: '10 633 344 107',
  role: 'Administrator',
})
const fullName = computed(() => `${profile.firstName} ${profile.lastName}`.trim())
const initials = computed(() => `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase())

// ─────────────── Tabs ───────────────
type Tab = 'email' | 'appearance'
const activeTab = ref<Tab>('email')

// ─────────────── Calendar & Email tab ───────────────
const googleConnected = ref(false)
const outlookConnected = ref(false)
const autoForward = ref(true)
const signature = ref('--\nMohamed Salem\nm.salem@icareer.ai')

// ─────────────── Appearance tab ───────────────
type Theme = 'light' | 'dark' | 'system'
const theme = ref<Theme>('light')

// ─────────────── Edit Profile modal ───────────────
type ProfileTab = 'profile' | 'companies' | 'security'
const profileModalOpen = ref(false)
const profileTab = ref<ProfileTab>('profile')
const form = reactive({ ...profile })
function openProfileModal(tab: ProfileTab = 'profile') {
  Object.assign(form, profile)
  profileTab.value = tab
  profileModalOpen.value = true
}
function saveProfile() {
  Object.assign(profile, form)
  profileModalOpen.value = false
}

// ─────────────── Edit Signature modal ───────────────
const signatureModalOpen = ref(false)
const signatureDraft = ref('')
const signatureEditor = ref<HTMLDivElement | null>(null)
function openSignatureModal() {
  signatureDraft.value = signature.value
  signatureModalOpen.value = true
  nextTick(() => { if (signatureEditor.value) signatureEditor.value.innerText = signature.value })
}
function saveSignature() {
  signature.value = signatureEditor.value?.innerText.trim() ?? signatureDraft.value
  signatureModalOpen.value = false
}
function exec(cmd: string, value?: string) {
  signatureEditor.value?.focus()
  document.execCommand(cmd, false, value)
}

// ─────────────── Password fields (used in Edit Profile > Security tab) ───────────────
const passwordForm = reactive({ current: '', next: '', confirm: '' })
const twoFactor = ref(false)
</script>

<template>
  <div>
    <!-- Hero card -->
    <div class="flex items-center gap-4 mb-6">
      <BrandAvatarInitials :initials="initials" size="lg" />
      <div>
        <div class="text-[20px] font-bold text-[var(--brand-text)] mb-0.5">{{ fullName }}</div>
        <div class="text-[13px] text-[var(--brand-text-quiet)]">{{ profile.email }} · {{ profile.role }}</div>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button type="button" class="inline-flex items-center gap-1.5 border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 bg-[var(--brand-surface-white)] text-[13.5px] font-semibold text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint)] transition-colors" @click="openProfileModal('profile')">
          <Pencil class="w-3.5 h-3.5" />
          Edit profile
        </button>
        <button type="button" class="inline-flex items-center gap-1.5 border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 bg-[var(--brand-surface-white)] text-[13.5px] font-semibold text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint)] transition-colors" @click="openProfileModal('security')">
          <Lock class="w-3.5 h-3.5" />
          Security
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-[var(--brand-border-light)] mb-6">
      <button
        type="button"
        class="border-0 border-b-[2.5px] px-4 py-3 text-[14px] outline-none -mb-px transition-colors"
        :class="activeTab === 'email' ? 'border-[var(--brand-teal)] font-bold text-[var(--brand-text)]' : 'border-transparent font-medium text-[var(--brand-text-quiet)]'"
        @click="activeTab = 'email'"
      >
        Calendar & Email
      </button>
      <button
        type="button"
        class="border-0 border-b-[2.5px] px-4 py-3 text-[14px] outline-none -mb-px transition-colors"
        :class="activeTab === 'appearance' ? 'border-[var(--brand-teal)] font-bold text-[var(--brand-text)]' : 'border-transparent font-medium text-[var(--brand-text-quiet)]'"
        @click="activeTab = 'appearance'"
      >
        Appearance
      </button>
    </div>

    <!-- Calendar & Email tab -->
    <div v-if="activeTab === 'email'">
      <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">Connected calendars</div>
      <p class="text-[13.5px] text-[var(--brand-text-quiet)] mb-3.5">Connect a calendar to schedule interviews directly from Recruitera.</p>
      <div class="flex flex-col gap-2 mb-5">
        <div class="flex items-center gap-3 border border-[var(--brand-border-light)] rounded-[12px] px-4 py-3 bg-[var(--brand-surface-white)]">
          <div class="w-8 h-8 rounded-[8px] border border-[var(--brand-border-light)] flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 533 544"><path d="M533 278c0-18-1-37-4-55H272v105h147c-6 34-26 64-54 83v68h88c51-47 81-117 81-200z" fill="#4285f4"/><path d="M272 544c73 0 135-24 180-66l-88-68c-24 17-56 26-93 26-71 0-131-48-153-112H28v70c46 92 140 150 244 150z" fill="#34a853"/><path d="M119 324c-11-34-11-70 0-104V150H28c-39 77-39 168 0 244l91-70z" fill="#fbbc04"/><path d="M272 108c39 0 76 14 104 41l78-78C405 25 340-1 272 0 169 0 75 58 28 150l91 70c21-65 82-112 153-112z" fill="#ea4335"/></svg>
          </div>
          <div class="flex-1">
            <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">Google Calendar</div>
            <div class="text-[12px]" :class="googleConnected ? 'text-[var(--brand-status-approved-text)]' : 'text-[var(--brand-text-quiet)]'">{{ googleConnected ? 'Connected' : 'Not connected' }}</div>
          </div>
          <button type="button" class="inline-flex items-center border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 bg-[var(--brand-surface-white)] text-[13.5px] font-semibold text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint)] transition-colors" @click="googleConnected = !googleConnected">{{ googleConnected ? 'Disconnect' : 'Connect' }}</button>
        </div>
        <div class="flex items-center gap-3 border border-[var(--brand-border-light)] rounded-[12px] px-4 py-3 bg-[var(--brand-surface-white)]">
          <div class="w-8 h-8 rounded-[8px] border border-[var(--brand-border-light)] flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 17 17"><rect x="0" y="0" width="8" height="8" fill="#F25022"/><rect x="9" y="0" width="8" height="8" fill="#7FBA00"/><rect x="0" y="9" width="8" height="8" fill="#00A4EF"/><rect x="9" y="9" width="8" height="8" fill="#FFB900"/></svg>
          </div>
          <div class="flex-1">
            <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">Microsoft (Outlook)</div>
            <div class="text-[12px]" :class="outlookConnected ? 'text-[var(--brand-status-approved-text)]' : 'text-[var(--brand-text-quiet)]'">{{ outlookConnected ? 'Connected' : 'Not connected' }}</div>
          </div>
          <button type="button" class="inline-flex items-center border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 bg-[var(--brand-surface-white)] text-[13.5px] font-semibold text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint)] transition-colors" @click="outlookConnected = !outlookConnected">{{ outlookConnected ? 'Disconnect' : 'Connect' }}</button>
        </div>
      </div>

      <div class="h-px bg-[var(--brand-border-light)] my-5"></div>

      <!-- Email signature -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <div class="text-[14px] font-bold text-[var(--brand-text)]">Email signature</div>
          <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Use your own signature when sending emails from Recruitera.</div>
        </div>
        <button type="button" class="inline-flex items-center gap-1.5 border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 bg-[var(--brand-surface-white)] text-[13.5px] font-semibold text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint)] transition-colors" @click="openSignatureModal">
          <Pencil class="w-3 h-3" />
          Edit
        </button>
      </div>
      <div class="border border-[var(--brand-border-light)] rounded-[10px] overflow-hidden">
        <div class="p-4 text-[13.5px] text-[var(--brand-text-secondary)] leading-[1.6] min-h-[72px] whitespace-pre-wrap">{{ signature }}</div>
        <div class="border-t border-dashed border-[var(--brand-border-light)] px-4 py-2.5 bg-[var(--brand-canvas)] text-[12px] text-[var(--brand-text-quiet)] flex items-center gap-1.5">
          <Phone class="w-3 h-3" />
          Sent via <strong class="text-[var(--brand-teal)] ml-1">Recruitera</strong>
        </div>
      </div>

      <div class="h-px bg-[var(--brand-border-light)] my-5"></div>

      <!-- Auto-forward -->
      <SettingsToggleCard
        v-model="autoForward"
        title="Auto-forward emails"
        :description="`Forward candidate emails to ${profile.email}`"
      />
    </div>

    <!-- Appearance tab -->
    <div v-else>
      <div class="text-[14px] font-bold text-[var(--brand-text)] mb-3.5">Theme</div>
      <div class="flex gap-3">
        <button
          v-for="opt in [
            { id: 'light' as Theme, label: 'Light', bg: 'var(--brand-theme-light-bg)', dot: 'var(--brand-theme-light-dot)' },
            { id: 'dark' as Theme, label: 'Dark', bg: 'var(--brand-theme-dark-bg)', dot: 'var(--brand-theme-dark-dot)' },
            { id: 'system' as Theme, label: 'System', bg: 'transparent', dot: 'var(--brand-theme-system-dot)' },
          ]"
          :key="opt.id"
          type="button"
          class="rounded-[10px] px-6 py-4 text-center outline-none transition-all"
          :class="theme === opt.id ? 'border-2 border-[var(--brand-teal)]' : 'border border-[var(--brand-border-light)]'"
          :style="{ background: opt.bg }"
          @click="theme = opt.id"
        >
          <div class="w-5 h-5 rounded-full mx-auto mb-1.5" :style="{ background: opt.dot }" />
          <span class="text-[12px] font-bold" :style="{ color: opt.dot }">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <!-- ─────────────── Edit Profile modal ─────────────── -->
    <SettingsFormModal v-model="profileModalOpen" title="Edit profile" width="600px" scrollable>
      <!-- Modal-internal tabs -->
      <div class="flex border-b border-[var(--brand-border-light)] -mt-3 mb-5">
        <button
          v-for="t in ([
            { id: 'profile' as ProfileTab, label: 'Profile' },
            { id: 'companies' as ProfileTab, label: 'Companies', badge: 1 },
            { id: 'security' as ProfileTab, label: 'Security' },
          ])"
          :key="t.id"
          type="button"
          class="border-0 border-b-[2.5px] px-3.5 py-2.5 text-[14px] outline-none -mb-px transition-colors flex items-center gap-1.5"
          :class="profileTab === t.id ? 'border-[var(--brand-teal)] font-bold text-[var(--brand-text)]' : 'border-transparent font-medium text-[var(--brand-text-quiet)]'"
          @click="profileTab = t.id"
        >
          {{ t.label }}
          <span v-if="t.badge" class="text-[11px] font-bold bg-[var(--brand-badge-settings-bg)] text-[var(--brand-badge-settings-text)] rounded-full px-2 py-[1px]">{{ t.badge }}</span>
        </button>
      </div>

      <!-- Profile tab -->
      <div v-if="profileTab === 'profile'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">First name</label>
          <input v-model="form.firstName" type="text" class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors">
        </div>
        <div>
          <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">Last name</label>
          <input v-model="form.lastName" type="text" class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors">
        </div>
        <div class="col-span-2">
          <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">Email</label>
          <input v-model="form.email" type="email" class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors">
        </div>
        <div class="col-span-2">
          <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">Phone</label>
          <div class="flex items-center gap-2 border-[1.5px] border-[var(--brand-border)] rounded-[9px] overflow-hidden px-3">
            🇪🇬<span class="text-[13px] text-[var(--brand-text-quiet)] font-semibold">+20</span>
            <input v-model="form.phone" type="text" class="flex-1 border-0 outline-none text-[14px] text-[var(--brand-text)] bg-transparent py-2.5">
          </div>
        </div>
        <div class="col-span-2">
          <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">Photo</label>
          <button type="button" class="inline-flex items-center gap-2 border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 bg-[var(--brand-surface-white)] text-[13.5px] font-semibold text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint)] transition-colors">
            <Upload class="w-3.5 h-3.5" />
            Upload photo
          </button>
        </div>
      </div>

      <!-- Companies tab -->
      <div v-else-if="profileTab === 'companies'">
        <div class="text-[14px] font-bold text-[var(--brand-text)] mb-3.5">Companies</div>
        <div class="relative border border-[var(--brand-border-light)] rounded-[12px] border-l-[3px] border-l-[var(--brand-teal)] flex items-center gap-3 px-4 py-3.5">
          <div class="w-9 h-9 rounded-[9px] bg-[var(--brand-teal)] text-[var(--brand-lime)] flex items-center justify-center font-extrabold text-[14px] shrink-0">i</div>
          <div class="flex-1">
            <div class="text-[14px] font-semibold text-[var(--brand-text)]">iCareer</div>
            <div class="text-[12px] text-[var(--brand-text-quiet)]">Admin</div>
          </div>
          <span class="text-[13px] font-semibold text-[var(--brand-status-approved-text)]">✓ Signed in</span>
        </div>
      </div>

      <!-- Security tab -->
      <div v-else>
        <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">Change password</div>
        <p class="text-[13px] text-[var(--brand-text-quiet)] mb-4">Update your account password.</p>
        <div class="flex flex-col gap-3">
          <div>
            <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">Current password</label>
            <input v-model="passwordForm.current" type="password" placeholder="••••••••" class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">New password</label>
            <input v-model="passwordForm.next" type="password" placeholder="••••••••" class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-1.5">Confirm new password</label>
            <input v-model="passwordForm.confirm" type="password" placeholder="••••••••" class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors">
          </div>
        </div>
        <div class="h-px bg-[var(--brand-border-light)] my-5"></div>
        <SettingsToggleCard
          v-model="twoFactor"
          title="Two-factor authentication"
          description="Add an extra layer of security to your account"
        />
      </div>

      <template #footer>
        <button type="button" class="px-4 py-2.5 text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none" @click="profileModalOpen = false">Cancel</button>
        <button type="button" class="px-6 py-2.5 rounded-[10px] bg-[var(--brand-teal)] text-white text-[13.5px] font-bold outline-none" @click="saveProfile">Save changes</button>
      </template>
    </SettingsFormModal>

    <!-- ─────────────── Edit Signature modal ─────────────── -->
    <SettingsFormModal v-model="signatureModalOpen" title="Email signature" width="600px">
      <p class="text-[12.5px] text-[var(--brand-text-quiet)] -mt-4 mb-3">Edit your Recruitera email signature</p>
      <div class="border border-[var(--brand-border-light)] rounded-[10px] overflow-hidden">
        <div class="flex items-center gap-0.5 px-3 py-2 border-b border-[var(--brand-border-light)] bg-[var(--brand-canvas)]">
          <button type="button" class="w-7 h-7 rounded-[6px] font-bold text-[14px] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Bold" @click="exec('bold')">B</button>
          <button type="button" class="w-7 h-7 rounded-[6px] italic text-[14px] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Italic" @click="exec('italic')">I</button>
          <button type="button" class="w-7 h-7 rounded-[6px] underline text-[14px] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Underline" @click="exec('underline')">U</button>
        </div>
        <div ref="signatureEditor" contenteditable="true" class="px-5 py-4 min-h-[140px] text-[13.5px] text-[var(--brand-text-secondary)] outline-none leading-[1.7]" />
        <div class="border-t border-dashed border-[var(--brand-border-light)] px-5 py-2.5 bg-[var(--brand-canvas)] text-[12px] text-[var(--brand-text-quiet)] flex items-center gap-1.5">
          <Phone class="w-3 h-3" />
          Sent via <strong class="text-[var(--brand-teal)] ml-1">Recruitera</strong>
        </div>
      </div>
      <template #footer>
        <button type="button" class="px-4 py-2.5 text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none" @click="signatureModalOpen = false">Cancel</button>
        <button type="button" class="px-6 py-2.5 rounded-[10px] bg-[var(--brand-teal)] text-white text-[13.5px] font-bold outline-none" @click="saveSignature">Save</button>
      </template>
    </SettingsFormModal>
  </div>
</template>
