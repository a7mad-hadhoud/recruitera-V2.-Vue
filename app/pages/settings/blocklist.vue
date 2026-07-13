<script setup lang="ts">
import { TableCell, TableHead, TableRow } from '~/components/ui/table'
import { Download, Plus, Upload, XCircle } from 'lucide-vue-next'
import { useBlocklist } from '~/composables/useBlocklist'
import { BrandButton } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsTable from '~/components/settings/SettingsTable.vue'
import SettingsTableSkeleton from '~/components/settings/SettingsTableSkeleton.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import type { BlocklistEntry } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useBlocklist()

const entries = ref<BlocklistEntry[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    entries.value = v.data.map(e => ({ ...e }))
    seeded.value = true
  }
}, { immediate: true })

const total = computed(() => entries.value.length)
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return entries.value
  return entries.value.filter(e =>
    e.name.toLowerCase().includes(q)
    || (e.email ?? '').toLowerCase().includes(q),
  )
})

// ─────────────── Add to blocklist modal ───────────────
const modalOpen = ref(false)
const form = reactive({ name: '', email: '', nationalId: '', reason: '' })

function openAddModal() {
  form.name = ''
  form.email = ''
  form.nationalId = ''
  form.reason = ''
  modalOpen.value = true
}

function saveModal() {
  if (!form.name.trim()) return

  entries.value.unshift({
    id: `bl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: form.name.trim(),
    email: form.email.trim() || null,
    nationalId: form.nationalId.trim() || null,
    reason: form.reason.trim() || '—',
    blockedOn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  })
  modalOpen.value = false
}

// ─────────────── Remove (direct, matches ground truth — no gating) ───────────────
function removeEntry(entry: BlocklistEntry) {
  entries.value = entries.value.filter(e => e.id !== entry.id)
}

// ─────────────── Bulk upload ───────────────
const bulkModalOpen = ref(false)
const bulkFileName = ref('')

function downloadTemplate() {
  const csv = 'Candidate name,Email,National ID,Reason\nAhmed Karim,ahmed.karim@example.com,29501234567890,Misconduct during interview\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'blocklist-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function onBulkFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  bulkFileName.value = file?.name ?? ''
}

function closeBulkModal() {
  bulkModalOpen.value = false
  bulkFileName.value = ''
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Candidate Blocklist"
      subtitle="Candidates on this list are blocked from applying to any job in your organization."
      learn-more-href="#"
    />

    <SettingsTable
      search-placeholder="Search by name or email"
      item-label="candidates"
      :total="total"
      :filtered-count="filtered.length"
      :loading="isLoading"
      :empty="!isLoading && !filtered.length"
      empty-message="No candidates match."
      :colspan="6"
      @update:search="v => search = v"
    >
      <template #actions>
        <BrandButton variant="primary-teal" @click="openAddModal">
          <Plus class="w-4 h-4 mr-1" />
          Add to blocklist
        </BrandButton>
        <BrandButton variant="outline" @click="bulkModalOpen = true">
          <Upload class="w-4 h-4 mr-1" />
          Bulk upload
        </BrandButton>
      </template>
      <template #header>
        <TableRow class="bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)]">
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Candidate</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Email</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">National ID</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Reason</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Blocked on</TableHead>
          <TableHead class="py-[14px] px-5 text-right text-[13px] font-semibold text-[var(--brand-nav-text)]">Actions</TableHead>
        </TableRow>
      </template>

      <SettingsTableSkeleton v-if="isLoading" :columns="6" :rows="6" />
      <TableRow
        v-for="(entry, i) in filtered"
        v-else
        :key="entry.id"
        class="border-b border-[var(--brand-border-row)] last:border-0"
        :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
      >
        <TableCell class="py-[11px] px-5 font-semibold text-[14px] text-[var(--brand-text)] border-r border-[var(--brand-border-hairline)]">{{ entry.name }}</TableCell>
        <TableCell class="py-[11px] px-5 text-[13.5px] text-[var(--brand-text-muted)] border-r border-[var(--brand-border-hairline)]">{{ entry.email ?? '—' }}</TableCell>
        <TableCell class="py-[11px] px-5 text-[13.5px] text-[var(--brand-text-muted)] border-r border-[var(--brand-border-hairline)]">{{ entry.nationalId ?? '—' }}</TableCell>
        <TableCell class="py-[11px] px-5 text-[13.5px] text-[var(--brand-text-muted)] border-r border-[var(--brand-border-hairline)]">{{ entry.reason }}</TableCell>
        <TableCell class="py-[11px] px-5 text-[13.5px] text-[var(--brand-text-muted)] border-r border-[var(--brand-border-hairline)]">{{ entry.blockedOn }}</TableCell>
        <TableCell class="py-[11px] px-5 text-right">
          <div class="flex justify-end">
            <button
              class="inline-flex items-center gap-[5px] px-3 py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-settings-danger)] text-[13px] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors"
              @click="removeEntry(entry)"
            >
              <XCircle class="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </TableCell>
      </TableRow>
    </SettingsTable>

    <SettingsFormModal
      v-model="modalOpen"
      title="Add to blocklist"
      width="500px"
    >
      <div class="mb-[18px]">
        <label class="flex items-center gap-1 text-[14px] font-bold text-[var(--brand-text)] mb-2.5">
          Candidate name <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Full name"
          class="w-full box-border px-4 py-[13px] rounded-[14px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
      </div>

      <div class="grid grid-cols-2 gap-3.5 mb-[18px]">
        <div>
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2.5">
            Email <span class="font-normal text-[var(--brand-text-quiet)]">(Optional)</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="candidate@email.com"
            class="w-full box-border px-4 py-[13px] rounded-[14px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
          >
        </div>
        <div>
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2.5">
            National ID <span class="font-normal text-[var(--brand-text-quiet)]">(Optional)</span>
          </label>
          <input
            v-model="form.nationalId"
            type="text"
            placeholder="e.g. 29501234567890"
            class="w-full box-border px-4 py-[13px] rounded-[14px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
          >
        </div>
      </div>

      <div class="mb-1">
        <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2.5">
          Reason <span class="font-normal text-[var(--brand-text-quiet)]">(Optional)</span>
        </label>
        <textarea
          v-model="form.reason"
          rows="3"
          placeholder="Describe why this candidate is being blocked..."
          class="w-full box-border px-4 py-[13px] rounded-[14px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors resize-y"
        />
      </div>

      <template #footer>
        <BrandButton
          variant="outline"
          size="lg"
          @click="modalOpen = false"
        >
          Cancel
        </BrandButton>
        <BrandButton
          variant="primary-teal"
          size="lg"
          :disabled="!form.name.trim()"
          @click="saveModal"
        >
          Add to blocklist
        </BrandButton>
      </template>
    </SettingsFormModal>

    <SettingsFormModal
      v-model="bulkModalOpen"
      title="Bulk upload blocklist"
      width="480px"
    >
      <p class="text-[13.5px] text-[var(--brand-text-quiet)] mb-6">Upload a CSV file to block multiple candidates at once.</p>

      <button
        type="button"
        class="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--brand-teal)] underline outline-none mb-5"
        @click="downloadTemplate"
      >
        <Download class="w-3.5 h-3.5" />
        Download CSV template
      </button>

      <label class="flex flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-[var(--brand-border-mid)] rounded-[14px] px-4 py-8 text-center cursor-pointer hover:bg-[var(--brand-surface-hover)] transition-colors">
        <Upload class="w-5 h-5 text-[var(--brand-text-muted)]" />
        <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ bulkFileName || 'Choose a CSV file' }}</span>
        <input type="file" accept=".csv" class="hidden" @change="onBulkFileChange">
      </label>

      <template #footer>
        <BrandButton
          variant="outline"
          size="lg"
          @click="closeBulkModal"
        >
          Cancel
        </BrandButton>
        <BrandButton
          variant="primary-teal"
          size="lg"
          :disabled="!bulkFileName"
          @click="closeBulkModal"
        >
          Upload
        </BrandButton>
      </template>
    </SettingsFormModal>
  </div>
</template>
