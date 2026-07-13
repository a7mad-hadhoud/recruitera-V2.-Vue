<script setup lang="ts">
import { TableCell, TableHead, TableRow } from '~/components/ui/table'
import { Copy, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { useLocations } from '~/composables/useLocations'
import { BrandButton } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsTable from '~/components/settings/SettingsTable.vue'
import SettingsTableSkeleton from '~/components/settings/SettingsTableSkeleton.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsRowMenu from '~/components/settings/SettingsRowMenu.vue'
import SettingsRowMenuItem from '~/components/settings/SettingsRowMenuItem.vue'
import SettingsToast from '~/components/settings/SettingsToast.vue'
import type { Location } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useLocations()

// Local mutable copy so Add/Edit/Duplicate/Delete can actually mutate what's rendered.
const locations = ref<Location[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    locations.value = v.data.map(l => ({ ...l }))
    seeded.value = true
  }
}, { immediate: true })

const total = computed(() => locations.value.length)
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return locations.value
  return locations.value.filter(l =>
    l.name.toLowerCase().includes(q)
    || l.country.toLowerCase().includes(q)
    || l.city.toLowerCase().includes(q),
  )
})

// ─────────────── Add / Edit modal ───────────────
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ name: '', country: '', city: '', link: '' })

function openAddModal() {
  editingId.value = null
  form.name = ''
  form.country = ''
  form.city = ''
  form.link = ''
  modalOpen.value = true
}

function openEditModal(loc: Location) {
  editingId.value = loc.id
  form.name = loc.name
  form.country = loc.country === '—' ? '' : loc.country
  form.city = loc.city === '—' ? '' : loc.city
  form.link = loc.link ?? ''
  modalOpen.value = true
}

function saveModal() {
  if (!form.name.trim()) return

  if (editingId.value) {
    const loc = locations.value.find(l => l.id === editingId.value)
    if (loc) {
      loc.name = form.name.trim()
      loc.country = form.country.trim() || '—'
      loc.city = form.city.trim() || '—'
      loc.link = form.link.trim() || undefined
    }
  }
  else {
    locations.value.unshift({
      id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: form.name.trim(),
      country: form.country.trim() || '—',
      city: form.city.trim() || '—',
      jobCount: 0,
      link: form.link.trim() || undefined,
    })
  }
  modalOpen.value = false
}

// ─────────────── Duplicate ───────────────
function duplicateLocation(loc: Location) {
  const idx = locations.value.findIndex(l => l.id === loc.id)
  const clone: Location = { ...loc, id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
  locations.value.splice(idx + 1, 0, clone)
}

// ─────────────── Delete (blocked while jobs are assigned) ───────────────
const toastOpen = ref(false)
const toastMessage = ref('')

function deleteLocation(loc: Location) {
  if (loc.jobCount > 0) {
    toastMessage.value = `Please assign another location to the ${loc.jobCount} job${loc.jobCount === 1 ? '' : 's'} that use this one as their only location.`
    toastOpen.value = true
    return
  }
  locations.value = locations.value.filter(l => l.id !== loc.id)
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Locations"
      subtitle="Manage locations for your organization and assign them to jobs."
      learn-more-href="#"
    />

    <SettingsTable
      search-placeholder="Search locations"
      item-label="locations"
      :total="total"
      :filtered-count="filtered.length"
      :loading="isLoading"
      :empty="!isLoading && !filtered.length"
      empty-message="No locations match."
      :colspan="4"
      @update:search="v => search = v"
    >
      <template #actions>
        <BrandButton variant="primary-teal" @click="openAddModal">
          <Plus class="w-4 h-4 mr-1" />
          New location
        </BrandButton>
      </template>
      <template #header>
        <TableRow class="bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)]">
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Location name</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Country / City</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Jobs</TableHead>
          <TableHead class="py-[14px] px-5 text-right text-[13px] font-semibold text-[var(--brand-nav-text)]">Actions</TableHead>
        </TableRow>
      </template>

      <SettingsTableSkeleton v-if="isLoading" :columns="4" :rows="6" />
      <TableRow
        v-for="(loc, i) in filtered"
        v-else
        :key="loc.id"
        class="border-b border-[var(--brand-border-row)] last:border-0"
        :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
      >
        <TableCell class="py-[11px] px-5 font-semibold text-[14px] text-[var(--brand-text)] border-r border-[var(--brand-border-hairline)]">{{ loc.name }}</TableCell>
        <TableCell class="py-[11px] px-5 text-[13.5px] text-[var(--brand-text-muted)] border-r border-[var(--brand-border-hairline)]">
          {{ loc.country === loc.city ? loc.city : `${loc.country}, ${loc.city}` }}
        </TableCell>
        <TableCell class="py-[11px] px-5 border-r border-[var(--brand-border-hairline)]">
          <span class="inline-block bg-[var(--brand-badge-settings-bg)] text-[var(--brand-badge-settings-text)] text-[12px] font-bold rounded-[6px] px-2 py-[3px]">
            {{ loc.jobCount }} {{ loc.jobCount === 1 ? 'job' : 'jobs' }}
          </span>
        </TableCell>
        <TableCell class="py-[11px] px-5 text-right">
          <div class="flex items-center gap-1.5 justify-end">
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
              @click="openEditModal(loc)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <SettingsRowMenu>
              <SettingsRowMenuItem @click="duplicateLocation(loc)">
                <Copy class="w-3.5 h-3.5" />
                Duplicate
              </SettingsRowMenuItem>
              <SettingsRowMenuItem danger @click="deleteLocation(loc)">
                <Trash2 class="w-3.5 h-3.5" />
                Delete
              </SettingsRowMenuItem>
            </SettingsRowMenu>
          </div>
        </TableCell>
      </TableRow>
    </SettingsTable>

    <SettingsFormModal
      v-model="modalOpen"
      :title="editingId ? 'Edit location' : 'Add location'"
      width="520px"
    >
      <div class="mb-5">
        <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">Location name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. HQ — Cairo"
          class="w-full box-border px-4 py-[13px] rounded-[12px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] focus:border-[var(--brand-teal)] transition-colors"
        >
      </div>
      <div class="grid grid-cols-2 gap-3.5 mb-5">
        <div>
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">Country</label>
          <input
            v-model="form.country"
            type="text"
            class="w-full box-border px-4 py-[13px] rounded-[12px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] focus:border-[var(--brand-teal)] transition-colors"
          >
        </div>
        <div>
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">City</label>
          <input
            v-model="form.city"
            type="text"
            class="w-full box-border px-4 py-[13px] rounded-[12px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] focus:border-[var(--brand-teal)] transition-colors"
          >
        </div>
      </div>
      <div class="mb-2">
        <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">
          Location link <span class="font-normal text-[var(--brand-text-quiet)]">(optional)</span>
        </label>
        <input
          v-model="form.link"
          type="url"
          placeholder="https://maps..."
          class="w-full box-border px-4 py-[13px] rounded-[12px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] focus:border-[var(--brand-teal)] transition-colors"
        >
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
          Save
        </BrandButton>
      </template>
    </SettingsFormModal>

    <SettingsToast
      v-model="toastOpen"
      title="Location can't be deleted"
      :message="toastMessage"
    />
  </div>
</template>
