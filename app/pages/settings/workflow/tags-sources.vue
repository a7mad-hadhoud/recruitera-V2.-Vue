<script setup lang="ts">
import { TableCell, TableHead, TableRow } from '~/components/ui/table'
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { useTags } from '~/composables/useTags'
import { BrandButton } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsTable from '~/components/settings/SettingsTable.vue'
import SettingsTableSkeleton from '~/components/settings/SettingsTableSkeleton.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import type { TagCategory, TagItem, TagsByCategory } from '~/types'

definePageMeta({ layout: 'settings' })

const TABS: { key: TagCategory, label: string }[] = [
  { key: 'candidates', label: 'Tags for candidates' },
  { key: 'jobs', label: 'Tags for jobs' },
  { key: 'sources', label: 'Sources' },
]

const COLUMNS: Record<TagCategory, { name: string, c1: string, c2?: string }> = {
  candidates: { name: 'Tag', c1: 'Candidates' },
  jobs: { name: 'Tag', c1: 'Jobs', c2: 'Job templates' },
  sources: { name: 'Source', c1: 'Candidates' },
}

const { data, isLoading } = useTags()

const tags = ref<TagsByCategory>({ candidates: [], jobs: [], sources: [] })
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    tags.value = {
      candidates: v.candidates.map(t => ({ ...t })),
      jobs: v.jobs.map(t => ({ ...t })),
      sources: v.sources.map(t => ({ ...t })),
    }
    seeded.value = true
  }
}, { immediate: true })

const activeTab = ref<TagCategory>('candidates')
const search = ref('')

watch(activeTab, () => { search.value = '' })

const activeItems = computed(() => tags.value[activeTab.value])
const activeCols = computed(() => COLUMNS[activeTab.value])
const itemLabel = computed(() => activeTab.value === 'sources' ? 'sources' : 'tags')
const searchPlaceholder = computed(() => activeTab.value === 'sources' ? 'Search sources...' : 'Search tags...')
const newButtonLabel = computed(() => activeTab.value === 'sources' ? 'New source' : 'New tag')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return activeItems.value
  return activeItems.value.filter(t => t.name.toLowerCase().includes(q))
})

// ─────────────── Add modal ───────────────
const modalOpen = ref(false)
const nameInput = ref('')

const modalTitle = computed(() => TABS.find(t => t.key === activeTab.value)!.label)

function openAddModal() {
  nameInput.value = ''
  modalOpen.value = true
}

function saveModal() {
  const v = nameInput.value.trim()
  if (!v) return

  const newItem: TagItem = { id: `${activeTab.value}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: v, count1: 0 }
  if (activeTab.value === 'jobs') newItem.count2 = 0
  tags.value[activeTab.value].unshift(newItem)
  modalOpen.value = false
}

// ─────────────── Inline edit (matches ground truth: row becomes an input with Save/Cancel) ───────────────
const editingRowId = ref<string | null>(null)
const editingValue = ref('')

watch(activeTab, () => { editingRowId.value = null })

function startEdit(item: TagItem) {
  editingRowId.value = item.id
  editingValue.value = item.name
}

function cancelEdit() {
  editingRowId.value = null
}

function saveEdit() {
  const v = editingValue.value.trim()
  if (!v) return
  const item = tags.value[activeTab.value].find(t => t.id === editingRowId.value)
  if (item) item.name = v
  editingRowId.value = null
}

// ─────────────── Delete (direct, matches Departments pattern) ───────────────
function deleteItem(item: TagItem) {
  tags.value[activeTab.value] = tags.value[activeTab.value].filter(t => t.id !== item.id)
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Tags & sources"
      subtitle="Use tags to better organize your candidates and jobs."
      learn-more-href="#"
    />

    <div class="flex gap-0 border-b border-[var(--brand-border-light)] mb-5 -mt-1">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        type="button"
        class="px-4 py-3 text-[13.5px] outline-none -mb-px border-b-2 transition-colors"
        :class="activeTab === tab.key
          ? 'font-semibold text-[var(--brand-text)] border-[var(--brand-teal)]'
          : 'font-medium text-[var(--brand-text-quiet)] border-transparent hover:text-[var(--brand-text)]'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <SettingsTable
      :search-placeholder="searchPlaceholder"
      :item-label="itemLabel"
      :total="activeItems.length"
      :filtered-count="filtered.length"
      :loading="isLoading"
      :empty="!isLoading && !filtered.length"
      empty-message="No results match."
      :colspan="activeCols.c2 ? 3 : 2"
      @update:search="v => search = v"
    >
      <template #actions>
        <BrandButton variant="primary-teal" @click="openAddModal">
          <Plus class="w-4 h-4 mr-1" />
          {{ newButtonLabel }}
        </BrandButton>
      </template>
      <template #header>
        <TableRow class="bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)]">
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">{{ activeCols.name }}</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)]" :class="activeCols.c2 ? 'border-r border-[var(--brand-border-hairline)]' : ''">{{ activeCols.c1 }}</TableHead>
          <TableHead v-if="activeCols.c2" class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)]">{{ activeCols.c2 }}</TableHead>
        </TableRow>
      </template>

      <SettingsTableSkeleton v-if="isLoading" :columns="activeCols.c2 ? 3 : 2" :rows="5" />
      <TableRow
        v-for="(item, i) in filtered"
        v-else
        :key="item.id"
        class="border-b border-[var(--brand-border-row)] last:border-0"
        :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
      >
        <TableCell class="py-[10px] px-5 text-[13.5px] font-medium text-[var(--brand-text)]" :class="activeCols.c2 ? 'border-r border-[var(--brand-border-hairline)]' : ''">
          <div v-if="editingRowId === item.id" class="flex items-center gap-2.5">
            <input type="checkbox" class="w-3.5 h-3.5 accent-[var(--brand-teal)] shrink-0" disabled>
            <input
              v-model="editingValue"
              type="text"
              class="flex-1 px-2.5 py-[7px] rounded-[8px] border-[1.5px] border-[var(--brand-teal)] text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
              autofocus
              @keyup.enter="saveEdit"
              @keyup.escape="cancelEdit"
            >
            <BrandButton variant="primary-teal" size="sm" class="whitespace-nowrap" @click="saveEdit">
              Save
            </BrandButton>
            <BrandButton variant="ghost" size="sm" class="whitespace-nowrap" @click="cancelEdit">
              Cancel
            </BrandButton>
          </div>
          <div v-else class="flex items-center gap-2.5">
            <input type="checkbox" class="w-3.5 h-3.5 accent-[var(--brand-teal)] shrink-0">
            <span class="flex-1">{{ item.name }}</span>
            <button
              class="inline-flex items-center justify-center px-[7px] py-[4px] rounded-[7px] border-none bg-transparent text-[var(--brand-text-faint)] outline-none hover:bg-[var(--brand-lime-tint-hover)] hover:text-[var(--brand-text)] transition-colors"
              title="Edit"
              @click="startEdit(item)"
            >
              <Pencil class="w-3 h-3" />
            </button>
            <button
              class="inline-flex items-center justify-center px-[7px] py-[4px] rounded-[7px] border-none bg-transparent text-[var(--brand-text-faint)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] hover:text-[var(--brand-settings-danger)] transition-colors"
              title="Delete"
              @click="deleteItem(item)"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </TableCell>
        <TableCell class="py-[10px] px-5 text-[13.5px] text-[var(--brand-text)]" :class="activeCols.c2 ? 'border-r border-[var(--brand-border-hairline)]' : ''">{{ item.count1 }}</TableCell>
        <TableCell v-if="activeCols.c2" class="py-[10px] px-5 text-[13.5px] text-[var(--brand-text)]">{{ item.count2 }}</TableCell>
      </TableRow>
    </SettingsTable>

    <SettingsFormModal
      v-model="modalOpen"
      :title="modalTitle"
      width="440px"
    >
      <div class="mb-1">
        <label class="block text-[12px] font-bold text-[var(--brand-text-quiet)] uppercase tracking-[0.02em] mb-2">
          {{ activeTab === 'sources' ? 'Source name' : 'Tag name' }}
        </label>
        <input
          v-model="nameInput"
          type="text"
          placeholder="Type here"
          class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-teal)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
          @keyup.enter="saveModal"
        >
      </div>

      <template #footer>
        <BrandButton variant="ghost" @click="modalOpen = false">
          Cancel
        </BrandButton>
        <BrandButton variant="primary-teal" :disabled="!nameInput.trim()" @click="saveModal">
          {{ activeTab === 'sources' ? 'Add source' : 'Add tags' }}
        </BrandButton>
      </template>
    </SettingsFormModal>
  </div>
</template>
