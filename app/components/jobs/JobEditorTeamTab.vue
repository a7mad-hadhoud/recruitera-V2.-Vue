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
import { Search, UserPlus, ClipboardPlus, X, GripVertical, ArrowLeftRight, Users } from 'lucide-vue-next'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'
import { useTeamMembers } from '~/composables/useTeam'
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

const addedMembers = computed<TeamMember[]>(() =>
  roster.value.filter(m => added.value.has(m.id)),
)

function toggleAdd(id: string) {
  const next = new Set(added.value)
  if (next.has(id)) next.delete(id); else next.add(id)
  added.value = next
}

// Per-member capacity — Unlimited (default) or a numeric cap. Numeric
// caps aren't wired to the UI yet; toggle just flips Unlimited on/off.
const capacityUnlimited = ref<Record<string, boolean>>({})
function isUnlimited(id: string) { return capacityUnlimited.value[id] ?? true }
function toggleUnlimited(id: string) {
  capacityUnlimited.value = { ...capacityUnlimited.value, [id]: !isUnlimited(id) }
}

// Auto-distribute + distribution mode state
const autoDistribute = ref(true)
type DistMode = 'random' | 'sequential'
const distMode = ref<DistMode>('random')

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
  <div class="max-w-[960px] mx-auto p-6 flex flex-col gap-4">
    <!-- Two-column card: picker (left) + added zone (right) -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] overflow-hidden">
      <div class="grid grid-cols-2 min-h-[380px] divide-x divide-[var(--brand-border-fade)]">
        <!-- LEFT: search + roster -->
        <div class="flex flex-col">
          <div class="p-3.5">
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
              class="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--brand-border-fade)] last:border-b-0"
            >
              <BrandAvatarInitials
                :initials="initialsFor(m.name)"
                :bg="m.avatarBg"
                :color="m.avatarText"
                size="md"
              />
              <div class="flex-1 min-w-0">
                <div class="text-[13.5px] font-bold text-[var(--brand-text)] truncate">{{ m.name }}</div>
                <div class="text-[12px] text-[var(--brand-text-quiet)] truncate">{{ m.email }}</div>
              </div>
              <button
                v-if="!added.has(m.id)"
                type="button"
                class="text-[13px] font-bold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] px-2 py-1 rounded-md hover:bg-[var(--brand-canvas)] transition"
                @click="toggleAdd(m.id)"
              >Add</button>
              <span
                v-else
                class="text-[12px] font-semibold text-[var(--brand-text-quiet)]"
              >Added</span>
            </div>
          </div>
          <div class="p-3.5 border-t border-[var(--brand-border-fade)]">
            <button class="w-full inline-flex items-center justify-center gap-2 h-10 rounded-[9px] border-[1.5px] border-dashed border-[var(--brand-border)] bg-transparent text-[13.5px] font-bold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] transition">
              <UserPlus class="w-4 h-4" stroke-width="1.8" />
              Add Team Member
            </button>
          </div>
        </div>

        <!-- RIGHT: dropzone + added -->
        <div class="flex flex-col p-4 gap-4">
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
                    <span class="font-normal text-[var(--brand-text-quiet)]">— {{ m.role }}</span>
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

    <!-- Auto-Distribute Candidates -->
    <div class="flex items-center gap-4 py-4 border-b border-[var(--brand-border-fade)]">
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
    <section v-if="autoDistribute" class="mb-2">
      <div class="flex items-center gap-2.5 mb-3">
        <Users class="w-5 h-5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
        <h2 class="text-[16px] font-bold text-[var(--brand-text)]">Candidate Distribution</h2>
      </div>

      <div class="text-[13px] text-[var(--brand-text-secondary)] mb-2">Distribution Mode</div>
      <div class="grid grid-cols-2 gap-3 mb-3.5">
        <button
          type="button"
          class="text-left rounded-[10px] border-[1.5px] p-4 transition"
          :class="distMode === 'random'
            ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]'
            : 'border-[var(--brand-border)] bg-white hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]'"
          @click="distMode = 'random'"
        >
          <div class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">Random Distribution</div>
          <div class="text-[12.5px] text-[var(--brand-text-quiet)]">Randomly assign candidates evenly across the team.</div>
        </button>
        <button
          type="button"
          class="text-left rounded-[10px] border-[1.5px] p-4 transition"
          :class="distMode === 'sequential'
            ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]'
            : 'border-[var(--brand-border)] bg-white hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)]'"
          @click="distMode = 'sequential'"
        >
          <div class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">Sequential Distribution</div>
          <div class="text-[12.5px] text-[var(--brand-text-quiet)]">Assigned in sequence based on recruiter order.</div>
        </button>
      </div>

      <div class="text-[13px] text-[var(--brand-text-secondary)] mb-3">
        When using capacity limits, at least one recruiter must be set as unlimited to handle overflow.
      </div>

      <!-- Recruiter capacity list -->
      <div class="flex flex-col gap-2">
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
          <label class="inline-flex items-center cursor-pointer shrink-0 gap-2">
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
        <BrandButton variant="outline">
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
    </section>
  </div>
</template>
