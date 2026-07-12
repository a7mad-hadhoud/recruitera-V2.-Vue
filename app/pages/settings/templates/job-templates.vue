<script setup lang="ts">
import { Search, Plus, Pencil, Copy, Trash2, LayoutGrid, List, Building2, Globe, Shuffle } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsRowMenu from '~/components/settings/SettingsRowMenu.vue'
import SettingsRowMenuItem from '~/components/settings/SettingsRowMenuItem.vue'
import { useJobTemplates } from '~/composables/useTemplates'
import type { JobTemplate, WorkLocationType } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useJobTemplates()

const templates = ref<JobTemplate[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    templates.value = v.data.map(t => ({ ...t, locations: [...t.locations] }))
    seeded.value = true
  }
}, { immediate: true })

function newId() {
  return `jt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return templates.value
  return templates.value.filter(t =>
    t.name.toLowerCase().includes(q)
    || t.jobName.toLowerCase().includes(q)
    || t.department.toLowerCase().includes(q),
  )
})

const viewMode = ref<'list' | 'grid'>('list')

const LOCATION_ICONS: Record<WorkLocationType, typeof Building2> = {
  'On-site': Building2,
  'Remote': Globe,
  'Hybrid': Shuffle,
}
const DEPARTMENTS = ['Engineering', 'Product', 'Sales', 'Human Resources', 'Marketing']
const LOCATION_OPTIONS: WorkLocationType[] = ['On-site', 'Remote', 'Hybrid']

// ─────────────── Add / Edit modal ───────────────
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<{ name: string; jobName: string; department: string; locations: WorkLocationType[] }>({
  name: '',
  jobName: '',
  department: '',
  locations: [],
})

function openAddModal() {
  editingId.value = null
  form.name = ''
  form.jobName = ''
  form.department = ''
  form.locations = []
  modalOpen.value = true
}
function openEditModal(t: JobTemplate) {
  editingId.value = t.id
  form.name = t.name
  form.jobName = t.jobName
  form.department = t.department
  form.locations = [...t.locations]
  modalOpen.value = true
}
function toggleLocation(loc: WorkLocationType) {
  form.locations = form.locations.includes(loc)
    ? form.locations.filter(l => l !== loc)
    : [...form.locations, loc]
}

const canSave = computed(() => form.name.trim() && form.locations.length > 0)

function saveTemplate() {
  if (!canSave.value) return
  if (editingId.value) {
    const idx = templates.value.findIndex(t => t.id === editingId.value)
    if (idx !== -1) {
      templates.value[idx] = {
        ...templates.value[idx]!,
        name: form.name.trim(),
        jobName: form.jobName.trim() || `${form.name.trim()} (Sample)`,
        department: form.department,
        locations: [...form.locations],
      }
    }
  }
  else {
    templates.value.unshift({
      id: newId(),
      name: form.name.trim(),
      jobName: form.jobName.trim() || `${form.name.trim()} (Sample)`,
      jobCount: 0,
      department: form.department,
      locations: [...form.locations],
    })
  }
  modalOpen.value = false
}

// ─────────────── Duplicate / delete ───────────────
function duplicateTemplate(t: JobTemplate) {
  templates.value.unshift({ ...t, id: newId(), name: `${t.name} (Copy)`, locations: [...t.locations] })
}
function deleteTemplate(t: JobTemplate) {
  templates.value = templates.value.filter(x => x.id !== t.id)
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Job templates"
      subtitle="Create job offer templates to preset essential information and easily reuse them for new job postings."
      learn-more-href="#"
    />

    <!-- Toolbar -->
    <div class="flex items-center gap-2.5 mb-4">
      <div class="flex-1 flex items-center gap-2.5 bg-[var(--brand-surface-white)] border border-[var(--brand-border)] rounded-[12px] px-3.5 py-2.5">
        <Search class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" />
        <input
          v-model="search"
          type="text"
          placeholder="Search job templates"
          class="border-0 outline-none text-[14px] text-[var(--brand-text)] bg-transparent flex-1"
        >
      </div>
      <span class="text-[13.5px] text-[var(--brand-text-muted)] whitespace-nowrap">
        <strong class="text-[var(--brand-text)]">{{ filtered.length ? 1 : 0 }}–{{ filtered.length }}</strong> of <strong class="text-[var(--brand-text)]">{{ templates.length }}</strong> templates
      </span>
      <div class="flex items-center border border-[var(--brand-border)] rounded-[10px] overflow-hidden">
        <button
          type="button"
          class="flex items-center justify-center w-9 h-9 outline-none transition-colors"
          :class="viewMode === 'list' ? 'bg-[var(--brand-lime-tint)] text-[var(--brand-olive)]' : 'bg-[var(--brand-surface-white)] text-[var(--brand-text-quiet)] hover:bg-[var(--brand-surface-hover)]'"
          title="List view"
          @click="viewMode = 'list'"
        >
          <List class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="flex items-center justify-center w-9 h-9 outline-none border-l border-[var(--brand-border)] transition-colors"
          :class="viewMode === 'grid' ? 'bg-[var(--brand-lime-tint)] text-[var(--brand-olive)]' : 'bg-[var(--brand-surface-white)] text-[var(--brand-text-quiet)] hover:bg-[var(--brand-surface-hover)]'"
          title="Grid view"
          @click="viewMode = 'grid'"
        >
          <LayoutGrid class="w-4 h-4" />
        </button>
      </div>
      <BrandButton variant="primary-teal" @click="openAddModal">
        <Plus class="w-4 h-4 mr-1" />
        New template
      </BrandButton>
    </div>

    <!-- Cards -->
    <p v-if="isLoading && !templates.length" class="text-[13px] text-[var(--brand-text-muted)] py-6 text-center">Loading…</p>
    <p v-else-if="!filtered.length" class="text-[13px] text-[var(--brand-text-muted)] py-6 text-center">No job templates match.</p>
    <div v-else class="flex gap-2.5" :class="viewMode === 'grid' ? 'flex-wrap' : 'flex-col'">
      <div
        v-for="t in filtered"
        :key="t.id"
        class="flex items-center gap-3.5 px-5 py-[18px] border-[1.5px] border-[var(--brand-border-light)] rounded-[12px] bg-[var(--brand-surface-white)] cursor-pointer hover:border-[var(--brand-border-mid)] transition-colors"
        :class="viewMode === 'grid' ? 'flex-1 basis-[280px] flex-col items-start gap-2.5' : ''"
        @click="openEditModal(t)"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[15px] font-bold text-[var(--brand-text)]">{{ t.name }}</span>
            <span class="text-[11px] font-bold text-[var(--brand-nav-text)] bg-[var(--brand-badge-settings-bg)] rounded-[6px] px-2 py-[2px] uppercase tracking-[0.04em]">
              {{ t.jobCount }} {{ t.jobCount === 1 ? 'JOB' : 'JOBS' }}
            </span>
          </div>
          <div class="text-[13px] text-[var(--brand-text-quiet)] flex items-center flex-wrap gap-x-1.5">
            <span>Job name: {{ t.jobName }}</span>
            <template v-for="loc in t.locations" :key="loc">
              <span>·</span>
              <span class="inline-flex items-center gap-1">
                <component :is="LOCATION_ICONS[loc]" class="w-3 h-3" />
                {{ loc }}
              </span>
            </template>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0" @click.stop>
          <button
            type="button"
            class="inline-flex items-center justify-center w-[34px] h-[34px] rounded-full border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
            title="Edit"
            @click="openEditModal(t)"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>
          <SettingsRowMenu>
            <SettingsRowMenuItem @click="duplicateTemplate(t)">
              <Copy class="w-[14px] h-[14px]" />
              Duplicate
            </SettingsRowMenuItem>
            <SettingsRowMenuItem danger @click="deleteTemplate(t)">
              <Trash2 class="w-[14px] h-[14px]" />
              Delete
            </SettingsRowMenuItem>
          </SettingsRowMenu>
        </div>
      </div>
    </div>

    <!-- ─────────────── Add / Edit modal ─────────────── -->
    <SettingsFormModal
      v-model="modalOpen"
      :title="editingId ? 'Edit job template' : 'Create job template'"
      width="480px"
    >
      <div class="mb-4">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Template name <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. Senior Marketer"
          class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
      </div>
      <div class="mb-4">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Job name <span class="font-normal text-[var(--brand-text-quiet)]">(Optional)</span>
        </label>
        <input
          v-model="form.jobName"
          type="text"
          :placeholder="form.name ? `${form.name} (Sample)` : 'e.g. Senior Marketer (Sample)'"
          class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
      </div>
      <div class="mb-4">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Department <span class="font-normal text-[var(--brand-text-quiet)]">(Optional)</span>
        </label>
        <select
          v-model="form.department"
          class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
        >
          <option value="">Select department</option>
          <option v-for="d in DEPARTMENTS" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
      <div>
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Work location <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <div class="flex gap-2">
          <button
            v-for="loc in LOCATION_OPTIONS"
            :key="loc"
            type="button"
            class="flex items-center gap-1.5 border-[1.5px] rounded-[10px] px-3.5 py-2 text-[13.5px] font-medium outline-none transition-colors"
            :class="form.locations.includes(loc)
              ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)] text-[var(--brand-olive)]'
              : 'border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)]'"
            @click="toggleLocation(loc)"
          >
            <component :is="LOCATION_ICONS[loc]" class="w-3.5 h-3.5" />
            {{ loc }}
          </button>
        </div>
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
          :disabled="!canSave"
          @click="saveTemplate"
        >
          Save
        </button>
      </template>
    </SettingsFormModal>
  </div>
</template>
