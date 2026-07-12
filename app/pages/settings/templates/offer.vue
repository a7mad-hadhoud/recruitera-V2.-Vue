<script setup lang="ts">
import {
  Plus, Pencil, Trash2, X, Bold, Italic, Underline, Upload, FileText,
  List, ListOrdered, Link2, Eye, Maximize2, Paperclip,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import { BrandSearchBar } from '~/components/brand'
import { useOfferTemplates } from '~/composables/useTemplates'
import type { OfferTemplate } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useOfferTemplates()

// Local editable copy — seeded once from the mock query, then owned client-side
// (matches the same pattern used by the other Templates pages).
const templates = ref<OfferTemplate[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    templates.value = v.data.map(t => ({ ...t }))
    seeded.value = true
  }
}, { immediate: true })

function newId() {
  return `om-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return templates.value
  return templates.value.filter(t => t.name.toLowerCase().includes(q))
})

const DEPARTMENTS = ['Engineering', 'Product', 'Sales', 'Human Resources', 'Marketing']

// ─────────────── Message editor (contenteditable + tokens, like email.vue) ───────────────
const bodyEl = ref<HTMLDivElement | null>(null)
function tokenSpan(token: string) {
  return `<span style="background:var(--brand-email-highlight-bg);color:var(--brand-teal);padding:1px 6px;border-radius:4px;font-size:13px;font-weight:600">[ ${token} ]</span>`
}
function renderBodyHtml(text: string) {
  return text
    .split('\n\n')
    .map(p => `<p style="margin:0 0 10px">${p.replace(/\{\{(.+?)\}\}/g, (_, tok) => tokenSpan(tok.trim()))}</p>`)
    .join('')
}
function exec(cmd: string, value?: string) {
  bodyEl.value?.focus()
  document.execCommand(cmd, false, value)
}
function insertLink() {
  const url = window.prompt('Link URL')
  if (url) exec('createLink', url)
}
function insertToken(token: string) {
  bodyEl.value?.focus()
  document.execCommand('insertHTML', false, `${tokenSpan(token)}&nbsp;`)
}
const TOKENS = ['candidate first name', 'job', 'company', 'HelloSign link', 'user']

const DEFAULT_MESSAGE = 'Dear {{candidate first name}},\n\nIt is my great pleasure to offer you the position of {{job}} at {{company}}.\n\nPlease take a moment to review and sign the document by clicking on the link below:\n\n{{HelloSign link}}\n\nWe look forward to welcoming you onboard.\n\nShould you have any further questions, please do not hesitate to contact me.\n\nSincerely,\n{{user}}'

const previewOpen = ref(false)
const expanded = ref(false)

// ─────────────── New / Edit modal ───────────────
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const activeTab = ref<'offer-doc' | 'add-docs'>('offer-doc')
const form = reactive({
  name: '',
  department: '',
  location: '',
  documentName: '',
  message: '',
})

function openAdd() {
  editingId.value = null
  activeTab.value = 'offer-doc'
  expanded.value = false
  form.name = ''
  form.department = ''
  form.location = ''
  form.documentName = ''
  form.message = DEFAULT_MESSAGE
  modalOpen.value = true
  nextTick(() => { if (bodyEl.value) bodyEl.value.innerHTML = renderBodyHtml(DEFAULT_MESSAGE) })
}
function openEdit(t: OfferTemplate) {
  editingId.value = t.id
  activeTab.value = 'offer-doc'
  form.name = t.name
  form.department = t.department
  form.location = t.location
  form.documentName = t.documentName
  form.message = t.message
  modalOpen.value = true
  nextTick(() => { if (bodyEl.value) bodyEl.value.innerHTML = renderBodyHtml(t.message) })
}

const canSave = computed(() => form.name.trim() && form.documentName)

function saveTemplate() {
  if (!canSave.value) return
  const message = bodyEl.value?.innerText.trim() ?? form.message
  const type: OfferTemplate['type'] = form.documentName ? 'OFFER' : 'SIMPLE'
  if (editingId.value) {
    const idx = templates.value.findIndex(t => t.id === editingId.value)
    if (idx !== -1) {
      templates.value[idx] = {
        ...templates.value[idx]!,
        name: form.name.trim(),
        department: form.department,
        location: form.location.trim(),
        documentName: form.documentName,
        message,
        type,
      }
    }
  }
  else {
    templates.value.unshift({
      id: newId(),
      name: form.name.trim(),
      type,
      department: form.department,
      location: form.location.trim(),
      documentName: form.documentName,
      message,
    })
  }
  modalOpen.value = false
}

function onDocumentChosen(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) form.documentName = file.name
}
function removeDocument() {
  form.documentName = ''
}

// ─────────────── Delete ───────────────
function deleteTemplate(t: OfferTemplate) {
  templates.value = templates.value.filter(x => x.id !== t.id)
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Offer Management"
      subtitle="Create and manage offer letter templates for your hiring process."
      learn-more-href="#"
    />

    <!-- Toolbar -->
    <div class="flex items-center gap-2.5 mb-4">
      <div class="flex-1">
        <BrandSearchBar v-model="search" placeholder="Search templates" />
      </div>
      <span class="text-[13.5px] text-[var(--brand-text-muted)] whitespace-nowrap">
        <strong class="text-[var(--brand-text)]">{{ filtered.length ? 1 : 0 }}–{{ filtered.length }}</strong> of <strong class="text-[var(--brand-text)]">{{ templates.length }}</strong> templates
      </span>
      <Button size="sm" class="gap-1.5 bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90" @click="openAdd">
        <Plus class="w-3.5 h-3.5" />
        New template
      </Button>
    </div>

    <!-- Template cards -->
    <p v-if="isLoading && !templates.length" class="text-[13px] text-[var(--brand-text-muted)] py-6 text-center">Loading…</p>
    <p v-else-if="!filtered.length" class="text-[13px] text-[var(--brand-text-muted)] py-6 text-center">No offer templates match.</p>
    <div v-else class="flex flex-col gap-2.5">
      <div
        v-for="t in filtered"
        :key="t.id"
        class="flex items-center gap-3.5 px-5 py-[18px] border-[1.5px] border-[var(--brand-border-light)] rounded-[12px] bg-[var(--brand-surface-white)] cursor-pointer hover:border-[var(--brand-border-mid)] transition-colors"
        @click="openEdit(t)"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[15px] font-bold text-[var(--brand-text)]">{{ t.name }}</span>
            <span
              class="text-[11px] font-bold rounded-[6px] px-2 py-[2px] tracking-[0.04em]"
              :class="t.type === 'OFFER'
                ? 'bg-[var(--brand-status-approved-bg)] text-[var(--brand-status-approved-text)]'
                : 'bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] border border-[var(--brand-border)]'"
            >
              {{ t.type }}
            </span>
          </div>
          <div class="text-[13px] text-[var(--brand-text-quiet)]">
            {{ t.department || 'All departments' }} · {{ t.location || 'All locations' }}
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0" @click.stop>
          <button
            type="button"
            class="inline-flex items-center justify-center w-[34px] h-[34px] rounded-full border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
            title="Edit"
            @click="openEdit(t)"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center w-[34px] h-[34px] rounded-full border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors"
            title="Delete"
            @click="deleteTemplate(t)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- ─────────────── New / Edit modal ─────────────── -->
    <SettingsFormModal
      v-model="modalOpen"
      :title="editingId ? 'Edit offer template' : 'New offer template'"
      :width="expanded ? '900px' : '660px'"
      scrollable
    >
      <div class="mb-[22px]">
        <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">
          <span class="text-[var(--brand-settings-danger)]">*</span> Name
        </label>
        <input
          v-model="form.name"
          type="text"
          class="w-full box-border px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
        <p class="text-[12.5px] text-[var(--brand-text-quiet)] mt-1.5">Give the template a unique name to help identify it in the future, eg: Sales Manager Offer.</p>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-[22px]">
        <div>
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">Department</label>
          <select
            v-model="form.department"
            class="w-full box-border px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
          >
            <option value="" />
            <option v-for="d in DEPARTMENTS" :key="d" :value="d">{{ d }}</option>
          </select>
          <p class="text-[12.5px] text-[var(--brand-text-quiet)] mt-1.5">If no department is selected, the template will be available for all jobs in all departments.</p>
        </div>
        <div>
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">Location</label>
          <input
            v-model="form.location"
            type="text"
            class="w-full box-border px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
          >
          <p class="text-[12.5px] text-[var(--brand-text-quiet)] mt-1.5">If no location is selected, the template will be available for all jobs in all locations.</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b-[1.5px] border-[var(--brand-border-light)] mb-5">
        <button
          type="button"
          class="border-0 border-b-[2.5px] px-[18px] py-2.5 text-[14px] outline-none -mb-[1.5px] transition-colors"
          :class="activeTab === 'offer-doc' ? 'border-[var(--brand-teal)] font-bold text-[var(--brand-text)]' : 'border-transparent font-medium text-[var(--brand-text-quiet)]'"
          @click="activeTab = 'offer-doc'"
        >
          Offer document
        </button>
        <button
          type="button"
          class="border-0 border-b-[2.5px] px-[18px] py-2.5 text-[14px] outline-none -mb-[1.5px] transition-colors"
          :class="activeTab === 'add-docs' ? 'border-[var(--brand-teal)] font-bold text-[var(--brand-text)]' : 'border-transparent font-medium text-[var(--brand-text-quiet)]'"
          @click="activeTab = 'add-docs'"
        >
          Additional documents
        </button>
      </div>

      <div v-if="activeTab === 'offer-doc'">
        <div class="mb-[18px]">
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">
            <span class="text-[var(--brand-settings-danger)]">*</span> Document
          </label>

          <div v-if="form.documentName" class="flex items-center gap-3 border-[1.5px] border-[var(--brand-border)] rounded-[12px] px-4 py-3 bg-[var(--brand-surface-white)]">
            <FileText class="w-4 h-4 text-[var(--brand-badge-settings-text)] shrink-0" />
            <span class="flex-1 text-[13.5px] text-[var(--brand-text)] truncate">{{ form.documentName }}</span>
            <button type="button" class="text-[var(--brand-icon-muted)] outline-none hover:text-[var(--brand-settings-danger)] p-1" @click="removeDocument">
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
          <label v-else class="block border-[1.5px] border-dashed border-[var(--brand-border)] rounded-[12px] px-5 py-10 text-center cursor-pointer bg-[var(--brand-canvas)]">
            <div class="w-[52px] h-[52px] rounded-full bg-[var(--brand-badge-settings-bg)] flex items-center justify-center mx-auto mb-3.5">
              <Upload class="w-[22px] h-[22px] text-[var(--brand-badge-settings-text)]" />
            </div>
            <span class="text-[14px] text-[var(--brand-text-secondary)]">
              <span class="text-[var(--brand-teal)] font-bold underline">Choose file</span> or drag and drop here
            </span>
            <input type="file" accept=".docx" class="hidden" @change="onDocumentChosen">
          </label>
          <p class="text-[12.5px] text-[var(--brand-text-quiet)] mt-1.5">Only .docx file is allowed, maximum 1 file.</p>
        </div>

        <div>
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">
            <span class="text-[var(--brand-settings-danger)]">*</span> Message
          </label>
          <div class="border-[1.5px] border-[var(--brand-border)] rounded-[12px] overflow-hidden bg-[var(--brand-surface-white)]">
            <div class="flex items-center gap-1 px-3.5 py-2.5 border-b border-[var(--brand-border-fade)] bg-[var(--brand-canvas)]">
              <label class="w-7 h-7 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors cursor-pointer" title="Attach">
                <Paperclip class="w-3.5 h-3.5" />
                <input type="file" class="hidden">
              </label>
              <button type="button" class="w-7 h-7 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Bold" @click="exec('bold')"><Bold class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-7 h-7 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Italic" @click="exec('italic')"><Italic class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-7 h-7 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Underline" @click="exec('underline')"><Underline class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-7 h-7 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Bullet list" @click="exec('insertUnorderedList')"><List class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-7 h-7 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Numbered list" @click="exec('insertOrderedList')"><ListOrdered class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-7 h-7 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Insert link" @click="insertLink"><Link2 class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-7 h-7 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Preview" @click="previewOpen = true"><Eye class="w-3.5 h-3.5" /></button>
              <span class="flex-1"></span>
              <button type="button" class="w-7 h-7 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" :title="expanded ? 'Shrink' : 'Expand'" @click="expanded = !expanded"><Maximize2 class="w-3.5 h-3.5" /></button>
            </div>
            <div
              ref="bodyEl"
              contenteditable="true"
              class="px-4 py-4 min-h-[200px] text-[14px] text-[var(--brand-text)] outline-none leading-[1.7]"
            />
            <div class="px-3.5 py-2.5 border-t border-[var(--brand-border-fade)] flex items-center gap-2 flex-wrap">
              <span class="text-[12.5px] font-medium text-[var(--brand-text-quiet)] mr-1">Insert placeholder</span>
              <button
                v-for="tok in TOKENS"
                :key="tok"
                type="button"
                class="bg-[var(--brand-canvas)] border border-[var(--brand-border)] rounded-[8px] px-3 py-1 text-[12.5px] font-semibold text-[var(--brand-teal)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors"
                @click="insertToken(tok)"
              >
                [ {{ tok }} ]
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-10 text-[14px] text-[var(--brand-text-quiet)]">
        No additional documents yet.
      </div>

      <template #footer>
        <button type="button" class="px-4 py-2.5 text-[14px] font-semibold text-[var(--brand-nav-text)] outline-none" @click="modalOpen = false">Cancel</button>
        <button type="button" class="px-7 py-2.5 rounded-[10px] bg-[var(--brand-teal)] text-white text-[14px] font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!canSave" @click="saveTemplate">Save template</button>
      </template>
    </SettingsFormModal>

    <!-- ─────────────── Preview modal ─────────────── -->
    <SettingsFormModal v-model="previewOpen" :title="`Preview · ${form.name || 'Offer template'}`" width="560px">
      <div class="max-h-[60vh] overflow-y-auto -mx-1 px-1">
        <div v-if="form.documentName" class="flex items-center gap-3 border-[1.5px] border-[var(--brand-border-light)] rounded-[10px] px-4 py-3 bg-[var(--brand-canvas)] mb-4">
          <FileText class="w-4 h-4 text-[var(--brand-badge-settings-text)] shrink-0" />
          <span class="flex-1 text-[13.5px] text-[var(--brand-text)] truncate">{{ form.documentName }}</span>
        </div>
        <div class="text-[14px] text-[var(--brand-text)] leading-[1.7] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[10px] px-4 py-4" v-html="renderBodyHtml(bodyEl?.innerText ?? form.message)" />
      </div>
      <template #footer>
        <button type="button" class="px-7 py-2.5 rounded-[10px] bg-[var(--brand-teal)] text-white text-[14px] font-bold outline-none" @click="previewOpen = false">Close</button>
      </template>
    </SettingsFormModal>
  </div>
</template>
