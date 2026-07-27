<!--
  Sidebar "Share" control. Opens a popover with two tabs:
   • Internally — who the candidate is shared with + "Add team member"
     (opens a team-member picker modal, seeded from useTeamMembers).
   • Externally — "Create new public link" (a share-scope + expiry modal that
     ends on a copyable public URL) and "Add to existing public link".
  All actions are client-only (no share endpoint yet).
-->
<script setup lang="ts">
import { Share2, UserPlus, Link2, Unlink, X, Check, Copy } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'
import { useTeamMembers } from '~/composables/useTeam'
import type { TeamMember } from '~/types'

const props = defineProps<{
  candidateName: string
  candidateInitials: string
  candidateColor?: string
  owner: string
  ownerInitials: string
}>()

const open = ref(false)
const tab = ref<'internally' | 'externally'>('internally')

const { data: teamData } = useTeamMembers()
const roster = computed<TeamMember[]>(() => teamData.value?.data ?? [])

// Internally — team-member picker modal
const teamOpen = ref(false)
const picked = ref<Set<string>>(new Set())
const teamSearch = ref('')
const fRoster = computed(() => {
  const q = teamSearch.value.trim().toLowerCase()
  return roster.value.filter(m => !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
})
function toggleMember(id: string) {
  const next = new Set(picked.value)
  next.has(id) ? next.delete(id) : next.add(id)
  picked.value = next
}
function openTeam() { open.value = false; teamSearch.value = ''; picked.value = new Set(); teamOpen.value = true }

// Externally — public-link modal (form → result)
const linkOpen = ref(false)
const linkStage = ref<'form' | 'result'>('form')
const INFO = [
  { key: 'contact', label: 'Contact information', on: true },
  { key: 'fields', label: 'Profile fields', on: true },
  { key: 'cv', label: 'CV or resume', on: false },
  { key: 'jobstage', label: 'Job name & stage', on: false },
  { key: 'screening', label: 'Screening questions', on: false },
  { key: 'ai', label: 'AI Summary', on: false },
]
const info = ref(INFO.map(i => ({ ...i })))
const linkName = ref('')
const agreed = ref(false)
const warn = ref(false)
const PUBLIC_URL = 'https://app.recruitera.ai/share/mild9uqxju3lvs1749d4kzmh'
const linkCopied = ref(false)
function openNewLink() { open.value = false; info.value = INFO.map(i => ({ ...i })); linkName.value = ''; agreed.value = false; warn.value = false; linkStage.value = 'form'; linkOpen.value = true }
function continueLink() {
  if (!agreed.value) { warn.value = true; return }
  linkStage.value = 'result'
}
async function copyPublic() {
  try { await navigator.clipboard.writeText(PUBLIC_URL) } catch {}
  linkCopied.value = true
  setTimeout(() => (linkCopied.value = false), 1400)
}

// Add to existing public link
const existOpen = ref(false)
function openExisting() { open.value = false; existOpen.value = true }
</script>

<template>
  <!-- Trigger + share popover -->
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <BrandButton variant="primary-lime" size="md">
        <Share2 class="w-4 h-4" stroke-width="1.7" />Share
      </BrandButton>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-[352px] p-[22px] pb-[18px] rounded-2xl">
      <div class="text-[13px] font-bold text-[var(--brand-text)] tracking-[-0.01em] mb-3.5">Share candidate</div>
      <div class="flex gap-4 border-b border-[var(--brand-border-hairline)] mb-3.5">
        <button
          v-for="t in (['internally', 'externally'] as const)"
          :key="t"
          type="button"
          class="relative pb-2.5 text-[13px] capitalize cursor-pointer"
          :class="tab === t ? 'font-bold text-[var(--brand-text)]' : 'font-semibold text-[var(--brand-text-quiet)]'"
          @click="tab = t"
        >
          {{ t }}
          <span v-if="tab === t" class="absolute left-0 right-0 -bottom-px h-[2.5px] rounded bg-[var(--brand-teal)]" />
        </button>
      </div>

      <div v-if="tab === 'internally'" class="flex flex-col gap-2.5">
        <div class="text-[13px] font-bold text-[var(--brand-text)]">Shared with</div>
        <div class="flex items-center gap-3 pb-1.5">
          <span class="w-[38px] h-[38px] shrink-0 rounded-[10px] bg-[var(--brand-lime-tint)] text-[var(--brand-olive)] inline-flex items-center justify-center font-bold text-[13px]">{{ ownerInitials }}</span>
          <div class="min-w-0 flex-1">
            <div class="font-bold text-[13px] text-[var(--brand-text)]">{{ owner }}</div>
            <div class="text-[12px] text-[var(--brand-text-quiet)] truncate">{{ ownerInitials.toLowerCase() }}@recruitera.ai</div>
          </div>
        </div>
        <button type="button" class="flex items-center gap-3.5 border border-[var(--brand-border-light)] rounded-xl px-3.5 py-3.5 cursor-pointer hover:bg-[var(--brand-surface-hover)] text-left" @click="openTeam">
          <span class="w-[38px] h-[38px] shrink-0 rounded-[10px] bg-[var(--brand-lime-tint)] inline-flex items-center justify-center"><UserPlus class="w-5 h-5 text-[var(--brand-teal)]" stroke-width="1.7" /></span>
          <span><span class="block font-bold text-[12.5px] text-[var(--brand-text)]">Add Team Member</span><span class="block text-[12px] text-[var(--brand-text-quiet)] mt-0.5">Allow access to this candidate only</span></span>
        </button>
      </div>

      <div v-else class="flex flex-col gap-2.5">
        <button type="button" class="flex items-center gap-3.5 border border-[var(--brand-border-light)] rounded-xl px-3.5 py-3.5 cursor-pointer hover:bg-[var(--brand-surface-hover)] text-left" @click="openNewLink">
          <span class="w-[38px] h-[38px] shrink-0 rounded-[10px] bg-[var(--brand-lime-tint)] inline-flex items-center justify-center"><Link2 class="w-5 h-5 text-[var(--brand-teal)]" stroke-width="1.7" /></span>
          <span><span class="block font-bold text-[13.5px] text-[var(--brand-text)]">Create new public link</span><span class="block text-[12px] text-[var(--brand-text-quiet)] mt-0.5">Decide what you want to share.</span></span>
        </button>
        <button type="button" class="flex items-center gap-3.5 border border-[var(--brand-border-light)] rounded-xl px-3.5 py-3.5 cursor-pointer hover:bg-[var(--brand-surface-hover)] text-left" @click="openExisting">
          <span class="w-[38px] h-[38px] shrink-0 rounded-[10px] bg-[var(--brand-lime-tint)] inline-flex items-center justify-center"><Unlink class="w-5 h-5 text-[var(--brand-teal)]" stroke-width="1.7" /></span>
          <span><span class="block font-bold text-[13.5px] text-[var(--brand-text)]">Add to existing public link</span><span class="block text-[12px] text-[var(--brand-text-quiet)] mt-0.5">Add this candidate to an already created link.</span></span>
        </button>
      </div>
    </PopoverContent>
  </Popover>

  <!-- Add team member modal -->
  <Dialog v-model:open="teamOpen">
    <DialogScrollContent class="max-w-[560px] p-0 gap-0 overflow-hidden">
      <DialogHeader class="px-[26px] py-[22px] border-b border-[var(--brand-border-hairline)] space-y-1 text-left">
        <DialogTitle class="text-[18px] font-bold text-[var(--brand-text)]">Share candidate</DialogTitle>
        <DialogDescription class="text-[14px] text-[var(--brand-text-secondary)]">Select which team members should have access to {{ candidateName }}.</DialogDescription>
      </DialogHeader>
      <div class="px-[26px] py-5 bg-[var(--brand-canvas)] max-h-[56vh] overflow-y-auto">
        <div class="border border-[var(--brand-border-light)] rounded-[14px] bg-[var(--brand-surface-white)] overflow-hidden">
          <div class="p-3.5">
            <input v-model="teamSearch" type="text" placeholder="Search team members" class="w-full box-border border-[1.6px] border-[var(--brand-border)] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[var(--brand-text)] outline-none focus:border-[var(--brand-lime)]">
          </div>
          <button
            v-for="m in fRoster"
            :key="m.id"
            type="button"
            class="w-full flex items-center gap-3.5 px-4 py-4 border-t border-[var(--brand-border-hairline)] cursor-pointer hover:bg-[var(--brand-surface-hover)] text-left"
            @click="toggleMember(m.id)"
          >
            <span
              class="w-6 h-6 shrink-0 rounded-[7px] border-[1.8px] inline-flex items-center justify-center"
              :class="picked.has(m.id) ? 'bg-[var(--brand-teal)] border-[var(--brand-teal)]' : 'border-[var(--brand-border-mid)]'"
            >
              <Check v-if="picked.has(m.id)" class="w-3.5 h-3.5 text-white" stroke-width="3" />
            </span>
            <BrandAvatarInitials :initials="((m.name.split(' ')[0]?.[0] ?? '') + (m.name.split(' ').slice(-1)[0]?.[0] ?? '')).toUpperCase()" :bg="m.avatarBg" :color="m.avatarText" size="lg" />
            <span class="min-w-0"><span class="block font-bold text-[15px] text-[var(--brand-text)]">{{ m.name }}</span><span class="block text-[13.5px] text-[var(--brand-text-quiet)] truncate">{{ m.email }}</span></span>
          </button>
          <p v-if="!fRoster.length" class="px-4 py-6 text-center text-[13.5px] text-[var(--brand-text-quiet)]">No team members match.</p>
        </div>
      </div>
      <DialogFooter class="px-[26px] py-4 border-t border-[var(--brand-border-hairline)] gap-3 sm:justify-end">
        <BrandButton variant="outline" size="md" @click="teamOpen = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" size="md" :class="{ 'opacity-50 pointer-events-none': !picked.size }" @click="teamOpen = false">Continue<span v-if="picked.size"> ({{ picked.size }})</span></BrandButton>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>

  <!-- Create new public link modal -->
  <Dialog v-model:open="linkOpen">
    <DialogScrollContent class="max-w-[640px] p-0 gap-0 overflow-hidden">
      <DialogHeader class="px-[26px] py-[22px] border-b border-[var(--brand-border-hairline)] bg-[var(--brand-canvas)] space-y-1 text-left">
        <DialogTitle class="text-[20px] font-bold text-[var(--brand-text)] tracking-[-0.01em]">1 Candidate Shared</DialogTitle>
        <DialogDescription class="text-[14px] text-[var(--brand-text-secondary)]">Select what information you want to include before sharing.</DialogDescription>
      </DialogHeader>

      <div v-if="linkStage === 'form'" class="px-[26px] py-6 max-h-[60vh] overflow-y-auto">
        <div class="text-[14px] font-semibold text-[var(--brand-text)] mb-3">Show Information</div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <button
            v-for="c in info"
            :key="c.key"
            type="button"
            class="flex items-center gap-2.5 bg-[var(--brand-canvas)] border border-[var(--brand-border-hairline)] rounded-[10px] px-3.5 py-2.5 cursor-pointer text-left"
            @click="c.on = !c.on"
          >
            <span
              class="w-[22px] h-[22px] shrink-0 rounded-[7px] border-[1.8px] inline-flex items-center justify-center"
              :class="c.on ? 'bg-[var(--brand-lime)] border-[var(--brand-lime)]' : 'bg-white border-[var(--brand-border-mid)]'"
            >
              <Check v-if="c.on" class="w-3 h-3 text-[var(--brand-teal)]" stroke-width="3" />
            </span>
            <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ c.label }}</span>
          </button>
        </div>
        <div class="mb-5">
          <div class="text-[14px] font-semibold text-[var(--brand-text)] mb-2">Create link name</div>
          <input v-model="linkName" type="text" placeholder="e.g. Engineering shortlist" class="w-full box-border border border-[var(--brand-border)] rounded-[10px] px-3.5 py-3 text-[14px] text-[var(--brand-text)] outline-none focus:border-[var(--brand-lime)]">
        </div>
        <button type="button" class="flex items-start gap-3.5 cursor-pointer text-left" @click="agreed = !agreed; agreed && (warn = false)">
          <span
            class="w-[22px] h-[22px] shrink-0 mt-0.5 rounded-[7px] border-[1.8px] inline-flex items-center justify-center"
            :class="agreed ? 'bg-[var(--brand-lime)] border-[var(--brand-lime)]' : 'bg-white border-[var(--brand-border-mid)]'"
          >
            <Check v-if="agreed" class="w-3 h-3 text-[var(--brand-teal)]" stroke-width="3" />
          </span>
          <span>
            <span class="block text-[14px] leading-[1.55] text-[var(--brand-text-secondary)]">By sharing this candidate data, you confirm that you assume full responsibility for the content and its distribution.</span>
            <span v-if="warn" class="block text-[13.5px] font-semibold text-[var(--brand-danger)] mt-2">Please confirm before generating public link.</span>
          </span>
        </button>
      </div>

      <div v-else class="px-[26px] py-6 max-h-[60vh] overflow-y-auto">
        <div class="text-[15px] font-bold text-[var(--brand-text)] mb-2.5">Public Link</div>
        <button type="button" class="w-full flex items-center justify-between gap-3.5 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-xl px-[18px] py-4 cursor-pointer text-left" @click="copyPublic">
          <span class="min-w-0"><span class="block text-[15px] font-bold text-[var(--brand-text)] mb-1">{{ linkCopied ? 'Copied!' : 'Copy Link' }}</span><span class="block text-[14px] text-[var(--brand-text-secondary)] break-all">{{ PUBLIC_URL }}</span></span>
          <span class="w-10 h-10 shrink-0 rounded-[10px] bg-white border border-[var(--brand-border-light)] inline-flex items-center justify-center"><Copy class="w-[18px] h-[18px] text-[var(--brand-olive)]" stroke-width="1.8" /></span>
        </button>
      </div>

      <DialogFooter class="px-[26px] py-4 border-t border-[var(--brand-border-hairline)] gap-3 sm:justify-end">
        <BrandButton variant="outline" size="md" @click="linkOpen = false">{{ linkStage === 'form' ? 'Discard' : 'Done' }}</BrandButton>
        <BrandButton v-if="linkStage === 'form'" variant="primary-teal" size="md" @click="continueLink">Continue</BrandButton>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>

  <!-- Add to existing public link modal -->
  <Dialog v-model:open="existOpen">
    <DialogScrollContent class="max-w-[560px] p-0 gap-0 overflow-hidden">
      <DialogHeader class="px-[26px] py-[22px] border-b border-[var(--brand-border-hairline)] space-y-1 text-left">
        <DialogTitle class="text-[20px] font-bold text-[var(--brand-text)] tracking-[-0.01em]">Add candidate to public link</DialogTitle>
        <DialogDescription class="text-[14px] text-[var(--brand-text-secondary)]">Choose from the list of existing public links.</DialogDescription>
      </DialogHeader>
      <div class="px-[26px] py-[22px] bg-[var(--brand-canvas)]">
        <button type="button" class="w-full flex items-center gap-3.5 border border-[var(--brand-border-light)] rounded-xl bg-[var(--brand-surface-white)] px-4 py-4 cursor-pointer hover:bg-[var(--brand-surface-hover)] text-left">
          <span class="w-6 h-6 shrink-0 rounded-[7px] border-[1.8px] border-[var(--brand-border-mid)]" />
          <span><span class="block font-bold text-[15px] text-[var(--brand-text)]">Engineering shortlist</span><span class="block text-[13.5px] text-[var(--brand-text-quiet)] mt-0.5">just now</span></span>
        </button>
      </div>
      <DialogFooter class="px-[26px] py-4 border-t border-[var(--brand-border-hairline)] gap-3 sm:justify-end">
        <BrandButton variant="outline" size="md" @click="existOpen = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" size="md" @click="existOpen = false">Save</BrandButton>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
