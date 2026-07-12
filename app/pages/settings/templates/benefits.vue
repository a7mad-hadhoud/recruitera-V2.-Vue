<script setup lang="ts">
import { Plus, Pencil, Bold, Italic, Underline, Info, Copy, Trash2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsRenameModal from '~/components/settings/SettingsRenameModal.vue'
import SettingsRowMenu from '~/components/settings/SettingsRowMenu.vue'
import SettingsRowMenuItem from '~/components/settings/SettingsRowMenuItem.vue'
import { BrandSearchBar } from '~/components/brand'
import { useBenefitsTemplates } from '~/composables/useTemplates'
import type { BenefitsTemplate } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useBenefitsTemplates()

// Local editable copy — seeded once from the mock query, then owned client-side
// (matches the same pattern used by the other Templates pages).
const templates = ref<BenefitsTemplate[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    templates.value = v.data.map(t => ({ ...t }))
    seeded.value = true
  }
}, { immediate: true })

function newId() {
  return `bn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return templates.value
  return templates.value.filter(t => t.name.toLowerCase().includes(q))
})

const selectedId = ref<string | null>(null)
watch(templates, (arr) => {
  if (!selectedId.value && arr.length) selectedId.value = arr[0]!.id
}, { immediate: true })

const selected = computed(() => templates.value.find(t => t.id === selectedId.value) ?? null)

// ─────────────── Editor (contenteditable body, like email.vue) ───────────────
const bodyEl = ref<HTMLDivElement | null>(null)
const savedLabel = ref('Saved 16 days ago')
watch(selected, (t) => {
  savedLabel.value = 'Saved 16 days ago'
  nextTick(() => {
    if (bodyEl.value) bodyEl.value.innerText = t?.content ?? ''
  })
}, { immediate: true })

function saveTemplate() {
  if (!selected.value) return
  const idx = templates.value.findIndex(t => t.id === selected.value!.id)
  if (idx === -1) return
  templates.value[idx] = { ...templates.value[idx]!, content: bodyEl.value?.innerText ?? templates.value[idx]!.content }
  savedLabel.value = 'Saved just now'
}
function exec(cmd: string) {
  bodyEl.value?.focus()
  document.execCommand(cmd)
}

// ─────────────── Rename ───────────────
const renameOpen = ref(false)
const renameDraft = ref('')
function openRename() {
  if (!selected.value) return
  renameDraft.value = selected.value.name
  renameOpen.value = true
}
function confirmRename() {
  if (!renameDraft.value.trim()) return
  const idx = templates.value.findIndex(t => t.id === selected.value!.id)
  templates.value[idx] = { ...templates.value[idx]!, name: renameDraft.value.trim() }
  renameOpen.value = false
}

// ─────────────── New template ───────────────
const newModalOpen = ref(false)
const newName = ref('')
function openNewModal() {
  newName.value = ''
  newModalOpen.value = true
}
function createTemplate() {
  if (!newName.value.trim()) return
  const t: BenefitsTemplate = { id: newId(), name: newName.value.trim(), content: '' }
  templates.value.unshift(t)
  selectedId.value = t.id
  newModalOpen.value = false
}

// ─────────────── More menu: duplicate / delete ───────────────
function duplicateTemplate() {
  if (!selected.value) return
  const t: BenefitsTemplate = { id: newId(), name: `${selected.value.name} (Copy)`, content: selected.value.content }
  templates.value.unshift(t)
  selectedId.value = t.id
}
function deleteTemplate() {
  if (!selected.value) return
  templates.value = templates.value.filter(t => t.id !== selected.value!.id)
  selectedId.value = templates.value[0]?.id ?? null
}
</script>

<template>
  <div class="flex h-[calc(100vh-120px)] min-h-[600px] -m-6 overflow-hidden">
    <!-- LEFT: template list -->
    <div class="w-[280px] shrink-0 border-r border-[var(--brand-border-light)] flex flex-col bg-[var(--brand-surface-white)] overflow-hidden">
      <div class="px-4 pt-[18px] pb-3 border-b border-[var(--brand-border-fade)]">
        <div class="text-[15px] font-bold text-[var(--brand-text)] mb-1">Benefits</div>
        <p class="text-[12px] text-[var(--brand-text-quiet)] mb-3">
          Create reusable benefits packages to apply to job postings.
          <a href="#" class="text-[var(--brand-teal)] font-semibold">Learn more</a>
        </p>
        <Button size="sm" class="w-full gap-1.5 bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90" @click="openNewModal">
          <Plus class="w-3.5 h-3.5" />
          New template
        </Button>
      </div>

      <div class="px-3 py-2.5 border-b border-[var(--brand-border-fade)]">
        <BrandSearchBar v-model="search" placeholder="Search templates" size="sm" />
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <p v-if="isLoading && !templates.length" class="px-4 py-4 text-[13px] text-[var(--brand-text-muted)]">Loading…</p>
        <button
          v-for="t in filtered"
          v-else
          :key="t.id"
          class="w-full flex items-center gap-2 mx-1.5 px-3.5 py-[9px] rounded-[8px] text-left text-[13.5px] transition-colors"
          :class="selectedId === t.id
            ? 'bg-[var(--brand-email-highlight-bg)] text-[var(--brand-teal)] font-semibold'
            : 'text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)]'"
          :style="{ width: 'calc(100% - 12px)' }"
          @click="selectedId = t.id"
        >
          <span class="flex-1 truncate">{{ t.name }}</span>
        </button>
      </div>
    </div>

    <!-- RIGHT: editor -->
    <div class="flex-1 flex flex-col min-w-0 bg-[var(--brand-canvas)] overflow-hidden">
      <div v-if="!selected" class="flex-1 flex items-center justify-center text-[13px] text-[var(--brand-text-muted)]">
        Select a template
      </div>
      <template v-else>
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--brand-border-light)] bg-[var(--brand-surface-white)]">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-[16px] font-bold text-[var(--brand-text)]">{{ selected.name }}</span>
              <button type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] transition-colors" title="Rename" @click="openRename">
                <Pencil class="w-[13px] h-[13px]" />
              </button>
            </div>
            <div class="text-[12px] text-[var(--brand-text-quiet)]">Benefits template · {{ savedLabel }}</div>
          </div>
          <div class="flex items-center gap-2">
            <Button size="sm" class="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90 px-5" @click="saveTemplate">
              Save
            </Button>
            <SettingsRowMenu>
              <SettingsRowMenuItem @click="duplicateTemplate">
                <Copy class="w-[14px] h-[14px]" />
                Duplicate
              </SettingsRowMenuItem>
              <SettingsRowMenuItem danger @click="deleteTemplate">
                <Trash2 class="w-[14px] h-[14px]" />
                Delete
              </SettingsRowMenuItem>
            </SettingsRowMenu>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden mb-4">
            <div class="flex items-center gap-1 px-3.5 py-2.5 border-b border-[var(--brand-border-fade)]">
              <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" @click="exec('bold')"><Bold class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" @click="exec('italic')"><Italic class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" @click="exec('underline')"><Underline class="w-3.5 h-3.5" /></button>
            </div>
            <div
              ref="bodyEl"
              contenteditable="true"
              class="px-[18px] py-[18px] min-h-[240px] text-[14px] text-[var(--brand-text)] outline-none leading-[1.8] whitespace-pre-wrap"
            />
          </div>

          <div class="flex items-start gap-2.5 bg-[var(--brand-email-highlight-bg)] border border-[var(--brand-email-highlight-border)] rounded-[10px] px-4 py-3">
            <Info class="w-[15px] h-[15px] text-[var(--brand-badge-settings-text)] shrink-0 mt-0.5" />
            <span class="text-[13px] text-[var(--brand-badge-settings-text)]">
              This template will be available for selection in the Benefits section during job creation. Selecting it will auto-apply all configured benefits to that job.
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- ─────────────── Rename modal ─────────────── -->
    <SettingsRenameModal
      v-model="renameOpen"
      :draft="renameDraft"
      @update:draft="renameDraft = $event"
      @confirm="confirmRename"
    />

    <!-- ─────────────── New template modal ─────────────── -->
    <SettingsFormModal v-model="newModalOpen" title="New benefits template" width="440px">
      <div class="mb-1">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Template name <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="newName"
          type="text"
          class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
          @keyup.enter="createTemplate"
        >
      </div>
      <template #footer>
        <button type="button" class="px-[18px] py-2 text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none" @click="newModalOpen = false">Cancel</button>
        <button type="button" class="px-[22px] py-2 rounded-[8px] bg-[var(--brand-teal)] text-white text-[13.5px] font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newName.trim()" @click="createTemplate">Create</button>
      </template>
    </SettingsFormModal>
  </div>
</template>
