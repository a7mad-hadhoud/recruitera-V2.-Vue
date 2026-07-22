<!--
  "Assign location" modal for the Job Details tab of /jobs/new.

  Wraps SettingsFormModal so the shell matches Settings > Locations
  1:1 (radius, shadow, header, close). Locations come from
  useLocations() — same source Settings > Locations reads from — so
  the picker stays in lockstep. "Add new location" opens a small
  inline form inside this modal (no new sub-modal). "Manage
  locations" deep-links to /settings/locations.
-->
<script setup lang="ts">
import { Search, ArrowUpDown, Plus, Settings } from 'lucide-vue-next'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import { BrandButton, BrandLimeCheckbox } from '~/components/brand'
import { useLocations } from '~/composables/useLocations'
import type { Location } from '~/types'

const props = defineProps<{ selectedIds: string[] }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  confirm: [selectedIds: string[]]
}>()

const { data: locationsData } = useLocations()
// Local editable clone — the workspace list stays untouched until the
// user leaves the modal via Confirm (or discards via Cancel).
const localLocations = ref<Location[]>([])
const selectedSet = ref<Set<string>>(new Set())

watchEffect(() => {
  if (open.value) {
    localLocations.value = [...(locationsData.value?.data ?? [])]
    selectedSet.value = new Set(props.selectedIds)
  }
})

const search = ref('')
type SortDir = 'name-asc' | 'name-desc'
const sort = ref<SortDir>('name-asc')

const visibleLocations = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = localLocations.value.filter(l => !q
    || l.name.toLowerCase().includes(q)
    || l.city?.toLowerCase().includes(q)
    || l.country?.toLowerCase().includes(q))
  return [...list].sort((a, b) =>
    sort.value === 'name-desc'
      ? b.name.localeCompare(a.name)
      : a.name.localeCompare(b.name),
  )
})

const allSelected  = computed(() => visibleLocations.value.every(l => selectedSet.value.has(l.id)))
const noneSelected = computed(() => visibleLocations.value.every(l => !selectedSet.value.has(l.id)))
function setAll(v: boolean) {
  const next = new Set(selectedSet.value)
  for (const l of visibleLocations.value) {
    if (v) next.add(l.id); else next.delete(l.id)
  }
  selectedSet.value = next
}
function toggleLocation(id: string) {
  const next = new Set(selectedSet.value)
  if (next.has(id)) next.delete(id); else next.add(id)
  selectedSet.value = next
}

// Inline "Add new location" — full workspace add lives in Settings;
// this is a lightweight quick-add so the recruiter can attach a
// location without leaving the flow.
const addingNew = ref(false)
const newName = ref('')
const newCountry = ref('')
const newCity = ref('')
const canSaveNew = computed(() => newName.value.trim().length > 0)
function saveNewLocation() {
  if (!canSaveNew.value) return
  const loc: Location = {
    id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: newName.value.trim(),
    country: newCountry.value.trim(),
    city: newCity.value.trim(),
    jobCount: 0,
  }
  localLocations.value = [loc, ...localLocations.value]
  selectedSet.value = new Set([...selectedSet.value, loc.id])
  newName.value = ''
  newCountry.value = ''
  newCity.value = ''
  addingNew.value = false
}

function confirmSelection() {
  emit('confirm', Array.from(selectedSet.value))
  open.value = false
}
</script>

<template>
  <SettingsFormModal
    v-model="open"
    title="Assign location"
    width="580px"
    :scrollable="true"
  >
    <p class="text-[13.5px] text-[var(--brand-text-quiet)] -mt-4 mb-5">
      Select the location from the list below.
    </p>

    <div class="rounded-[14px] bg-[var(--brand-canvas)] border border-[var(--brand-border-fade)] p-4">
      <div class="relative mb-4">
        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)]" stroke-width="2" />
        <input
          v-model="search"
          type="text"
          placeholder="Search location"
          class="w-full h-10 pl-9 pr-3 text-[13.5px] rounded-[10px] bg-white border-[1.5px] border-[var(--brand-teal)] focus:outline-none transition"
        >
      </div>

      <div class="flex items-center justify-between mb-2">
        <span class="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[var(--brand-text-secondary)]">Locations</span>
        <div class="flex items-center gap-4 text-[13px] font-semibold">
          <button
            class="inline-flex items-center gap-1 text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"
            @click="sort = sort === 'name-asc' ? 'name-desc' : 'name-asc'"
          >
            <ArrowUpDown class="w-3.5 h-3.5" stroke-width="1.8" />
            Name
          </button>
          <button class="text-[var(--brand-text)] disabled:opacity-40" :disabled="allSelected" @click="setAll(true)">All</button>
          <button class="text-[var(--brand-text)] disabled:opacity-40" :disabled="noneSelected" @click="setAll(false)">None</button>
        </div>
      </div>

      <div class="rounded-[10px] bg-white border border-[var(--brand-border-fade)] divide-y divide-[var(--brand-border-fade)] max-h-[280px] overflow-y-auto">
        <label
          v-for="l in visibleLocations"
          :key="l.id"
          class="flex items-start gap-3 px-3.5 py-3 cursor-pointer hover:bg-[var(--brand-canvas)] transition"
        >
          <BrandLimeCheckbox
            :model-value="selectedSet.has(l.id)"
            :aria-label="`Toggle ${l.name}`"
            class="mt-0.5"
            @update:model-value="() => toggleLocation(l.id)"
          />
          <div class="min-w-0">
            <div class="text-[14px] font-bold text-[var(--brand-text)]">{{ l.name }}</div>
            <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">
              {{ [l.country, l.city].filter(Boolean).join(', ') || '—' }}
            </div>
          </div>
        </label>
        <div v-if="!visibleLocations.length" class="px-4 py-6 text-center text-[13px] text-[var(--brand-text-quiet)] italic">
          No locations match your search.
        </div>
      </div>

      <!-- Add new location (inline mini-form) -->
      <div class="mt-4">
        <button
          v-if="!addingNew"
          class="w-full inline-flex items-center justify-center gap-2 h-11 rounded-[10px] bg-white border border-[var(--brand-border-fade)] text-[14px] font-bold text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] transition"
          @click="addingNew = true"
        >
          <Plus class="w-4 h-4" stroke-width="2.2" />
          Add new location
        </button>
        <div v-else class="rounded-[10px] bg-white border border-[var(--brand-border-fade)] p-4">
          <div class="text-[13.5px] font-bold text-[var(--brand-text)] mb-3">New location</div>
          <div class="grid grid-cols-1 gap-2.5">
            <input
              v-model="newName"
              type="text"
              placeholder="Location name (e.g. Amsterdam HQ)"
              class="w-full h-10 px-3.5 text-[13.5px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
            >
            <div class="grid grid-cols-2 gap-2.5">
              <input
                v-model="newCountry"
                type="text"
                placeholder="Country"
                class="w-full h-10 px-3.5 text-[13.5px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
              >
              <input
                v-model="newCity"
                type="text"
                placeholder="City"
                class="w-full h-10 px-3.5 text-[13.5px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
              >
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 mt-3">
            <BrandButton variant="outline" @click="addingNew = false; newName = ''; newCountry = ''; newCity = ''">Cancel</BrandButton>
            <BrandButton variant="primary-teal" :disabled="!canSaveNew" @click="saveNewLocation">Add location</BrandButton>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <NuxtLink
        to="/settings/locations"
        class="inline-flex items-center gap-1.5 mr-auto text-[13.5px] font-bold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"
      >
        <Settings class="w-3.5 h-3.5" stroke-width="1.8" />
        Manage locations
      </NuxtLink>
      <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
      <BrandButton variant="primary-teal" @click="confirmSelection">Confirm</BrandButton>
    </template>
  </SettingsFormModal>
</template>
