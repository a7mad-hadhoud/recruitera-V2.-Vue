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
import SettingsRenameModal from '~/components/settings/SettingsRenameModal.vue'
import SettingsRowMenu from '~/components/settings/SettingsRowMenu.vue'
import SettingsRowMenuItem from '~/components/settings/SettingsRowMenuItem.vue'
import SettingsDuplicatePickerModal from '~/components/settings/SettingsDuplicatePickerModal.vue'
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
  const map = new Map<TemplateCategory, EmailTemplate[]>()
  for (const cat of categoryOrder) map.set(cat, [])
  for (const t of templates.value) map.get(t.category)?.push(t)
  return categoryOrder.map(c => ({ category: c, items: map.get(c) ?? [] }))
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
const subjectDraft = ref('')
const bodyEl = ref<HTMLDivElement | null>(null)
const savedLabel = ref('Saved 16 days ago')

function tokenSpan(token: string) {
  return `<span style="background:var(--brand-email-highlight-bg);color:var(--brand-teal);padding:1px 6px;border-radius:4px;font-size:13px;font-weight:600">[ ${token} ]</span>`
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
  nextTick(() => {
    if (bodyEl.value) bodyEl.value.innerHTML = t ? renderBodyHtml(t.body) : ''
  })
}, { immediate: true })

function saveTemplate() {
  if (!selected.value) return
  const idx = templates.value.findIndex(t => t.id === selected.value!.id)
  if (idx === -1) return
  templates.value[idx] = {
    ...templates.value[idx],
    subject: subjectDraft.value,
    body: bodyEl.value?.innerText ?? templates.value[idx].body,
  }
  savedLabel.value = 'Saved just now'
}

function exec(cmd: string, value?: string) {
  bodyEl.value?.focus()
  document.execCommand(cmd, false, value)
}
function insertLink() {
  const url = window.prompt('Link URL')
  if (url) exec('createLink', url)
}
function insertImage() {
  const url = window.prompt('Image URL')
  if (url) exec('insertImage', url)
}
function insertToken(token: string) {
  bodyEl.value?.focus()
  document.execCommand('insertHTML', false, `${tokenSpan(token)}&nbsp;`)
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
  if (!selected.value || !renameDraft.value.trim()) return
  const idx = templates.value.findIndex(t => t.id === selected.value!.id)
  templates.value[idx] = { ...templates.value[idx], name: renameDraft.value.trim() }
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

// ─────────────── Attachments ───────────────
const attachments = ref<string[]>([])
function onFilesChosen(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  attachments.value.push(...Array.from(files).map(f => f.name))
}
function removeAttachment(name: string) {
  attachments.value = attachments.value.filter(a => a !== name)
}
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
              {{ categoryLabels[g.category].toUpperCase() }}
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
          <div class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden mb-4">
            <div class="px-4 py-3 border-b border-[var(--brand-border-fade)]">
              <input
                v-model="subjectDraft"
                type="text"
                placeholder="Subject line"
                class="w-full border-0 outline-none text-[14px] text-[var(--brand-text)] bg-transparent"
              >
            </div>

            <div class="flex items-center gap-1 px-3.5 py-2.5 border-b border-[var(--brand-border-fade)] flex-wrap">
              <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" @click="exec('bold')"><Bold class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" @click="exec('italic')"><Italic class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" @click="exec('underline')"><Underline class="w-3.5 h-3.5" /></button>
              <div class="w-px h-4 bg-[var(--brand-border-light)] mx-1" />
              <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Insert link" @click="insertLink"><Link2 class="w-3.5 h-3.5" /></button>
              <button type="button" class="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" title="Insert image" @click="insertImage"><ImageIcon class="w-3.5 h-3.5" /></button>

              <div class="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <button type="button" class="flex items-center gap-1.5 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-[8px] px-3 py-[5px] text-[12.5px] font-medium text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
                      <ListChecks class="w-3 h-3" />
                      Insert...
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-[300px]">
                    <DropdownMenuItem class="flex-col items-start gap-0.5 py-2.5 cursor-pointer" @click="insertToken('Questionnaire link')">
                      <span class="text-[13.5px] font-bold text-[var(--brand-text)]">Questionnaires</span>
                      <span class="text-[12px] text-[var(--brand-text-quiet)]">Send a link to sets of questions for candidates.</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex-col items-start gap-0.5 py-2.5 cursor-pointer" @click="insertToken('Event scheduler link')">
                      <span class="text-[13.5px] font-bold text-[var(--brand-text)]">Event scheduler</span>
                      <span class="text-[12px] text-[var(--brand-text-quiet)]">Send your availability to a candidate and schedule an interview.</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div
              ref="bodyEl"
              contenteditable="true"
              class="px-[18px] py-[18px] min-h-[220px] text-[14px] text-[var(--brand-text)] outline-none leading-[1.7]"
              @input="() => {}"
            />

            <div v-if="attachments.length" class="border-t border-[var(--brand-border-fade)] px-4 py-3 flex flex-wrap gap-2">
              <span
                v-for="a in attachments"
                :key="a"
                class="inline-flex items-center gap-1.5 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-[7px] px-2.5 py-1 text-[12px] text-[var(--brand-text)]"
              >
                {{ a }}
                <button type="button" class="text-[var(--brand-icon-muted)] outline-none hover:text-[var(--brand-text)]" @click="removeAttachment(a)"><X class="w-3 h-3" /></button>
              </span>
            </div>

            <div class="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--brand-border-fade)]">
              <Paperclip class="w-3.5 h-3.5 text-[var(--brand-nav-text)]" />
              <label class="text-[13px] font-semibold text-[var(--brand-nav-text)] cursor-pointer">
                Attach file
                <input type="file" multiple class="hidden" @change="onFilesChosen">
              </label>
            </div>

            <div class="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--brand-border-fade)] flex-wrap">
              <span class="text-[13px] font-medium text-[var(--brand-text-quiet)]">Placeholders</span>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button type="button" class="flex items-center gap-1 bg-[var(--brand-canvas)] border border-[var(--brand-border-mid)] rounded-full px-3 py-1 text-[13px] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
                    Candidate
                    <ChevronDown class="w-2.5 h-2.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-[280px]">
                  <DropdownMenuItem class="flex-col items-start gap-0.5 py-2.5 cursor-pointer" @click="insertToken('candidate.first')">
                    <span class="text-[13.5px] font-bold text-[var(--brand-teal)]">[ candidate.first ]</span>
                    <span class="text-[12px] text-[var(--brand-text-quiet)]">Candidate's first name</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem class="flex-col items-start gap-0.5 py-2.5 cursor-pointer" @click="insertToken('candidate.last')">
                    <span class="text-[13.5px] font-bold text-[var(--brand-teal)]">[ candidate.last ]</span>
                    <span class="text-[12px] text-[var(--brand-text-quiet)]">Candidate's last name</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem class="flex-col items-start gap-0.5 py-2.5 cursor-pointer" @click="insertToken('candidate.full')">
                    <span class="text-[13.5px] font-bold text-[var(--brand-teal)]">[ candidate.full ]</span>
                    <span class="text-[12px] text-[var(--brand-text-quiet)]">Candidate's full name</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem class="flex-col items-start gap-0.5 py-2.5 cursor-pointer" @click="insertToken('candidate.full_email')">
                    <span class="text-[13.5px] font-bold text-[var(--brand-teal)]">[ candidate.full_email ]</span>
                    <span class="text-[12px] text-[var(--brand-text-quiet)]">Candidate's full name and email address</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem class="flex-col items-start gap-0.5 py-2.5 cursor-pointer" @click="insertToken('candidate.email')">
                    <span class="text-[13.5px] font-bold text-[var(--brand-teal)]">[ candidate.email ]</span>
                    <span class="text-[12px] text-[var(--brand-text-quiet)]">Candidate's email address</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button type="button" class="bg-[var(--brand-surface-white)] border border-[var(--brand-teal)] rounded-full px-3 py-1 text-[13px] font-semibold text-[var(--brand-teal)] outline-none" @click="insertToken('job_offer')">
                [ job_offer ]
              </button>
              <button type="button" class="bg-[var(--brand-surface-white)] border border-[var(--brand-teal)] rounded-full px-3 py-1 text-[13px] font-semibold text-[var(--brand-teal)] outline-none" @click="insertToken('company')">
                [ company ]
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button type="button" class="flex items-center gap-1 bg-[var(--brand-canvas)] border border-[var(--brand-border-mid)] rounded-full px-3 py-1 text-[13px] text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
                    <MoreHorizontal class="w-3 h-3" />
                    More
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-[280px]">
                  <DropdownMenuItem class="justify-between py-3 cursor-pointer" @click="insertToken('hiring_manager.name')">
                    <div>
                      <div class="text-[13.5px] font-bold text-[var(--brand-text)]">Hiring manager</div>
                      <div class="text-[12px] text-[var(--brand-text-quiet)]">Hiring manager-related placeholders</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem class="justify-between py-3 cursor-pointer" @click="insertToken('recruiter.name')">
                    <div>
                      <div class="text-[13.5px] font-bold text-[var(--brand-text)]">Recruiter</div>
                      <div class="text-[12px] text-[var(--brand-text-quiet)]">Recruiter-related placeholders</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem class="py-3 cursor-pointer" @click="insertToken('department')">
                    <div class="text-[13.5px] font-bold text-[var(--brand-teal)]">[ department ]</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

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

    <!-- ─────────────── Rename modal ─────────────── -->
    <SettingsRenameModal
      v-model="renameOpen"
      :draft="renameDraft"
      @update:draft="renameDraft = $event"
      @confirm="confirmRename"
    />

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
