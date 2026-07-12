<script setup lang="ts">
import { GripVertical, Lock, Pencil, Plus, Trash2, X } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'

definePageMeta({ layout: 'settings' })

interface Stage { id: string, name: string }

const LOCKED_TOP = ['Referred', 'Sourced', 'Applied']
const LOCKED_BOTTOM = ['Offer', 'Hire']
const MAX_TOTAL = 10

const customStages = ref<Stage[]>([
  { id: 's-1', name: 'Phone screening' },
  { id: 's-2', name: 'Evaluation' },
  { id: 's-3', name: 'Interview' },
  { id: 's-4', name: 'Background Check' },
  { id: 's-5', name: 'Offer stage' },
])

const totalCount = computed(() => LOCKED_TOP.length + customStages.value.length + LOCKED_BOTTOM.length)

// ─────────────── Inline edit ───────────────
const editingId = ref<string | null>(null)
const editingValue = ref('')

function startEdit(stage: Stage) {
  editingId.value = stage.id
  editingValue.value = stage.name
  nextTick(() => {
    const el = document.querySelector<HTMLInputElement>(`[data-st-input="${stage.id}"]`)
    el?.focus()
    el?.select()
  })
}

function saveEdit() {
  const stage = customStages.value.find(s => s.id === editingId.value)
  if (stage && editingValue.value.trim()) stage.name = editingValue.value.trim()
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

function deleteStage(stage: Stage) {
  customStages.value = customStages.value.filter(s => s.id !== stage.id)
}

// ─────────────── Add new modal ───────────────
const modalOpen = ref(false)
const newName = ref('')

function openModal() {
  newName.value = ''
  modalOpen.value = true
}

function addStage() {
  const v = newName.value.trim()
  if (!v) return
  customStages.value.push({ id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: v })
  modalOpen.value = false
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Stage types"
      subtitle="Define the types of stages used in your hiring pipelines."
    >
      <template #actions>
        <BrandButton variant="primary-teal" @click="openModal">
          <Plus class="w-4 h-4 mr-1" />
          New Stage Type
        </BrandButton>
      </template>
    </SettingsPageHeader>

    <!-- locked top: Referred / Sourced / Applied -->
    <div class="flex flex-col gap-2">
      <div
        v-for="name in LOCKED_TOP"
        :key="`top-${name}`"
        class="flex items-center px-[18px] py-[14px] bg-[var(--brand-surface-table-alt)] border border-[var(--brand-border-light)] rounded-[10px]"
      >
        <span class="flex-1 text-[14px] font-medium text-[var(--brand-text-quiet)]">{{ name }}</span>
        <Lock class="w-4 h-4 text-[var(--brand-text-faint)]" />
      </div>
    </div>

    <!-- custom stages -->
    <div class="flex flex-col gap-1.5 my-4">
      <div
        v-for="stage in customStages"
        :key="stage.id"
        class="flex items-center gap-2.5 px-[18px] py-[13px] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[10px] hover:bg-[var(--brand-surface-hover)] transition-colors"
      >
        <GripVertical class="w-3.5 h-3.5 text-[var(--brand-text-faint)] shrink-0 cursor-grab" />

        <input
          v-if="editingId === stage.id"
          :data-st-input="stage.id"
          v-model="editingValue"
          type="text"
          class="flex-1 px-2.5 py-1.5 rounded-[8px] border-[1.5px] border-[var(--brand-teal)] text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
          @blur="saveEdit"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
        >
        <span v-else class="flex-1 text-[14px] font-medium text-[var(--brand-text)]">{{ stage.name }}</span>

        <div v-if="editingId !== stage.id" class="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            class="inline-flex items-center justify-center px-2 py-[5px] rounded-[7px] border-none bg-transparent text-[var(--brand-text-faint)] outline-none hover:bg-[var(--brand-badge-settings-bg)] hover:text-[var(--brand-text)] transition-colors"
            title="Edit"
            @click="startEdit(stage)"
          >
            <Pencil class="w-[13px] h-[13px]" />
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center px-2 py-[5px] rounded-[7px] border-none bg-transparent text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors"
            title="Delete"
            @click="deleteStage(stage)"
          >
            <Trash2 class="w-[13px] h-[13px]" />
          </button>
        </div>
      </div>
    </div>

    <!-- locked bottom: Offer / Hire -->
    <div class="flex flex-col gap-2">
      <div
        v-for="name in LOCKED_BOTTOM"
        :key="`bot-${name}`"
        class="flex items-center px-[18px] py-[14px] bg-[var(--brand-surface-table-alt)] border border-[var(--brand-border-light)] rounded-[10px]"
      >
        <span class="flex-1 text-[14px] font-medium text-[var(--brand-text-quiet)]">{{ name }}</span>
        <Lock class="w-4 h-4 text-[var(--brand-text-faint)]" />
      </div>
    </div>

    <!-- footer counter -->
    <div class="text-[13px] text-[var(--brand-text-quiet)] mt-5">
      <strong class="text-[var(--brand-text)]">{{ totalCount }}</strong> / {{ MAX_TOTAL }} Stage Types used
    </div>

    <SettingsFormModal
      v-model="modalOpen"
      title="Add New Stage Type"
      width="440px"
    >
      <div class="mb-1">
        <label class="flex items-center gap-1 text-[12px] font-bold text-[var(--brand-text-quiet)] uppercase tracking-[0.03em] mb-2">
          Stage Type Name <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="newName"
          type="text"
          placeholder="Add Stage Type"
          class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-teal)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
          @keyup.enter="addStage"
        >
      </div>

      <template #footer>
        <button
          type="button"
          class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[9px] text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none px-5 py-2"
          @click="modalOpen = false"
        >
          Discard
        </button>
        <button
          type="button"
          class="bg-[var(--brand-teal)] text-white border-none rounded-[9px] text-[13.5px] font-bold outline-none px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!newName.trim()"
          @click="addStage"
        >
          Add Stage Type
        </button>
      </template>
    </SettingsFormModal>
  </div>
</template>
