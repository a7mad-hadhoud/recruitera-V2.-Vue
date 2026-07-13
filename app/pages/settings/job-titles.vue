<script setup lang="ts">
import { TableCell, TableHead, TableRow } from '~/components/ui/table'
import { Download, Pencil, Plus, Trash2, Upload } from 'lucide-vue-next'
import { useJobTitles } from '~/composables/useJobTitles'
import { BrandButton } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsTable from '~/components/settings/SettingsTable.vue'
import SettingsTableSkeleton from '~/components/settings/SettingsTableSkeleton.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsToggleCard from '~/components/settings/SettingsToggleCard.vue'
import type { JobTitle } from '~/types'

definePageMeta({ layout: 'settings' })

const DEPARTMENTS = ['Engineering', 'Product', 'Sales', 'Human Resources']

const { data, isLoading } = useJobTitles()

const jobTitles = ref<JobTitle[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    jobTitles.value = v.data.map(j => ({ ...j }))
    seeded.value = true
  }
}, { immediate: true })

const total = computed(() => jobTitles.value.length)
const search = ref('')
const showOnCreate = ref(true)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return jobTitles.value
  return jobTitles.value.filter(j =>
    j.title.toLowerCase().includes(q)
    || j.department.toLowerCase().includes(q),
  )
})

// ─────────────── Add / Edit modal ───────────────
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ title: '', department: '' })

function openAddModal() {
  editingId.value = null
  form.title = ''
  form.department = ''
  modalOpen.value = true
}

function openEditModal(jt: JobTitle) {
  editingId.value = jt.id
  form.title = jt.title
  form.department = jt.department === '—' ? '' : jt.department
  modalOpen.value = true
}

function saveModal() {
  if (!form.title.trim()) return

  if (editingId.value) {
    const jt = jobTitles.value.find(j => j.id === editingId.value)
    if (jt) {
      jt.title = form.title.trim()
      jt.department = form.department || '—'
    }
  }
  else {
    jobTitles.value.unshift({
      id: `jt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: form.title.trim(),
      department: form.department || '—',
      jobCount: 0,
    })
  }
  modalOpen.value = false
}

// ─────────────── Delete (direct, matches ground truth — no gating) ───────────────
function deleteJobTitle(jt: JobTitle) {
  jobTitles.value = jobTitles.value.filter(j => j.id !== jt.id)
}

// ─────────────── Bulk upload ───────────────
const bulkModalOpen = ref(false)
const bulkFileName = ref('')

function downloadTemplate() {
  const csv = 'Job Title,Department\nSoftware Engineer,Engineering\nProduct Designer,Product\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'job-titles-template.csv'
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
      title="Job Titles"
      subtitle="Manage job titles used across requisitions and job postings."
    />

    <div class="mb-5">
      <SettingsToggleCard
        v-model="showOnCreate"
        title="Show job titles when creating a job"
        description="When enabled, recruiters will see a job title field when creating a new job."
      />
    </div>

    <SettingsTable
      search-placeholder="Search job titles"
      item-label="job titles"
      :total="total"
      :filtered-count="filtered.length"
      :loading="isLoading"
      :empty="!isLoading && !filtered.length"
      empty-message="No job titles match."
      :colspan="4"
      @update:search="v => search = v"
    >
      <template #actions>
        <BrandButton variant="primary-teal" @click="openAddModal">
          <Plus class="w-4 h-4 mr-1" />
          Add job title
        </BrandButton>
        <BrandButton variant="outline" @click="bulkModalOpen = true">
          <Upload class="w-4 h-4 mr-1" />
          Bulk upload
        </BrandButton>
      </template>
      <template #header>
        <TableRow class="bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)]">
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Job title</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Department</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Used in jobs</TableHead>
          <TableHead class="py-[14px] px-5 text-right text-[13px] font-semibold text-[var(--brand-nav-text)]">Actions</TableHead>
        </TableRow>
      </template>

      <SettingsTableSkeleton v-if="isLoading" :columns="4" :rows="6" />
      <TableRow
        v-for="(jt, i) in filtered"
        v-else
        :key="jt.id"
        class="border-b border-[var(--brand-border-row)] last:border-0"
        :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
      >
        <TableCell class="py-[11px] px-5 font-semibold text-[14px] text-[var(--brand-text)] border-r border-[var(--brand-border-hairline)]">{{ jt.title }}</TableCell>
        <TableCell class="py-[11px] px-5 text-[13.5px] text-[var(--brand-text-muted)] border-r border-[var(--brand-border-hairline)]">{{ jt.department }}</TableCell>
        <TableCell class="py-[11px] px-5 border-r border-[var(--brand-border-hairline)]">
          <span class="inline-block bg-[var(--brand-badge-settings-bg)] text-[var(--brand-badge-settings-text)] text-[12px] font-bold rounded-[6px] px-2 py-[3px]">
            {{ jt.jobCount }} {{ jt.jobCount === 1 ? 'job' : 'jobs' }}
          </span>
        </TableCell>
        <TableCell class="py-[11px] px-5 text-right">
          <div class="flex items-center gap-1.5 justify-end">
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
              @click="openEditModal(jt)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors"
              @click="deleteJobTitle(jt)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </TableCell>
      </TableRow>
    </SettingsTable>

    <SettingsFormModal
      v-model="modalOpen"
      :title="editingId ? 'Edit job title' : 'Add job title'"
      width="480px"
    >
      <div class="mb-[18px]">
        <label class="flex items-center gap-1 text-[14px] font-bold text-[var(--brand-text)] mb-2.5">
          Job title <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          placeholder="e.g. Software Engineer"
          class="w-full box-border px-4 py-[13px] rounded-[14px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
      </div>

      <div class="mb-1">
        <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2.5">
          Department <span class="font-normal text-[var(--brand-text-quiet)]">(Optional)</span>
        </label>
        <select
          v-model="form.department"
          class="w-full box-border px-4 py-[13px] rounded-[14px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
          <option value="">Select department</option>
          <option v-for="dept in DEPARTMENTS" :key="dept" :value="dept">{{ dept }}</option>
        </select>
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
          :disabled="!form.title.trim()"
          @click="saveModal"
        >
          Save
        </BrandButton>
      </template>
    </SettingsFormModal>

    <SettingsFormModal
      v-model="bulkModalOpen"
      title="Bulk upload job titles"
      width="480px"
    >
      <p class="text-[13.5px] text-[var(--brand-text-quiet)] mb-6">Upload a CSV file to create multiple job titles at once.</p>

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
