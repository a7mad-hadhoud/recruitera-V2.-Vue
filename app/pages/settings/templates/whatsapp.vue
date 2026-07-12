<script setup lang="ts">
import { TableCell, TableHead, TableRow } from '~/components/ui/table'
import { Pencil, Plus, Trash2, Info } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsTable from '~/components/settings/SettingsTable.vue'
import SettingsTableSkeleton from '~/components/settings/SettingsTableSkeleton.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import { useWhatsAppTemplates } from '~/composables/useTemplates'
import type { WhatsAppCategory, WhatsAppStatus, WhatsAppTemplate, WhatsAppType } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useWhatsAppTemplates()

const templates = ref<WhatsAppTemplate[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    templates.value = v.data.map(t => ({ ...t }))
    seeded.value = true
  }
}, { immediate: true })

const total = computed(() => templates.value.length)
const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return templates.value
  return templates.value.filter(t =>
    t.name.toLowerCase().includes(q)
    || t.language.toLowerCase().includes(q)
    || t.category.toLowerCase().includes(q),
  )
})

function newId() {
  return `wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─────────────── Status pill styling ───────────────
// NOTE: Tailwind's JIT extractor is text-based and can silently miss arbitrary
// utilities when they only appear inside object literals (like a Record<>),
// so these classes are emitted directly in the template with a v-if switch
// where the extractor is guaranteed to see them.

// ─────────────── Add / Edit modal ───────────────
const LANGUAGES = ['Arabic (ar)', 'English (en)', 'English (en_US)', 'French (fr)']
const CATEGORIES: WhatsAppCategory[] = ['Utility', 'Marketing', 'Authentication']
const TYPES: { value: WhatsAppType, label: string }[] = [
  { value: 'message', label: 'Message' },
  { value: 'event', label: 'Event invitation' },
]
const VARIABLES = ['candidate_name', 'job_title', 'company_name', 'event_date', 'scheduling_link']

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<{ name: string; type: WhatsAppType; language: string; category: WhatsAppCategory; body: string }>({
  name: '',
  type: 'message',
  language: '',
  category: 'Utility',
  body: '',
})
const bodyRef = ref<HTMLTextAreaElement | null>(null)

function openAddModal() {
  editingId.value = null
  form.name = ''
  form.type = 'message'
  form.language = ''
  form.category = 'Utility'
  form.body = ''
  modalOpen.value = true
}
function openEditModal(t: WhatsAppTemplate) {
  editingId.value = t.id
  form.name = t.name
  form.type = t.type
  form.language = t.language
  form.category = t.category
  form.body = t.body
  modalOpen.value = true
}

const canSubmit = computed(() => form.name.trim() && form.language && form.body.trim())

function submitTemplate() {
  if (!canSubmit.value) return
  if (editingId.value) {
    const idx = templates.value.findIndex(t => t.id === editingId.value)
    if (idx !== -1) {
      templates.value[idx] = {
        ...templates.value[idx]!,
        name: form.name.trim(),
        type: form.type,
        language: form.language,
        category: form.category,
        body: form.body,
      }
    }
  }
  else {
    templates.value.unshift({
      id: newId(),
      name: form.name.trim(),
      type: form.type,
      language: form.language,
      category: form.category,
      body: form.body,
      status: 'Pending',
    })
  }
  modalOpen.value = false
}

function deleteTemplate(t: WhatsAppTemplate) {
  templates.value = templates.value.filter(x => x.id !== t.id)
}

function insertVariable(v: string) {
  const el = bodyRef.value
  if (!el) return
  const token = `{{${v}}}`
  const start = el.selectionStart ?? form.body.length
  const end = el.selectionEnd ?? form.body.length
  form.body = form.body.slice(0, start) + token + form.body.slice(end)
  nextTick(() => {
    el.focus()
    const pos = start + token.length
    el.setSelectionRange(pos, pos)
  })
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="WhatsApp templates"
      subtitle="Build reusable WhatsApp message templates for candidate communication."
      learn-more-href="#"
    />

    <SettingsTable
      search-placeholder="Search templates"
      item-label="templates"
      :total="total"
      :filtered-count="filtered.length"
      :loading="isLoading"
      :empty="!isLoading && !filtered.length"
      empty-message="No WhatsApp templates match."
      :colspan="4"
      @update:search="v => search = v"
    >
      <template #actions>
        <BrandButton variant="primary-teal" @click="openAddModal">
          <Plus class="w-4 h-4 mr-1" />
          New template
        </BrandButton>
      </template>
      <template #header>
        <TableRow class="bg-[var(--brand-surface-table-alt)] border-b border-[var(--brand-border-light)]">
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Template name</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Language · Category</TableHead>
          <TableHead class="py-[14px] px-5 text-[13px] font-semibold text-[var(--brand-nav-text)] border-r border-[var(--brand-border-hairline)]">Status</TableHead>
          <TableHead class="py-[14px] px-5 text-right text-[13px] font-semibold text-[var(--brand-nav-text)]">Actions</TableHead>
        </TableRow>
      </template>

      <SettingsTableSkeleton v-if="isLoading" :columns="4" :rows="3" />
      <TableRow
        v-for="(t, i) in filtered"
        v-else
        :key="t.id"
        class="border-b border-[var(--brand-border-row)] last:border-0"
        :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]/60' : ''"
      >
        <TableCell class="py-[11px] px-5 font-semibold text-[14px] text-[var(--brand-text)] border-r border-[var(--brand-border-hairline)]">{{ t.name }}</TableCell>
        <TableCell class="py-[11px] px-5 text-[13.5px] text-[var(--brand-text-muted)] border-r border-[var(--brand-border-hairline)]">{{ t.language }} · {{ t.category }}</TableCell>
        <TableCell class="py-[11px] px-5 border-r border-[var(--brand-border-hairline)]">
          <!-- Inline `style` for status pill colors: the CSS custom properties
               are defined in main.css but Tailwind's JIT can't reliably pick
               up new arbitrary `bg-[var(...)]` classes here without a full
               server restart, so we bind directly to the resolved variables. -->
          <span
            class="inline-block text-[12px] font-bold rounded-[6px] px-2 py-[3px]"
            :style="t.status === 'Approved'
              ? { background: 'var(--brand-status-approved-bg)', color: 'var(--brand-status-approved-text)' }
              : t.status === 'Pending'
                ? { background: 'var(--brand-status-pending-bg)', color: 'var(--brand-status-pending-text)' }
                : { background: 'var(--brand-canvas)', color: 'var(--brand-text-quiet)' }"
          >
            {{ t.status }}
          </span>
        </TableCell>
        <TableCell class="py-[11px] px-5 text-right">
          <div class="flex items-center gap-1.5 justify-end">
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
              @click="openEditModal(t)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              class="inline-flex items-center justify-center px-[9px] py-[5px] rounded-[9px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors"
              @click="deleteTemplate(t)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </TableCell>
      </TableRow>
    </SettingsTable>

    <!-- ─────────────── Add / Edit modal ─────────────── -->
    <SettingsFormModal
      v-model="modalOpen"
      :title="editingId ? 'Edit template' : 'Add New Template'"
      width="680px"
    >
      <!-- Row 1: Name + Type -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
            Name your template <span class="text-[var(--brand-settings-danger)]">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Enter a template name..."
            class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
          >
        </div>
        <div>
          <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
            Type <span class="text-[var(--brand-settings-danger)]">*</span>
          </label>
          <select
            v-model="form.type"
            class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-teal)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
          >
            <option v-for="opt in TYPES" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>

      <!-- Row 2: Language + Category -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
            Select Language <span class="text-[var(--brand-settings-danger)]">*</span>
          </label>
          <select
            v-model="form.language"
            class="w-full box-border px-3.5 py-2.5 rounded-[10px] border border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
          >
            <option value="">Choose language</option>
            <option v-for="l in LANGUAGES" :key="l" :value="l">{{ l }}</option>
          </select>
        </div>
        <div>
          <label class="flex items-center gap-1.5 text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
            Select Category <span class="text-[var(--brand-settings-danger)]">*</span>
            <Info class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" title="Categories determine how WhatsApp classifies and prices your template." />
          </label>
          <select
            v-model="form.category"
            class="w-full box-border px-3.5 py-2.5 rounded-[10px] border border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
          >
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <!-- Body -->
      <div>
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-1">
          Body <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <p class="text-[12.5px] text-[var(--brand-text-quiet)] mb-2">Variables can't be at the start or end of the template.</p>
        <div class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden">
          <textarea
            ref="bodyRef"
            v-model="form.body"
            placeholder="Type here..."
            class="w-full box-border border-0 outline-none px-4 py-3.5 text-[14px] text-[var(--brand-text)] bg-transparent resize-y leading-[1.6]"
            style="min-height:140px"
          />
          <div class="px-3.5 py-2.5 border-t border-[var(--brand-border-fade)] flex gap-2 flex-wrap">
            <button
              v-for="v in VARIABLES"
              :key="v"
              type="button"
              class="bg-[var(--brand-canvas)] border border-[var(--brand-border)] rounded-[8px] px-3 py-1 text-[12.5px] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors"
              @click="insertVariable(v)"
            >
              {{ v }}
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-[18px] py-2.5 text-[14px] font-semibold text-[var(--brand-nav-text)] outline-none"
          @click="modalOpen = false"
        >
          Discard
        </button>
        <button
          type="button"
          class="px-6 py-2.5 rounded-[10px] bg-[var(--brand-teal)] text-white text-[14px] font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSubmit"
          @click="submitTemplate"
        >
          {{ editingId ? 'Save' : 'Submit for review' }}
        </button>
      </template>
    </SettingsFormModal>
  </div>
</template>
