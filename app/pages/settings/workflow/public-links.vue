<script setup lang="ts">
import { TableCell, TableHead, TableRow } from '~/components/ui/table'
import { Check, Copy, ExternalLink, Eye, Pencil, Plus, Share2, Trash2, X } from 'lucide-vue-next'
import { usePublicLinks } from '~/composables/usePublicLinks'
import { BrandButton, BrandStatusBadge } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsTable from '~/components/settings/SettingsTable.vue'
import SettingsTableSkeleton from '~/components/settings/SettingsTableSkeleton.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import type { PublicLink } from '~/types'

definePageMeta({ layout: 'settings' })

const SHOW_INFO_OPTIONS = [
  { key: 'contact', label: 'Contact information' },
  { key: 'profile', label: 'Profile fields' },
  { key: 'cv', label: 'CV or resume' },
  { key: 'notes', label: 'Notes' },
]

const ALLOW_OPTIONS = [
  { key: 'notes', label: 'Add notes' },
  { key: 'evaluation', label: 'Add evaluation' },
  { key: 'files', label: 'Upload files' },
]

const { data, isLoading } = usePublicLinks()

const links = ref<PublicLink[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    links.value = v.data.map(l => ({ ...l, candidates: [...l.candidates], showInfo: [...l.showInfo], allow: [...l.allow] }))
    seeded.value = true
  }
}, { immediate: true })

const total = computed(() => links.value.length)
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return links.value
  return links.value.filter(l => l.name.toLowerCase().includes(q))
})

function statusFor(link: PublicLink) {
  if (!link.expiresOn) return { label: 'No expiry', tone: 'live' as const }
  const diffDays = Math.ceil((new Date(link.expiresOn).getTime() - Date.now()) / 86400000)
  if (diffDays <= 0) return { label: 'Expired', tone: 'expired' as const }
  const months = Math.max(1, Math.round(diffDays / 30))
  return { label: `Active (${months}mo)`, tone: 'live' as const }
}

function shareUrl(id: string) {
  return `https://icareer.recruitera.ai/v/share/${id}`
}

// ─────────────── Edit / Share modal (mirrors the ground-truth 2-tab popup) ───────────────
const modalOpen = ref(false)
const modalTab = ref<'edit' | 'share'>('edit')
const editingId = ref<string | null>(null)
const isCreating = ref(false)
const form = reactive({ name: '', expiresOn: '', showInfo: ['contact', 'profile', 'cv'] as string[], allow: ['notes'] as string[] })
const candidateInput = ref('')
const candidates = ref<string[]>([])
const emailInput = ref('')

function resetForm() {
  form.name = ''
  form.expiresOn = ''
  form.showInfo = ['contact', 'profile', 'cv']
  form.allow = ['notes']
  candidates.value = []
  candidateInput.value = ''
  emailInput.value = ''
}

function openCreateModal() {
  editingId.value = null
  isCreating.value = true
  modalTab.value = 'edit'
  resetForm()
  modalOpen.value = true
}

function openEditModal(link: PublicLink) {
  editingId.value = link.id
  isCreating.value = false
  modalTab.value = 'edit'
  form.name = link.name
  form.expiresOn = link.expiresOn ?? ''
  form.showInfo = [...link.showInfo]
  form.allow = [...link.allow]
  candidates.value = [...link.candidates]
  candidateInput.value = ''
  emailInput.value = ''
  modalOpen.value = true
}

function openShareModal(link: PublicLink) {
  openEditModal(link)
  modalTab.value = 'share'
}

function openLink(id: string) {
  window.open(shareUrl(id), '_blank')
}

function addCandidate() {
  const v = candidateInput.value.trim()
  if (v && !candidates.value.includes(v)) candidates.value.push(v)
  candidateInput.value = ''
}

function removeCandidate(name: string) {
  candidates.value = candidates.value.filter(c => c !== name)
}

function persistForm() {
  const name = form.name.trim() || (candidates.value.length ? candidates.value.join(', ') : 'No candidates shared')

  if (editingId.value) {
    const link = links.value.find(l => l.id === editingId.value)
    if (link) {
      link.name = name
      link.candidates = [...candidates.value]
      link.expiresOn = form.expiresOn || null
      link.showInfo = [...form.showInfo]
      link.allow = [...form.allow]
    }
    return editingId.value
  }

  const id = `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  links.value.unshift({
    id,
    name,
    candidates: [...candidates.value],
    expiresOn: form.expiresOn || null,
    guestReviews: 0,
    guestTeamNotes: 0,
    showInfo: [...form.showInfo],
    allow: [...form.allow],
  })
  return id
}

function continueToShare() {
  const id = persistForm()
  editingId.value = id
  isCreating.value = false
  modalTab.value = 'share'
}

function saveEdit() {
  persistForm()
  modalOpen.value = false
}

function saveShare() {
  modalOpen.value = false
}

function deleteFromModal() {
  if (editingId.value) links.value = links.value.filter(l => l.id !== editingId.value)
  modalOpen.value = false
}

// ─────────────── Delete (direct, row action) ───────────────
function deleteLink(link: PublicLink) {
  links.value = links.value.filter(l => l.id !== link.id)
}

// ─────────────── Copy link ───────────────
const copiedId = ref<string | null>(null)

async function copyLink(id: string) {
  try {
    await navigator.clipboard.writeText(shareUrl(id))
  }
  catch {
    // clipboard API unavailable in this environment — the URL is still visible next to the button
  }
  copiedId.value = id
  setTimeout(() => { if (copiedId.value === id) copiedId.value = null }, 1600)
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Public links to candidates"
      subtitle="Manage shareable links giving external reviewers access to candidate profiles."
    />

    <SettingsTable
      search-placeholder="Search public links"
      item-label="public links"
      :total="total"
      :filtered-count="filtered.length"
      :loading="isLoading"
      :empty="!isLoading && !filtered.length"
      empty-message="No public links match."
      :colspan="5"
      @update:search="v => search = v"
    >
      <template #actions>
        <BrandButton variant="primary-teal" @click="openCreateModal">
          <Plus class="w-4 h-4 mr-1" />
          New public link
        </BrandButton>
      </template>
      <template #header>
        <TableRow class="bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)]">
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Name</TableHead>
          <TableHead class="py-[14px] px-4 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Status</TableHead>
          <TableHead class="py-[14px] px-4 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Candidates</TableHead>
          <TableHead class="py-[14px] px-4 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Guest reviews</TableHead>
          <TableHead class="py-[14px] px-4 text-right text-[13px] font-semibold text-[var(--brand-nav-text)]">Actions</TableHead>
        </TableRow>
      </template>

      <SettingsTableSkeleton v-if="isLoading" :columns="5" :rows="4" />
      <TableRow
        v-for="(link, i) in filtered"
        v-else
        :key="link.id"
        class="border-b border-[var(--brand-border-row)] last:border-0"
        :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
      >
        <TableCell class="py-[11px] px-5 text-[13.5px] font-medium text-[var(--brand-text)] border-r border-[var(--brand-border-hairline)]">{{ link.name }}</TableCell>
        <TableCell class="py-[11px] px-4 border-r border-[var(--brand-border-hairline)]">
          <BrandStatusBadge variant="dot" plain-label :label="statusFor(link).label" :tone="statusFor(link).tone" />
        </TableCell>
        <TableCell class="py-[11px] px-4 text-[13.5px] text-[var(--brand-text)] border-r border-[var(--brand-border-hairline)]">{{ link.candidates.length }}</TableCell>
        <TableCell class="py-[11px] px-4 text-[13.5px] text-[var(--brand-text)] border-r border-[var(--brand-border-hairline)]">{{ link.guestReviews }}</TableCell>
        <TableCell class="py-[11px] px-4 text-right">
          <div class="flex items-center gap-1.5 justify-end">
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
              title="Open"
              @click="openLink(link.id)"
            >
              <ExternalLink class="w-3.5 h-3.5" />
            </button>
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
              title="Share"
              @click="openShareModal(link)"
            >
              <Share2 class="w-3.5 h-3.5" />
            </button>
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
              title="Edit"
              @click="openEditModal(link)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors"
              title="Delete"
              @click="deleteLink(link)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </TableCell>
      </TableRow>
    </SettingsTable>

    <SettingsFormModal
      v-model="modalOpen"
      :title="isCreating ? 'Share candidates' : `${candidates.length} candidate${candidates.length === 1 ? '' : 's'} shared`"
      width="600px"
    >
      <!-- tabs (only once a link exists — matches ground truth's post-create Edit/Share modal) -->
      <div v-if="!isCreating" class="flex gap-5 border-b border-[var(--brand-border-light)] -mt-2 mb-5">
        <button
          type="button"
          class="pb-2.5 text-[13.5px] font-semibold outline-none border-b-2 -mb-px transition-colors"
          :class="modalTab === 'edit' ? 'text-[var(--brand-text)] border-[var(--brand-teal)]' : 'text-[var(--brand-text-quiet)] border-transparent'"
          @click="modalTab = 'edit'"
        >
          Edit
        </button>
        <button
          type="button"
          class="pb-2.5 text-[13.5px] font-semibold outline-none border-b-2 -mb-px transition-colors"
          :class="modalTab === 'share' ? 'text-[var(--brand-text)] border-[var(--brand-teal)]' : 'text-[var(--brand-text-quiet)] border-transparent'"
          @click="modalTab = 'share'"
        >
          Share
        </button>
      </div>

      <!-- Edit tab -->
      <template v-if="modalTab === 'edit'">
        <div class="mb-5">
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">Candidates</label>
          <div v-if="candidates.length" class="flex flex-wrap gap-2 mb-2.5">
            <span
              v-for="c in candidates"
              :key="c"
              class="inline-flex items-center gap-1.5 bg-[var(--brand-surface-badge)] text-[var(--brand-text)] text-[13px] font-semibold rounded-full pl-3 pr-2 py-1.5"
            >
              {{ c }}
              <button type="button" class="text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] outline-none" @click="removeCandidate(c)">
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="candidateInput"
              type="text"
              placeholder="Type a candidate name and press Enter"
              class="flex-1 px-3.5 py-[11px] rounded-[12px] border-[1.5px] border-[var(--brand-border)] text-[13.5px] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
              @keyup.enter="addCandidate"
            >
            <BrandButton variant="primary-teal" class="rounded-[12px] py-[11px] h-auto whitespace-nowrap" @click="addCandidate">Add</BrandButton>
          </div>
        </div>

        <div class="mb-5">
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2.5">Show information</label>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="opt in SHOW_INFO_OPTIONS"
              :key="opt.key"
              class="flex items-center gap-2 border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2.5 text-[13px] text-[var(--brand-text)] cursor-pointer"
            >
              <input v-model="form.showInfo" type="checkbox" :value="opt.key" class="w-3.5 h-3.5 accent-[var(--brand-teal)]">
              {{ opt.label }}
            </label>
          </div>
        </div>

        <div class="mb-5">
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2.5">Allow people with the link to</label>
          <div class="grid grid-cols-3 gap-2">
            <label
              v-for="opt in ALLOW_OPTIONS"
              :key="opt.key"
              class="flex items-center gap-2 border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2.5 text-[13px] text-[var(--brand-text)] cursor-pointer"
            >
              <input v-model="form.allow" type="checkbox" :value="opt.key" class="w-3.5 h-3.5 accent-[var(--brand-teal)]">
              {{ opt.label }}
            </label>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3.5 mb-1">
          <div>
            <div class="flex items-center gap-1.5 mb-2">
              <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">Link name</span>
              <span class="text-[10px] font-bold bg-[var(--brand-badge-settings-bg)] text-[var(--brand-badge-settings-text)] px-[7px] py-[2px] rounded-[5px] tracking-[0.02em]">OPTIONAL</span>
            </div>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Shortlist for Sarah"
              class="w-full box-border px-3 py-2.5 rounded-[9px] border border-[var(--brand-border)] text-[13px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] focus:border-[var(--brand-teal)] transition-colors"
            >
          </div>
          <div>
            <div class="text-[13.5px] font-semibold text-[var(--brand-text)] mb-2">Link expires on</div>
            <input
              v-model="form.expiresOn"
              type="date"
              class="w-full box-border px-3 py-2.5 rounded-[9px] border border-[var(--brand-border)] text-[13px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] focus:border-[var(--brand-teal)] transition-colors"
            >
          </div>
        </div>
      </template>

      <!-- Share tab -->
      <template v-else-if="editingId">
        <div class="mb-5">
          <div class="text-[13.5px] font-semibold text-[var(--brand-text)] mb-2">Public link</div>
          <div class="flex items-center gap-2 border border-[var(--brand-border)] rounded-[10px] px-3.5 py-2.5 bg-[var(--brand-canvas)]">
            <span class="flex-1 text-[13px] text-[var(--brand-text)] break-all">{{ shareUrl(editingId) }}</span>
            <BrandButton variant="primary-teal" size="sm" class="shrink-0 gap-1.5" @click="copyLink(editingId)">
              <Check v-if="copiedId === editingId" class="w-3.5 h-3.5" />
              <Copy v-else class="w-3.5 h-3.5" />
              {{ copiedId === editingId ? 'Copied' : 'Copy' }}
            </BrandButton>
          </div>
        </div>

        <div>
          <div class="text-[13.5px] font-semibold text-[var(--brand-text)] mb-2">Send link via email</div>
          <textarea
            v-model="emailInput"
            rows="3"
            placeholder="john@example.com, anna@example.com"
            class="w-full box-border px-3.5 py-2.5 rounded-[10px] border border-[var(--brand-border)] text-[13px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] focus:border-[var(--brand-teal)] transition-colors resize-y"
          />
        </div>
      </template>

      <template #footer>
        <template v-if="modalTab === 'edit'">
          <BrandButton variant="ghost" @click="modalOpen = false">Cancel</BrandButton>
          <BrandButton variant="primary-teal" @click="isCreating ? continueToShare() : saveEdit()">
            {{ isCreating ? 'Continue' : 'Save changes' }}
          </BrandButton>
        </template>
        <template v-else>
          <BrandButton variant="danger-ghost" size="sm" class="gap-1.5" @click="deleteFromModal">
            <Trash2 class="w-3.5 h-3.5" />
            Delete
          </BrandButton>
          <BrandButton variant="ghost" size="sm" class="gap-1.5 ml-3.5" @click="editingId && openLink(editingId)">
            <Eye class="w-3.5 h-3.5" />
            Preview
          </BrandButton>
          <div class="flex-1" />
          <BrandButton variant="primary-teal" @click="saveShare">Save</BrandButton>
        </template>
      </template>
    </SettingsFormModal>
  </div>
</template>
