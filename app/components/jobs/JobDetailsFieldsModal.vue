<!--
  "Manage custom fields" modal for the Job Details tab of /jobs/new.

  Two states inside the same modal shell:
    step === 'list'   → picker: search + list of custom fields (checkboxes),
                        Create-new CTA, All/None quick toggles, Edit fields
                        link, Cancel / Update.
    step === 'create' → new-field form: Name / Type / Required toggle +
                        Settings checkboxes, Go back / Cancel / Save.

  Reuses SettingsFormModal so the shell (radius, shadow, header layout,
  close button) matches Settings > Departments / Locations 1:1. Custom
  field catalog is fixture today; swap for useCustomFields() when the
  API endpoint lands.
-->
<script setup lang="ts">
import { Search, Plus, Globe, HelpCircle } from 'lucide-vue-next'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import { BrandButton, BrandLimeCheckbox } from '~/components/brand'

export interface CustomField {
  id: string
  name: string
  onCareersSite?: boolean
  selected?: boolean
}

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  apply: [selectedIds: string[]]
}>()

type FieldType = 'text' | 'text-multi' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'file'
const FIELD_TYPES: Array<{ value: FieldType; label: string }> = [
  { value: 'text',        label: 'Text (single line)'    },
  { value: 'text-multi',  label: 'Text (multiple lines)' },
  { value: 'number',      label: 'Number'                },
  { value: 'date',        label: 'Date'                  },
  { value: 'dropdown',    label: 'Dropdown'              },
  { value: 'checkbox',    label: 'Checkbox'              },
  { value: 'file',        label: 'File'                  },
]

// Fixture. Real workspace fields live in Settings > Custom fields (not
// built yet); when they land, replace `fields` with the composable.
const fields = ref<CustomField[]>([
  { id: 'cf-exp', name: 'Experience level', onCareersSite: true, selected: false },
])

const step = ref<'list' | 'create'>('list')
const search = ref('')

const filteredFields = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return fields.value
  return fields.value.filter(f => f.name.toLowerCase().includes(q))
})
const allSelected  = computed(() => filteredFields.value.every(f => f.selected))
const noneSelected = computed(() => filteredFields.value.every(f => !f.selected))

function setAll(v: boolean) {
  for (const f of filteredFields.value) f.selected = v
}
function toggleField(id: string) {
  const f = fields.value.find(x => x.id === id)
  if (f) f.selected = !f.selected
}
function submitUpdate() {
  emit('apply', fields.value.filter(f => f.selected).map(f => f.id))
  open.value = false
}

// ─── Create-new-field state ───────────────────────────────
const draftName = ref('')
const draftType = ref<FieldType | ''>('')
const draftRequired = ref(false)
const draftShowOnCareers = ref(false)
const draftAddToAllJobs  = ref(false)
const draftAddToAllTemplates = ref(false)
const canSaveDraft = computed(() => draftName.value.trim().length > 0 && draftType.value !== '')

function resetDraft() {
  draftName.value = ''
  draftType.value = ''
  draftRequired.value = false
  draftShowOnCareers.value = false
  draftAddToAllJobs.value = false
  draftAddToAllTemplates.value = false
}

function saveDraft() {
  if (!canSaveDraft.value) return
  fields.value = [
    ...fields.value,
    {
      id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: draftName.value.trim(),
      onCareersSite: draftShowOnCareers.value,
      selected: true,
    },
  ]
  resetDraft()
  step.value = 'list'
}

// Reset both step and draft whenever the modal closes so it re-opens fresh.
watch(open, (v) => {
  if (!v) {
    step.value = 'list'
    search.value = ''
    resetDraft()
  }
})
</script>

<template>
  <SettingsFormModal
    v-model="open"
    :title="step === 'list' ? 'Manage custom fields' : 'Create new custom field'"
    width="620px"
    :scrollable="true"
  >
    <p class="text-[13.5px] text-[var(--brand-text-quiet)] -mt-4 mb-5">
      {{ step === 'list'
        ? 'Select custom fields to add or remove from this job.'
        : 'Specify how this field will work and where it will be used.' }}
      <a href="#" class="text-[var(--brand-teal-secondary)] font-bold hover:text-[var(--brand-teal)]">Learn more</a>
    </p>

    <!-- STEP: list ────────────────────────────────────────── -->
    <template v-if="step === 'list'">
      <div class="rounded-[14px] bg-[var(--brand-canvas)] border border-[var(--brand-border-fade)] p-4">
        <div class="relative mb-4">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)]" stroke-width="2" />
          <input
            v-model="search"
            type="text"
            placeholder="Search"
            class="w-full h-10 pl-9 pr-3 text-[13.5px] rounded-[10px] bg-white border-[1.5px] border-[var(--brand-teal)] focus:outline-none transition"
          >
        </div>

        <div class="flex items-center justify-between mb-2">
          <span class="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[var(--brand-text-secondary)]">Custom fields</span>
          <div class="flex items-center gap-4 text-[13px] font-semibold">
            <button class="text-[var(--brand-text)] disabled:opacity-40" :disabled="allSelected" @click="setAll(true)">All</button>
            <button class="text-[var(--brand-text)] disabled:opacity-40" :disabled="noneSelected" @click="setAll(false)">None</button>
          </div>
        </div>

        <div class="rounded-[10px] bg-white border border-[var(--brand-border-fade)] divide-y divide-[var(--brand-border-fade)]">
          <label
            v-for="f in filteredFields"
            :key="f.id"
            class="flex items-center gap-3 px-3.5 py-3 cursor-pointer hover:bg-[var(--brand-canvas)] transition"
          >
            <BrandLimeCheckbox
              :model-value="!!f.selected"
              :aria-label="`Toggle ${f.name}`"
              @update:model-value="() => toggleField(f.id)"
            />
            <span class="flex-1 text-[14px] font-semibold text-[var(--brand-text)]">{{ f.name }}</span>
            <span
              v-if="f.onCareersSite"
              class="inline-flex items-center gap-1 rounded-full bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] text-[10.5px] font-bold uppercase tracking-[0.06em] px-2 py-0.5"
            >
              <Globe class="w-3 h-3" stroke-width="2" />
              On careers site
            </span>
          </label>
          <div v-if="!filteredFields.length" class="px-4 py-6 text-center text-[13px] text-[var(--brand-text-quiet)] italic">
            No fields match your search.
          </div>
        </div>

        <button
          class="mt-4 w-full inline-flex items-center justify-center gap-2 h-11 rounded-[10px] bg-white border border-[var(--brand-border-fade)] text-[14px] font-bold text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] transition"
          @click="step = 'create'"
        >
          <Plus class="w-4 h-4" stroke-width="2.2" />
          Create new field
        </button>
      </div>
    </template>

    <!-- STEP: create new field ──────────────────────────────── -->
    <template v-else>
      <div class="rounded-[14px] bg-[var(--brand-canvas)] border border-[var(--brand-border-fade)] p-5">
        <div class="grid grid-cols-2 gap-4 mb-1">
          <div>
            <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
              Name <span class="text-[var(--brand-status-closed-text)]">*</span>
            </label>
            <input
              v-model="draftName"
              type="text"
              placeholder="Type name"
              class="w-full h-11 px-3.5 text-[14px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
            >
          </div>
          <div>
            <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
              Type <span class="text-[var(--brand-status-closed-text)]">*</span>
            </label>
            <div class="relative">
              <select
                v-model="draftType"
                class="w-full h-11 px-3.5 pr-9 text-[14px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white appearance-none focus:border-[var(--brand-teal)] focus:outline-none transition"
              >
                <option value="" disabled>Select field type</option>
                <option v-for="t in FIELD_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-3">
          <span class="text-[13.5px] font-bold text-[var(--brand-text)]">Required</span>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <span
              class="relative inline-flex w-[38px] h-[22px] rounded-full transition-colors"
              :style="{ background: draftRequired ? 'var(--brand-teal)' : 'var(--brand-border)' }"
            >
              <span
                class="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-[0_1px_2px_rgba(0,20,18,0.25)] transition-[left]"
                :style="{ left: draftRequired ? '18px' : '2px' }"
              />
            </span>
            <input v-model="draftRequired" type="checkbox" class="sr-only" aria-label="Required">
            <span class="text-[13.5px] font-semibold text-[var(--brand-text-secondary)]">{{ draftRequired ? 'Yes' : 'No' }}</span>
          </label>
        </div>
      </div>

      <div class="mt-4 rounded-[14px] bg-white border border-[var(--brand-border-fade)] p-5">
        <div class="text-[14px] font-bold text-[var(--brand-text)] mb-3">Settings</div>
        <label class="flex items-center gap-2.5 py-1.5 cursor-pointer">
          <BrandLimeCheckbox v-model="draftShowOnCareers" aria-label="Display field on the careers site" />
          <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">Display field on the careers site</span>
          <HelpCircle class="w-3.5 h-3.5 text-[var(--brand-text-faint)]" stroke-width="1.8" />
        </label>
        <label class="flex items-center gap-2.5 py-1.5 cursor-pointer">
          <BrandLimeCheckbox v-model="draftAddToAllJobs" aria-label="Add field to all blank jobs" />
          <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">Add field to all blank jobs</span>
        </label>
        <label class="flex items-center gap-2.5 py-1.5 cursor-pointer">
          <BrandLimeCheckbox v-model="draftAddToAllTemplates" aria-label="Add field to all blank job templates" />
          <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">Add field to all blank job templates</span>
        </label>
      </div>
    </template>

    <template #footer>
      <template v-if="step === 'list'">
        <button class="inline-flex items-center gap-1.5 mr-auto text-[13.5px] font-bold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]">
          <span class="w-4 h-4 inline-flex items-center justify-center">⚙</span>
          Edit fields
        </button>
        <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" @click="submitUpdate">Update</BrandButton>
      </template>
      <template v-else>
        <button
          class="inline-flex items-center gap-1.5 mr-auto text-[13.5px] font-bold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"
          @click="step = 'list'"
        >← Go back</button>
        <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" :disabled="!canSaveDraft" @click="saveDraft">Save</BrandButton>
      </template>
    </template>
  </SettingsFormModal>
</template>
