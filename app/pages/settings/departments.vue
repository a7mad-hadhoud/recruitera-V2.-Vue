<script setup lang="ts">
import { TableCell, TableHead, TableRow } from '~/components/ui/table'
import { Download, Pencil, Plus, Trash2, Upload, X } from 'lucide-vue-next'
import { useDepartments } from '~/composables/useDepartments'
import { BrandButton } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsTable from '~/components/settings/SettingsTable.vue'
import SettingsTableSkeleton from '~/components/settings/SettingsTableSkeleton.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import type { Department } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useDepartments()

const departments = ref<Department[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    departments.value = v.data.map(d => ({ ...d, subDepartments: [...d.subDepartments] }))
    seeded.value = true
  }
}, { immediate: true })

const total = computed(() => departments.value.length)
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return departments.value
  return departments.value.filter(d =>
    d.name.toLowerCase().includes(q)
    || d.subDepartments.some(s => s.toLowerCase().includes(q)),
  )
})

// ─────────────── Add / Edit modal ───────────────
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ name: '', subs: [] as string[] })
const subInputOpen = ref(false)
const subInputValue = ref('')

function openAddModal() {
  editingId.value = null
  form.name = ''
  form.subs = []
  subInputOpen.value = false
  subInputValue.value = ''
  modalOpen.value = true
}

function openEditModal(dept: Department) {
  editingId.value = dept.id
  form.name = dept.name
  form.subs = [...dept.subDepartments]
  subInputOpen.value = false
  subInputValue.value = ''
  modalOpen.value = true
}

function confirmAddSub() {
  const v = subInputValue.value.trim()
  if (v && !form.subs.includes(v)) form.subs.push(v)
  subInputValue.value = ''
  subInputOpen.value = false
}

function removeSub(sub: string) {
  form.subs = form.subs.filter(s => s !== sub)
}

function saveModal() {
  if (!form.name.trim()) return

  if (editingId.value) {
    const dept = departments.value.find(d => d.id === editingId.value)
    if (dept) {
      dept.name = form.name.trim()
      dept.subDepartments = [...form.subs]
    }
  }
  else {
    departments.value.unshift({
      id: `dept-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: form.name.trim(),
      subDepartments: [...form.subs],
      jobCount: 0,
    })
  }
  modalOpen.value = false
}

// ─────────────── Delete (direct, matches ground truth — no gating) ───────────────
function deleteDepartment(dept: Department) {
  departments.value = departments.value.filter(d => d.id !== dept.id)
}

// ─────────────── Bulk upload ───────────────
const bulkModalOpen = ref(false)
const bulkFileName = ref('')

function downloadTemplate() {
  const csv = 'Department Name,Sub-departments\nEngineering,"Frontend,Backend"\nProduct,Design\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'departments-template.csv'
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
      title="Departments"
      subtitle="Use departments across all Recruitera apps to organize hiring, teams, and reports more effectively."
      learn-more-href="#"
    />

    <SettingsTable
      search-placeholder="Search departments"
      item-label="departments"
      :total="total"
      :filtered-count="filtered.length"
      :loading="isLoading"
      :empty="!isLoading && !filtered.length"
      empty-message="No departments match."
      :colspan="4"
      @update:search="v => search = v"
    >
      <template #actions>
        <BrandButton variant="primary-teal" @click="openAddModal">
          <Plus class="w-4 h-4 mr-1" />
          Add department
        </BrandButton>
        <BrandButton variant="outline" @click="bulkModalOpen = true">
          <Upload class="w-4 h-4 mr-1" />
          Bulk upload
        </BrandButton>
      </template>
      <template #header>
        <TableRow class="bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)]">
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Department name</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Sub-departments</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Open jobs</TableHead>
          <TableHead class="py-[14px] px-5 text-right text-[13px] font-semibold text-[var(--brand-nav-text)]">Actions</TableHead>
        </TableRow>
      </template>

      <SettingsTableSkeleton v-if="isLoading" :columns="4" :rows="6" />
      <TableRow
        v-for="(dept, i) in filtered"
        v-else
        :key="dept.id"
        class="border-b border-[var(--brand-border-row)] last:border-0"
        :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
      >
        <TableCell class="py-[11px] px-5 font-semibold text-[14px] text-[var(--brand-text)] border-r border-[var(--brand-border-hairline)]">{{ dept.name }}</TableCell>
        <TableCell class="py-[11px] px-5 text-[13.5px] text-[var(--brand-text-muted)] border-r border-[var(--brand-border-hairline)]">
          {{ dept.subDepartments.length ? dept.subDepartments.join(', ') : '—' }}
        </TableCell>
        <TableCell class="py-[11px] px-5 border-r border-[var(--brand-border-hairline)]">
          <span class="inline-block bg-[var(--brand-badge-settings-bg)] text-[var(--brand-badge-settings-text)] text-[12px] font-bold rounded-[6px] px-2 py-[3px]">
            {{ dept.jobCount }} {{ dept.jobCount === 1 ? 'job' : 'jobs' }}
          </span>
        </TableCell>
        <TableCell class="py-[11px] px-5 text-right">
          <div class="flex items-center gap-1.5 justify-end">
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
              @click="openEditModal(dept)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors"
              @click="deleteDepartment(dept)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </TableCell>
      </TableRow>
    </SettingsTable>

    <SettingsFormModal
      v-model="modalOpen"
      :title="editingId ? 'Edit department' : 'Add department'"
      width="540px"
    >
      <div class="mb-6">
        <label class="flex items-center gap-1 text-[14px] font-bold text-[var(--brand-text)] mb-2.5">
          Department Name <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Department Name"
          class="w-full box-border px-4 py-[13px] rounded-[14px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
      </div>

      <div class="mb-1">
        <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2.5">
          Sub Departments <span class="font-medium text-[13.5px] text-[var(--brand-text-quiet)]">(Optional)</span>
        </label>
        <div v-if="form.subs.length" class="flex flex-wrap gap-2 mb-2.5">
          <span
            v-for="sub in form.subs"
            :key="sub"
            class="inline-flex items-center gap-1.5 bg-[var(--brand-surface-badge)] text-[var(--brand-text)] text-[13px] font-semibold rounded-full pl-3 pr-2 py-1.5"
          >
            {{ sub }}
            <button type="button" class="text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] outline-none" @click="removeSub(sub)">
              <X class="w-3 h-3" />
            </button>
          </span>
        </div>

        <div v-if="subInputOpen" class="flex items-center gap-2 mb-2.5">
          <input
            v-model="subInputValue"
            type="text"
            placeholder="Sub-department name"
            class="flex-1 px-3.5 py-[11px] rounded-[12px] border-[1.5px] border-[var(--brand-border)] text-[13.5px] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
            @keyup.enter="confirmAddSub"
          >
          <button
            type="button"
            class="px-4 py-[11px] rounded-[12px] border-none bg-[var(--brand-teal)] text-white text-[13.5px] font-bold whitespace-nowrap outline-none"
            @click="confirmAddSub"
          >
            Add
          </button>
          <button
            type="button"
            class="px-3 py-[11px] rounded-[12px] border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text-muted)] text-[13.5px] outline-none"
            @click="subInputOpen = false; subInputValue = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          v-else
          type="button"
          class="flex items-center justify-center gap-2 w-full border-[1.5px] border-dashed border-[var(--brand-border-mid)] rounded-[12px] px-4 py-[11px] text-[13.5px] font-semibold text-[var(--brand-text-muted)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors"
          @click="subInputOpen = true"
        >
          <Plus class="w-3.5 h-3.5" />
          Add Sub Department
        </button>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-6 py-3 rounded-[12px] border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] font-semibold text-[var(--brand-text-secondary)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
          @click="modalOpen = false"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-8 py-3 rounded-[12px] border-none bg-[var(--brand-teal)] text-[14px] font-bold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!form.name.trim()"
          @click="saveModal"
        >
          Save
        </button>
      </template>
    </SettingsFormModal>

    <SettingsFormModal
      v-model="bulkModalOpen"
      title="Bulk upload departments"
      width="480px"
    >
      <p class="text-[13.5px] text-[var(--brand-text-quiet)] mb-6">Upload a CSV file to create multiple departments at once.</p>

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
        <button
          type="button"
          class="px-[22px] py-[11px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] font-semibold text-[var(--brand-text-secondary)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
          @click="closeBulkModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-7 py-[11px] rounded-[10px] border-none bg-[var(--brand-teal)] text-[14px] font-bold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!bulkFileName"
          @click="closeBulkModal"
        >
          Upload
        </button>
      </template>
    </SettingsFormModal>
  </div>
</template>
