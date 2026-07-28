<script setup lang="ts">
import {
  Bold, Italic, Underline, Link2, Image as ImageIcon, ChevronDown, MoreHorizontal,
  Search, Plus, Star, Pencil, Paperclip, X, Info, ListChecks, Clock, Calendar, Mail,
  Copy, ExternalLink,
} from 'lucide-vue-next'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsRowMenu from '~/components/settings/SettingsRowMenu.vue'
import SettingsRowMenuItem from '~/components/settings/SettingsRowMenuItem.vue'
import SettingsDuplicatePickerModal from '~/components/settings/SettingsDuplicatePickerModal.vue'
import EmailComposer from '~/components/EmailComposer.vue'
import { BrandButton, BrandSearchBar } from '~/components/brand'
import { useEmailTemplates } from '~/composables/useTemplates'
import type { EmailTemplate, TemplateCategory } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useEmailTemplates()

// Local editable copy — seeded once from the mock query, then owned client-side
// (matches the same pattern used by locations.vue / job-titles.vue).
const templates = ref<EmailTemplate[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    templates.value = v.data.map(t => ({ ...t }))
    seeded.value = true
  }
}, { immediate: true })

const categoryOrder: TemplateCategory[] = ['auto-confirmation', 'event-invitation', 'general']
const categoryLabels: Record<TemplateCategory, string> = {
  'auto-confirmation': 'Auto-confirmation',
  'event-invitation': 'Event invitation',
  'general': 'General',
}

const CATEGORY_OPTIONS: { value: TemplateCategory, label: string, desc: string, icon: typeof Mail }[] = [
  { value: 'general', label: 'General', desc: 'Templates for general purposes that will speed up your workflow', icon: Mail },
  { value: 'auto-confirmation', label: 'Auto-confirmation', desc: 'Templates for auto-confirmation emails in jobs', icon: Clock },
  { value: 'event-invitation', label: 'Event invitation', desc: 'Templates for scheduling events with candidates', icon: Calendar },
]

const grouped = computed(() => {
  const map = new Map<string, EmailTemplate[]>()
  const order: string[] = [...categoryOrder]
  for (const cat of categoryOrder) map.set(cat, [])
  for (const t of templates.value) {
    if (!map.has(t.category)) { map.set(t.category, []); order.push(t.category) }
    map.get(t.category)!.push(t)
  }
  return order.map(c => ({ category: c as TemplateCategory, items: map.get(c) ?? [] }))
})

const search = ref('')
const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return grouped.value
  return grouped.value
    .map(g => ({ ...g, items: g.items.filter(t => t.name.toLowerCase().includes(q)) }))
    .filter(g => g.items.length > 0)
})

const selectedId = ref<string | null>(null)
watch(templates, (arr) => {
  if (!selectedId.value && arr.length) {
    selectedId.value = arr.find(t => t.isDefault)?.id ?? arr[0]!.id
  }
}, { immediate: true })

const selected = computed(() => templates.value.find(t => t.id === selectedId.value) ?? null)

function newId() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─────────────── Editor state ───────────────
// The editor UI lives in the shared <EmailComposer>; this page just owns the
// subject + body (HTML) models and syncs them with the selected template.
const subjectDraft = ref('')
const bodyHtml = ref('')
const savedLabel = ref('Saved 16 days ago')

function tokenSpan(token: string) {
  return `<span contenteditable="false" style="background:var(--brand-email-highlight-bg);color:var(--brand-teal);padding:1px 6px;border-radius:4px;font-size:13px;font-weight:600">[ ${token} ]</span>`
}
function renderBodyHtml(text: string) {
  return text
    .split('\n\n')
    .map(p => `<p>${p.replace(/\{\{(.+?)\}\}/g, (_, tok) => tokenSpan(tok.trim()))}</p>`)
    .join('')
}

watch(selected, (t) => {
  subjectDraft.value = t?.subject ?? ''
  savedLabel.value = 'Saved 16 days ago'
  // Stored fixture bodies use {{token}} + blank-line paragraphs; a re-saved
  // body is already HTML — detect and pass through so we don't double-encode.
  bodyHtml.value = t ? (t.body.includes('<') ? t.body : renderBodyHtml(t.body)) : ''
}, { immediate: true })

function saveTemplate() {
  if (!selected.value) return
  const idx = templates.value.findIndex(t => t.id === selected.value!.id)
  if (idx === -1) return
  templates.value[idx] = {
    ...templates.value[idx],
    subject: subjectDraft.value,
    body: bodyHtml.value,
  }
  savedLabel.value = 'Saved just now'
}

// ─────────────── Rename / recategorize ───────────────
const renameOpen = ref(false)
const renameDraft = ref('')
const renameCategory = ref<string>('general')
const creatingCategory = ref(false)
const newCategoryName = ref('')
const customCategories = ref<{ value: string, label: string }[]>([])
const allCategoryOptions = computed(() => [
  ...CATEGORY_OPTIONS.map(c => ({ value: c.value as string, label: c.label })),
  ...customCategories.value,
])
function catLabel(cat: string) {
  return categoryLabels[cat as TemplateCategory] ?? customCategories.value.find(c => c.value === cat)?.label ?? cat
}
function openRename() {
  if (!selected.value) return
  renameDraft.value = selected.value.name
  renameCategory.value = selected.value.category
  creatingCategory.value = false
  newCategoryName.value = ''
  renameOpen.value = true
}
function confirmRename() {
  if (!selected.value || !renameDraft.value.trim()) return
  let cat = renameCategory.value
  if (creatingCategory.value && newCategoryName.value.trim()) {
    const val = newCategoryName.value.trim()
    if (!customCategories.value.some(c => c.value === val)) customCategories.value.push({ value: val, label: val })
    cat = val
  }
  const idx = templates.value.findIndex(t => t.id === selected.value!.id)
  templates.value[idx] = { ...templates.value[idx], name: renameDraft.value.trim(), category: cat as TemplateCategory }
  renameOpen.value = false
}

// ─────────────── New template flow ───────────────
const newStep = ref<'closed' | 'choose' | 'blank' | 'duplicate'>('closed')
const blankName = ref('')
const blankCategory = ref<TemplateCategory>('general')
const catMenuOpen = ref(false)

function openNewTemplate() {
  newStep.value = 'choose'
}
function chooseBlank() {
  blankName.value = ''
  blankCategory.value = 'general'
  newStep.value = 'blank'
}
function chooseDuplicate() {
  dupSearch.value = ''
  dupSelectedId.value = null
  newStep.value = 'duplicate'
}
function createBlank() {
  if (!blankName.value.trim()) return
  const t: EmailTemplate = {
    id: newId(),
    name: blankName.value.trim(),
    category: blankCategory.value,
    subject: '',
    body: '',
    isDefault: false,
  }
  templates.value.unshift(t)
  selectedId.value = t.id
  newStep.value = 'closed'
}

const dupSearch = ref('')
const dupSelectedId = ref<string | null>(null)
const dupFiltered = computed(() => {
  const q = dupSearch.value.trim().toLowerCase()
  if (!q) return templates.value
  return templates.value.filter(t => t.name.toLowerCase().includes(q))
})
function duplicateFrom(source: EmailTemplate) {
  const t: EmailTemplate = {
    ...source,
    id: newId(),
    name: `${source.name} (Copy)`,
    category: 'general',
    isDefault: false,
  }
  templates.value.unshift(t)
  selectedId.value = t.id
}
function confirmDuplicate() {
  const src = templates.value.find(t => t.id === dupSelectedId.value)
  if (!src) return
  duplicateFrom(src)
  newStep.value = 'closed'
}
function quickDuplicate() {
  if (!selected.value) return
  duplicateFrom(selected.value)
}

// ─────────────── Jobs-usage modal ───────────────
const jobsModalOpen = ref(false)
const jobsTab = ref<'jobs' | 'templates'>('jobs')
const jobsSearch = ref('')
const SAMPLE_JOBS = [
  { name: 'Senior Marketer (Sample)', location: 'Riyadh', color: 'var(--brand-settings-status-active)' },
  { name: 'Backend Engineer (Sample)', location: 'Remote', color: 'var(--brand-status-teal-green)' },
  { name: 'Product Manager (Sample)', location: 'Dubai', color: 'var(--brand-status-orange)' },
  { name: 'Sales Representative (Sample)', location: 'Cairo', color: 'var(--brand-status-gray)' },
  { name: 'UX Designer (Sample)', location: 'Riyadh', color: 'var(--brand-settings-status-active)' },
  { name: 'Data Analyst (Sample)', location: 'Remote', color: 'var(--brand-status-gray)' },
]
const SAMPLE_JOB_TEMPLATES = [
  { name: 'Standard Engineering Template', location: '3 open roles', color: 'var(--brand-status-teal-green)' },
  { name: 'Sales Hiring Template', location: '2 open roles', color: 'var(--brand-status-orange)' },
  { name: 'Marketing Hiring Template', location: '1 open role', color: 'var(--brand-status-gray)' },
]
const jobsFiltered = computed(() => {
  const list = jobsTab.value === 'jobs' ? SAMPLE_JOBS : SAMPLE_JOB_TEMPLATES
  const q = jobsSearch.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(j => j.name.toLowerCase().includes(q))
})
</script>

<template>
  <div class="flex h-[calc(100vh-120px)] min-h-[600px] -m-6 overflow-hidden">
    <!-- LEFT: template list -->
    <div class="w-[280px] shrink-0 border-r border-[var(--brand-border-light)] flex flex-col bg-[var(--brand-surface-white)] overflow-hidden">
      <div class="px-4 pt-[18px] pb-3 border-b border-[var(--brand-border-fade)]">
        <div class="text-[15px] font-bold text-[var(--brand-text)] mb-1">Email templates</div>
        <p class="text-[12px] text-[var(--brand-text-quiet)] mb-3">
          Use email templates for all types of emails at various stages of the recruitment process.
          <a href="#" class="text-[var(--brand-teal)] font-semibold">Learn more</a>
        </p>
        <Button size="sm" class="w-full gap-1.5 bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90" @click="openNewTemplate">
          <Plus class="w-3.5 h-3.5" />
          New template
        </Button>
      </div>

      <div class="px-3 py-2.5 border-b border-[var(--brand-border-fade)]">
        <BrandSearchBar v-model="search" placeholder="Search templates" size="sm" />
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <p v-if="isLoading && !templates.length" class="px-4 py-4 text-[13px] text-[var(--brand-text-muted)]">Loading…</p>
        <template v-else>
          <div v-for="g in filteredGroups" :key="g.category" class="mb-1">
            <div class="px-4 py-1 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[var(--brand-text-quiet)]">
              {{ catLabel(g.category).toUpperCase() }}
            </div>
            <button
              v-for="t in g.items"
              :key="t.id"
              class="w-full flex items-center justify-between gap-2 mx-1.5 px-3.5 py-[9px] rounded-[8px] text-left text-[13.5px] transition-colors"
              :class="selectedId === t.id
                ? 'bg-[var(--brand-email-highlight-bg)] text-[var(--brand-teal)] font-semibold'
                : 'text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)]'"
              :style="{ width: 'calc(100% - 12px)' }"
              @click="selectedId = t.id"
            >
              <span class="flex-1 truncate">{{ t.name }}</span>
              <Star v-if="t.isDefault" class="w-3.5 h-3.5 shrink-0 fill-[var(--brand-lime)] text-[var(--brand-badge-settings-text)]" />
            </button>
          </div>
        </template>
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
            <div class="text-[12px] text-[var(--brand-text-quiet)]">{{ selected.name }} · {{ savedLabel }}</div>
          </div>
          <div class="flex items-center gap-2">
            <Button size="sm" class="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90 px-5" @click="saveTemplate">
              Save
            </Button>
            <SettingsRowMenu>
              <div class="p-3.5 -m-1.5 mb-1.5 border-b border-[var(--brand-border-fade)]">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[13.5px] font-bold text-[var(--brand-text)]">Used in 6 jobs, 3 templates</span>
                  <button type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] transition-colors" @click="jobsModalOpen = true; jobsTab = 'jobs'">
                    <ExternalLink class="w-3.5 h-3.5" />
                  </button>
                </div>
                <p class="text-[12px] text-[var(--brand-text-quiet)] leading-relaxed">View jobs and job templates that use this template. This template cannot be deleted.</p>
              </div>
              <SettingsRowMenuItem @click="quickDuplicate">
                <Copy class="w-[15px] h-[15px] text-[var(--brand-nav-text)]" />
                Duplicate
              </SettingsRowMenuItem>
            </SettingsRowMenu>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <EmailComposer v-model:subject="subjectDraft" v-model:body="bodyHtml" />

          <div class="flex items-start gap-2.5 bg-[var(--brand-email-highlight-bg)] border border-[var(--brand-email-highlight-border)] rounded-[10px] px-4 py-3">
            <Info class="w-[15px] h-[15px] text-[var(--brand-badge-settings-text)] shrink-0 mt-0.5" />
            <span class="text-[13px] text-[var(--brand-badge-settings-text)]">
              This email will be sent automatically to all candidates after they apply.
              <a href="#" class="text-[var(--brand-teal)] font-semibold">Learn more</a>
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- ─────────────── Rename / recategorize modal ─────────────── -->
    <SettingsFormModal v-model="renameOpen" title="Rename template" width="480px">
      <div class="space-y-4">
        <label class="block">
          <span class="block text-[13px] font-semibold text-[var(--brand-text-secondary)] mb-1.5">Template name</span>
          <input
            v-model="renameDraft"
            type="text"
            class="w-full box-border h-11 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] px-3.5 text-[14px] text-[var(--brand-text)] outline-none focus:border-[var(--brand-teal)] transition-colors"
          >
        </label>
        <div>
          <span class="block text-[13px] font-semibold text-[var(--brand-text-secondary)] mb-1.5">Category</span>
          <template v-if="!creatingCategory">
            <select
              v-model="renameCategory"
              class="w-full box-border h-11 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] px-3 text-[14px] text-[var(--brand-text)] outline-none focus:border-[var(--brand-teal)] transition-colors"
            >
              <option v-for="c in allCategoryOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
            <button
              type="button"
              class="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-teal-secondary)] hover:underline"
              @click="creatingCategory = true"
            >
              <Plus class="w-3.5 h-3.5" />Create new category
            </button>
          </template>
          <div v-else class="flex items-center gap-2">
            <input
              v-model="newCategoryName"
              type="text"
              placeholder="New category name"
              class="flex-1 box-border h-11 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] px-3.5 text-[14px] text-[var(--brand-text)] outline-none focus:border-[var(--brand-teal)] transition-colors"
            >
            <button type="button" class="shrink-0 text-[13px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]" @click="creatingCategory = false; newCategoryName = ''">Cancel</button>
          </div>
        </div>
      </div>
      <template #footer>
        <BrandButton variant="ghost" @click="renameOpen = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" :disabled="!renameDraft.trim() || (creatingCategory && !newCategoryName.trim())" @click="confirmRename">Save</BrandButton>
      </template>
    </SettingsFormModal>

    <!-- ─────────────── Step 1: choose blank vs duplicate ─────────────── -->
    <SettingsFormModal :model-value="newStep === 'choose'" title="Create new template" width="520px" @update:model-value="v => !v && newStep === 'choose' && (newStep = 'closed')">
      <p class="text-[13px] text-[var(--brand-text-quiet)] mb-5 -mt-3">Create a blank template or duplicate an existing one.</p>
      <div class="flex flex-col gap-2.5">
        <button
          type="button"
          class="flex items-center gap-3.5 border border-[var(--brand-border-light)] rounded-[12px] px-[18px] py-4 text-left outline-none hover:shadow-[0_4px_16px_rgba(0,36,39,0.1)] hover:border-[var(--brand-border-mid)] transition-all"
          @click="chooseBlank"
        >
          <div class="w-10 h-10 rounded-[10px] bg-[var(--brand-badge-settings-bg)] flex items-center justify-center shrink-0">
            <Pencil class="w-[18px] h-[18px] text-[var(--brand-badge-settings-text)]" />
          </div>
          <div class="flex-1">
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">Blank template</div>
            <div class="text-[12.5px] text-[var(--brand-text-quiet)]">Start from scratch.</div>
          </div>
        </button>
        <button
          type="button"
          class="flex items-center gap-3.5 border border-[var(--brand-border-light)] rounded-[12px] px-[18px] py-4 text-left outline-none hover:shadow-[0_4px_16px_rgba(0,36,39,0.1)] hover:border-[var(--brand-border-mid)] transition-all"
          @click="chooseDuplicate"
        >
          <div class="w-10 h-10 rounded-[10px] bg-[var(--brand-badge-settings-bg)] flex items-center justify-center shrink-0">
            <Copy class="w-[18px] h-[18px] text-[var(--brand-badge-settings-text)]" />
          </div>
          <div class="flex-1">
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">Duplicate an existing template</div>
            <div class="text-[12.5px] text-[var(--brand-text-quiet)]">Use an existing template as a starting point. Customize it as needed.</div>
          </div>
        </button>
      </div>
    </SettingsFormModal>

    <!-- ─────────────── Step 2: blank template details ─────────────── -->
    <SettingsFormModal :model-value="newStep === 'blank'" title="Create email template" width="480px" @update:model-value="v => !v && newStep === 'blank' && (newStep = 'closed')">
      <div class="mb-5">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Template name <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="blankName"
          type="text"
          class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
      </div>
      <div class="relative">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">Template category</label>
        <button
          type="button"
          class="flex items-center justify-between w-full border-[1.5px] border-[var(--brand-teal)] rounded-[10px] px-3.5 py-2.5 bg-[var(--brand-surface-white)] outline-none"
          @click="catMenuOpen = !catMenuOpen"
        >
          <span class="text-[14px] text-[var(--brand-text)]">{{ CATEGORY_OPTIONS.find(c => c.value === blankCategory)?.label }}</span>
          <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" />
        </button>
        <div v-if="catMenuOpen" class="absolute left-0 right-0 top-[calc(100%+4px)] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[12px] shadow-[var(--brand-settings-dropdown-shadow)] overflow-hidden z-10">
          <button
            v-for="opt in CATEGORY_OPTIONS"
            :key="opt.value"
            type="button"
            class="flex items-start gap-3 w-full px-4 py-3.5 border-b border-[var(--brand-border-fade)] last:border-0 outline-none text-left hover:bg-[var(--brand-surface-hover)] transition-colors"
            @click="blankCategory = opt.value; catMenuOpen = false"
          >
            <component :is="opt.icon" class="w-4 h-4 text-[var(--brand-nav-text)] mt-0.5 shrink-0" />
            <div>
              <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ opt.label }}</div>
              <div class="text-[12px] text-[var(--brand-text-quiet)] mt-0.5">{{ opt.desc }}</div>
            </div>
          </button>
        </div>
      </div>
      <template #footer>
        <BrandButton type="button" variant="ghost" size="md" @click="newStep = 'closed'">Cancel</BrandButton>
        <BrandButton type="button" variant="primary-teal" size="md" :disabled="!blankName.trim()" @click="createBlank">Create</BrandButton>
      </template>
    </SettingsFormModal>

    <!-- ─────────────── Duplicate an existing template ─────────────── -->
    <SettingsDuplicatePickerModal
      :model-value="newStep === 'duplicate'"
      width="560px"
      description="Use an existing template as a starting point. Customize it as needed."
      :search="dupSearch"
      list-label="Email templates"
      :list-count="templates.length"
      :items="dupFiltered.map(t => ({ id: t.id, name: t.name, subtitle: categoryLabels[t.category] }))"
      :selected-id="dupSelectedId"
      @update:model-value="v => !v && newStep === 'duplicate' && (newStep = 'closed')"
      @update:search="v => dupSearch = v"
      @update:selected-id="v => dupSelectedId = v"
      @confirm="confirmDuplicate"
    />

    <!-- ─────────────── Jobs & templates using this template ─────────────── -->
    <SettingsFormModal v-model="jobsModalOpen" title="Jobs and job templates that use this template" width="560px">
      <p class="text-[13px] text-[var(--brand-text-quiet)] mb-4 -mt-3">6 jobs, 3 job templates</p>
      <div class="flex items-center gap-2 border-[1.5px] border-[var(--brand-teal)] rounded-[10px] px-3.5 py-2.5 bg-[var(--brand-surface-white)] mb-4">
        <Search class="w-3.5 h-3.5 text-[var(--brand-text-quiet)] shrink-0" />
        <input v-model="jobsSearch" type="text" placeholder="Search jobs" class="border-0 outline-none text-[13.5px] text-[var(--brand-text)] bg-transparent flex-1">
      </div>
      <div class="flex gap-0 border-b border-[var(--brand-border-light)] mb-3">
        <button
          type="button"
          class="px-3.5 py-2 text-[13.5px] outline-none border-b-2 -mb-px flex items-center gap-1.5"
          :class="jobsTab === 'jobs' ? 'font-bold text-[var(--brand-text)] border-[var(--brand-teal)]' : 'font-medium text-[var(--brand-text-quiet)] border-transparent'"
          @click="jobsTab = 'jobs'"
        >
          Jobs
          <span class="bg-[var(--brand-teal)] text-[var(--brand-lime)] text-[10px] font-bold px-[6px] py-px rounded-[4px]">6</span>
        </button>
        <button
          type="button"
          class="px-3.5 py-2 text-[13.5px] outline-none border-b-2 -mb-px flex items-center gap-1.5"
          :class="jobsTab === 'templates' ? 'font-bold text-[var(--brand-text)] border-[var(--brand-teal)]' : 'font-medium text-[var(--brand-text-quiet)] border-transparent'"
          @click="jobsTab = 'templates'"
        >
          Job templates
          <span class="bg-[var(--brand-border-light)] text-[var(--brand-nav-text)] text-[10px] font-bold px-[6px] py-px rounded-[4px]">3</span>
        </button>
      </div>
      <div class="border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden max-h-[280px] overflow-y-auto">
        <div
          v-for="(j, i) in jobsFiltered"
          :key="j.name"
          class="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--brand-border-fade)] last:border-0"
          :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]' : 'bg-[var(--brand-surface-white)]'"
        >
          <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: j.color }" />
          <div>
            <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ j.name }}</div>
            <div class="text-[12px] text-[var(--brand-text-quiet)]">{{ j.location }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <BrandButton type="button" variant="primary-teal" size="lg" @click="jobsModalOpen = false">Got it</BrandButton>
      </template>
    </SettingsFormModal>
  </div>
</template>
