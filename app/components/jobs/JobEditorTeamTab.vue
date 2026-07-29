<!--
  Team tab body for the /jobs/new editor. Ports the reference layout:
  two-column card (member picker + added zone) + Auto-Distribute
  toggle + Candidate Distribution (Random / Sequential picker +
  recruiter capacity list + Save).

  Reuses:
    · useTeamMembers()  — settings composable, same source as
                          /settings/team so this stays in lockstep
                          with the workspace roster.
    · BrandButton, BrandAvatarInitials  — no new UI primitives.
    · --brand-* tokens only; no hex.
-->
<script setup lang="ts">
import { Search, UserPlus, ClipboardPlus, X, GripVertical, ArrowLeftRight, Users, Copy, Check, Shuffle, ListOrdered, Link2, Hand } from 'lucide-vue-next'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'
import { useTeamMembers } from '~/composables/useTeam'
import JobTeamMemberModal from '~/components/jobs/JobTeamMemberModal.vue'
import type { TeamMember } from '~/types'

const { data: teamData } = useTeamMembers()
const roster = computed<TeamMember[]>(() => teamData.value?.data ?? [])

// `avatarText` on TeamMember is actually a color token (foreground color
// for the initials pill), NOT the initials themselves — mirrors how the
// Settings > Team page renders these. Derive initials from the display
// name at the render site so the avatar reads correctly here.
function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last  = parts.length > 1 ? parts[parts.length - 1]![0] : ''
  return (first + last).toUpperCase() || '?'
}

// Per-job added-member set (fixture; wire to job.assignedMemberIds when
// the API endpoint lands). Seed with two so the layout reads populated.
const added = ref<Set<string>>(new Set())
watchEffect(() => {
  if (!added.value.size && roster.value.length >= 2) {
    added.value = new Set([roster.value[0]!.id, roster.value[1]!.id])
  }
})

// Left column: search + list. Rows show Add or Added.
const search = ref('')
const filteredRoster = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return roster.value
  return roster.value.filter(m =>
    m.name.toLowerCase().includes(q)
    || m.email.toLowerCase().includes(q))
})

// Members added straight from the "Add Member To Job" modal (no roster
// row picked) live here so they still show under Added Members.
const manualMembers = ref<TeamMember[]>([])
const addedMembers = computed<TeamMember[]>(() => [
  ...roster.value.filter(m => added.value.has(m.id)),
  ...manualMembers.value,
])

function toggleAdd(id: string) {
  const next = new Set(added.value)
  if (next.has(id)) next.delete(id); else next.add(id)
  added.value = next
}

// Add-member flow — clicking "Add" opens the config modal (Role +
// stage visibility) instead of adding directly. Save commits both the
// membership and its per-job config.
const memberModalOpen = ref(false)
const pendingMember = ref<TeamMember | null>(null)
const memberConfig = ref<Record<string, { role: string; customizeStages: boolean; stages: string[] }>>({})
function openMemberModal(m: TeamMember | null = null) {
  pendingMember.value = m ?? firstUnaddedMember()
  memberModalOpen.value = true
}
function firstUnaddedMember() {
  return roster.value.find(m => !added.value.has(m.id)) ?? null
}
function onMemberSave(payload: { memberId: string; role: string; customizeStages: boolean; stages: string[] }) {
  if (payload.memberId && roster.value.some(m => m.id === payload.memberId)) {
    added.value = new Set([...added.value, payload.memberId])
    memberConfig.value = { ...memberConfig.value, [payload.memberId]: { role: payload.role, customizeStages: payload.customizeStages, stages: payload.stages } }
  } else {
    // Generic add (no roster row) — synthesize a row so it shows.
    manualMembers.value = [...manualMembers.value, {
      id: `tm-${manualMembers.value.length + 1}`,
      name: payload.role,
      email: '',
      role: payload.role,
      avatarBg: 'var(--brand-lime-tint)',
      avatarText: 'var(--brand-teal)',
    } as TeamMember]
  }
}
function roleFor(m: TeamMember) { return memberConfig.value[m.id]?.role || m.role }

// Per-member capacity — Unlimited (default) or a numeric cap. Numeric
// caps aren't wired to the UI yet; toggle just flips Unlimited on/off.
const capacityUnlimited = ref<Record<string, boolean>>({})
function isUnlimited(id: string) { return capacityUnlimited.value[id] ?? true }
function toggleUnlimited(id: string) {
  capacityUnlimited.value = { ...capacityUnlimited.value, [id]: !isUnlimited(id) }
}
// Sequential distribution: each recruiter (except the last) gets a numeric
// capacity; the last recruiter absorbs any remaining candidates (Unlimited).
const capacityValues = ref<Record<string, string>>({})
const lastMemberId = computed(() =>
  addedMembers.value.length ? addedMembers.value[addedMembers.value.length - 1]!.id : null,
)

// Auto-distribute + distribution mode state
const autoDistribute = ref(true)
type DistMode = 'random' | 'sequential' | 'referral' | 'claim'
const distMode = ref<DistMode>('random')
const DIST_MODES: Array<{ key: DistMode; label: string; desc: string; icon: any }> = [
  { key: 'random',     label: 'Random Distribution',     desc: 'Assign candidates evenly across the team.', icon: Shuffle },
  { key: 'sequential', label: 'Sequential Distribution',  desc: 'Assigned in order by recruiter list.', icon: ListOrdered },
  { key: 'referral',   label: 'Referral Link',           desc: 'Assigned by the recruiter link used.', icon: Link2 },
  { key: 'claim',      label: 'Open Pool (Claim on Open)', desc: 'Unassigned until a recruiter opens it.', icon: Hand },
]
// Per-recruiter referral link (Referral Link mode).
function refLink(m: TeamMember) {
  const handle = (m.email.split('@')[0] || m.id).toLowerCase()
  return `apply.recruitera.ai/mmm?ref=${handle}`
}
const copiedRef = ref<string | null>(null)
function copyRef(m: TeamMember) {
  navigator.clipboard?.writeText('https://' + refLink(m))
  copiedRef.value = m.id
  setTimeout(() => { if (copiedRef.value === m.id) copiedRef.value = null }, 1500)
}

// Save state — noop today, but lights up the button and shows a small
// microcopy under the CTA after save so users see feedback.
const saveState = ref<'idle' | 'saving' | 'saved'>('idle')
async function save() {
  saveState.value = 'saving'
  await new Promise(r => setTimeout(r, 400))
  saveState.value = 'saved'
  setTimeout(() => (saveState.value = 'idle'), 1600)
}
</script>

<template>
  <div class="max-w-[960px] mx-auto pt-8 flex flex-col gap-6">
    <!-- Two-column card: picker (left) + added zone (right) -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] overflow-hidden">
      <div class="grid grid-cols-2 min-h-[380px] divide-x divide-[var(--brand-border-fade)]">
        <!-- LEFT: search + roster -->
        <div class="flex flex-col">
          <div class="p-5">
            <div class="relative">
              <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)]" stroke-width="2" />
              <input
                v-model="search"
                placeholder="Search…"
                class="w-full h-9 pl-9 pr-3 text-[13.5px] rounded-full bg-[var(--brand-canvas)] border-[1.5px] border-[var(--brand-border-fade)] focus:border-[var(--brand-teal)] focus:bg-white focus:outline-none transition"
              >
            </div>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div
              v-for="m in filteredRoster"
              :key="m.id"
              class="flex items-center gap-3 px-5 py-3 border-b border-[var(--brand-border-fade)] last:border-b-0"
            >
              <BrandAvatarInitials
                :initials="initialsFor(m.name)"
                :bg="m.avatarBg"
                :color="m.avatarText"
                size="xl"
              />
              <div class="flex-1 min-w-0">
                <div class="text-[13.5px] font-bold text-[var(--brand-text)] truncate">{{ m.name }}</div>
                <div class="text-[12px] text-[var(--brand-text-quiet)] truncate">{{ m.email }}</div>
              </div>
              <button
                v-if="!added.has(m.id)"
                type="button"
                class="text-[13px] font-bold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] px-2 py-1 rounded-md hover:bg-[var(--brand-canvas)] transition"
                @click="openMemberModal(m)"
              >Add</button>
              <span
                v-else
                class="text-[12px] font-semibold text-[var(--brand-text-quiet)]"
              >Added</span>
            </div>
          </div>
          <div class="p-5 border-t border-[var(--brand-border-fade)]">
            <button
              type="button"
              class="w-full inline-flex items-center justify-center gap-2 h-10 rounded-[9px] border-[1.5px] border-dashed border-[var(--brand-border)] bg-transparent text-[13.5px] font-bold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] transition disabled:opacity-40 disabled:pointer-events-none"
              :disabled="!firstUnaddedMember()"
              @click="openMemberModal(firstUnaddedMember()!)"
            >
              <UserPlus class="w-4 h-4" stroke-width="1.8" />
              Add Team Member
            </button>
          </div>
        </div>

        <!-- RIGHT: dropzone + added -->
        <div class="flex flex-col p-5 gap-5">
          <div class="rounded-[12px] border-[2px] border-dashed border-[var(--brand-border)] bg-[var(--brand-canvas)] px-5 py-7 flex flex-col items-center justify-center gap-2 text-center">
            <ClipboardPlus class="w-8 h-8 text-[var(--brand-text-faint)]" stroke-width="1.4" />
            <div class="text-[13px] text-[var(--brand-text-quiet)] leading-relaxed">
              Drag and drop member here<br>or click on add button
            </div>
          </div>

          <div>
            <div class="text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2.5">Added Members</div>
            <div v-if="addedMembers.length" class="flex flex-col gap-2.5">
              <div
                v-for="m in addedMembers"
                :key="m.id"
                class="flex items-center gap-2.5"
              >
                <BrandAvatarInitials
                  :initials="initialsFor(m.name)"
                  :bg="m.avatarBg"
                  :color="m.avatarText"
                  size="xl"
                />
                <div class="flex-1 min-w-0">
                  <div class="text-[13.5px] font-bold text-[var(--brand-text)] truncate">
                    {{ m.name }}
                    <span class="font-normal text-[var(--brand-text-quiet)]">— {{ roleFor(m) }}</span>
                  </div>
                  <div class="text-[12px] text-[var(--brand-text-quiet)] truncate">{{ m.email }}</div>
                </div>
                <button
                  class="w-6 h-6 rounded-full inline-flex items-center justify-center border-[1.5px] border-[var(--brand-border)] bg-white text-[var(--brand-text-quiet)] hover:text-[var(--brand-status-closed-text)] hover:border-[var(--brand-status-closed-text)] transition"
                  :aria-label="`Remove ${m.name}`"
                  @click="toggleAdd(m.id)"
                >
                  <X class="w-3.5 h-3.5" stroke-width="2" />
                </button>
              </div>
            </div>
            <div v-else class="text-[13px] text-[var(--brand-text-faint)] italic">No members added yet.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Auto-Distribute + Candidate Distribution card -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-8">
    <!-- Auto-Distribute Candidates -->
    <div class="flex items-center gap-4">
      <ArrowLeftRight class="w-5 h-5 text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.7" />
      <div class="flex-1 min-w-0">
        <div class="text-[15px] font-bold text-[var(--brand-text)]">Auto-Distribute Candidates</div>
        <div class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Assign candidates to recruiters based on distribution rules</div>
      </div>
      <label class="inline-flex items-center cursor-pointer shrink-0">
        <span
          class="relative inline-flex w-[38px] h-[22px] rounded-full transition-colors"
          :style="{ background: autoDistribute ? 'var(--brand-teal)' : 'var(--brand-border)' }"
        >
          <span
            class="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-[0_1px_2px_rgba(0,20,18,0.25)] transition-[left]"
            :style="{ left: autoDistribute ? '18px' : '2px' }"
          />
        </span>
        <input v-model="autoDistribute" type="checkbox" class="sr-only" aria-label="Auto-distribute candidates">
      </label>
    </div>

    <!-- Candidate Distribution -->
    <div v-if="autoDistribute" class="mt-6 pt-6 border-t border-[var(--brand-border-fade)]">
      <div class="flex items-center gap-2.5 mb-3">
        <Users class="w-5 h-5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
        <h2 class="text-[16px] font-bold text-[var(--brand-text)]">Candidate Distribution</h2>
      </div>

      <div class="text-[13px] text-[var(--brand-text-secondary)] mb-2">Distribution Mode</div>
      <div class="grid grid-cols-4 gap-3 mb-3.5">
        <button
          v-for="mode in DIST_MODES"
          :key="mode.key"
          type="button"
          class="relative h-full text-left rounded-[10px] border-[1.5px] p-4 pr-9 transition"
          :class="distMode === mode.key
            ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]'
            : 'border-[var(--brand-border)] bg-white hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]'"
          @click="distMode = mode.key"
        >
          <!-- selection indicator — pinned to the same top-right corner on every card -->
          <span
            v-if="distMode === mode.key"
            class="absolute top-4 right-4 w-5 h-5 rounded-full bg-[var(--brand-teal)] inline-flex items-center justify-center"
          >
            <Check class="w-3 h-3 text-[var(--brand-lime)]" stroke-width="3" />
          </span>
          <span v-else class="absolute top-4 right-4 w-5 h-5 rounded-full border-[1.5px] border-[var(--brand-border)]" />

          <component :is="mode.icon" class="w-5 h-5 text-[var(--brand-text-secondary)] mb-3" stroke-width="1.7" />
          <div class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">{{ mode.label }}</div>
          <div class="text-[12.5px] text-[var(--brand-text-quiet)] line-clamp-2">{{ mode.desc }}</div>
        </button>
      </div>

      <div class="text-[13px] text-[var(--brand-text-secondary)] mb-3">
        <template v-if="distMode === 'sequential'">
          Recruiters will receive candidates in the order listed below.
          <span class="font-bold text-[var(--brand-text)]">The last recruiter will receive any remaining candidates.</span>
        </template>
        <template v-else-if="distMode === 'referral'">
          Share each recruiter's link. Candidates who apply through it are automatically assigned to that recruiter.
        </template>
        <template v-else-if="distMode === 'claim'">
          New candidates stay in a shared pool. <span class="font-bold text-[var(--brand-text)]">The first recruiter to open a candidate's profile is assigned to it.</span>
        </template>
        <template v-else>
          When using capacity limits, at least one recruiter must be set as unlimited to handle overflow.
        </template>
      </div>

      <!-- Recruiter list — hidden for the Open Pool (claim) mode -->
      <div v-if="distMode !== 'claim'" class="flex flex-col gap-2">
        <div
          v-for="m in addedMembers"
          :key="m.id"
          class="flex items-center gap-3 px-4 py-3 border border-[var(--brand-border-fade)] rounded-[10px] bg-white"
        >
          <GripVertical class="w-3.5 h-3.5 text-[var(--brand-border)] cursor-grab shrink-0" stroke-width="2" />
          <BrandAvatarInitials :initials="initialsFor(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="xl" />
          <div class="flex-1 min-w-0">
            <div class="text-[13.5px] font-bold text-[var(--brand-text)] truncate">{{ m.name }}</div>
            <div class="text-[12px] text-[var(--brand-text-quiet)] truncate">{{ m.email }}</div>
          </div>
          <!-- Sequential: capacity input per recruiter; the last one is Unlimited -->
          <template v-if="distMode === 'sequential'">
            <span v-if="m.id === lastMemberId" class="text-[13.5px] font-bold text-[var(--brand-text-secondary)] shrink-0">Unlimited</span>
            <div v-else class="shrink-0 flex flex-col items-center gap-1">
              <input
                v-model="capacityValues[m.id]"
                type="number"
                min="0"
                placeholder="0"
                :aria-label="`Capacity for ${m.name}`"
                class="w-[64px] h-9 px-2 text-center text-[14px] font-bold rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
              >
              <span class="text-[11px] font-semibold text-[var(--brand-text-quiet)]">Capacity</span>
            </div>
          </template>

          <!-- Referral Link: per-recruiter shareable link + copy -->
          <div v-else-if="distMode === 'referral'" class="shrink-0 flex items-center gap-2">
            <span class="hidden sm:inline-flex items-center h-9 px-3 rounded-[9px] border-[1.5px] border-[var(--brand-border-fade)] bg-[var(--brand-canvas)] text-[12.5px] font-semibold text-[var(--brand-text-secondary)] max-w-[240px] truncate">
              {{ refLink(m) }}
            </span>
            <button
              type="button"
              class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center border-[1.5px] border-[var(--brand-border-fade)] bg-white text-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] transition"
              :aria-label="`Copy referral link for ${m.name}`"
              @click="copyRef(m)"
            >
              <Check v-if="copiedRef === m.id" class="w-4 h-4" stroke-width="2.2" />
              <Copy v-else class="w-4 h-4" stroke-width="1.7" />
            </button>
          </div>

          <!-- Random: unlimited on/off toggle -->
          <label v-else class="inline-flex items-center cursor-pointer shrink-0 gap-2">
            <span
              class="relative inline-flex w-[38px] h-[22px] rounded-full transition-colors"
              :style="{ background: isUnlimited(m.id) ? 'var(--brand-teal)' : 'var(--brand-border)' }"
            >
              <span
                class="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-[0_1px_2px_rgba(0,20,18,0.25)] transition-[left]"
                :style="{ left: isUnlimited(m.id) ? '18px' : '2px' }"
              />
            </span>
            <input
              :checked="isUnlimited(m.id)"
              type="checkbox"
              class="sr-only"
              :aria-label="`Unlimited capacity for ${m.name}`"
              @change="toggleUnlimited(m.id)"
            >
            <span class="text-[13px] font-bold text-[var(--brand-text-secondary)]">Unlimited</span>
          </label>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2.5 mt-5 pt-4 border-t border-[var(--brand-border-fade)]">
        <BrandButton variant="outline" :disabled="!firstUnaddedMember()" @click="openMemberModal(firstUnaddedMember()!)">
          <UserPlus class="w-3.5 h-3.5 mr-1.5" stroke-width="1.8" />
          Add Team Member
        </BrandButton>
        <button
          class="px-6 h-10 rounded-[9px] text-[13.5px] font-bold bg-[var(--brand-lime)] text-[var(--brand-teal)] hover:brightness-95 transition"
          :disabled="saveState === 'saving'"
          @click="save"
        >
          {{ saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save' }}
        </button>
      </div>
    </div>
    </section>

    <!-- Add-member config modal (Role + stage visibility) -->
    <JobTeamMemberModal v-model:open="memberModalOpen" :member="pendingMember" @save="onMemberSave" />
  </div>
</template>
