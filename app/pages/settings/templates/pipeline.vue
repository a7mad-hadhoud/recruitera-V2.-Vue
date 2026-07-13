<script setup lang="ts">
import {
  Plus, Pencil, Copy, Trash2, Star, Info, Zap, ChevronDown, ChevronUp, GripVertical, X,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsRenameModal from '~/components/settings/SettingsRenameModal.vue'
import SettingsRowMenu from '~/components/settings/SettingsRowMenu.vue'
import SettingsRowMenuItem from '~/components/settings/SettingsRowMenuItem.vue'
import SettingsDuplicatePickerModal from '~/components/settings/SettingsDuplicatePickerModal.vue'
import PipelineStageEditForm from '~/components/settings/pipeline/PipelineStageEditForm.vue'
import { BrandButton, BrandStatusBadge } from '~/components/brand'
import { usePipelineTemplates } from '~/composables/useTemplates'
import type { PipelineStage, PipelineStageType, PipelineTemplate, StageAutomation } from '~/types'

const PIPELINE_TYPE_TONE: Record<PipelineStageType, 'gray' | 'pipeline-blue' | 'live' | 'pipeline-purple'> = {
  'No type': 'gray',
  'Apply': 'gray',
  'Phone Screen': 'pipeline-blue',
  'Interview': 'pipeline-blue',
  'Evaluation': 'live',
  'Offer': 'pipeline-purple',
}

function stageDotTone(section: 'applicants' | 'active' | 'hires', stage: PipelineStage) {
  if (section === 'hires') return 'live'
  if (section === 'applicants') return 'gray'
  return PIPELINE_TYPE_TONE[stage.type]
}

function stageDotLabel(section: 'applicants' | 'active' | 'hires', stage: PipelineStage) {
  if (section === 'hires') return 'Hired'
  if (section === 'applicants') return 'Applied'
  return stage.type
}

definePageMeta({ layout: 'settings' })

const { data, isLoading } = usePipelineTemplates()

// Local editable copy — seeded once from the mock query, then owned client-side
// (matches the same pattern used by the other Templates pages).
const templates = ref<PipelineTemplate[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    templates.value = v.data.map(t => ({
      ...t,
      applicants: t.applicants.map(s => ({ ...s, automations: s.automations.map(a => ({ ...a })) })),
      active: t.active.map(s => ({ ...s, automations: s.automations.map(a => ({ ...a })) })),
      hires: t.hires.map(s => ({ ...s, automations: s.automations.map(a => ({ ...a })) })),
    }))
    seeded.value = true
  }
}, { immediate: true })

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const TYPE_OPTIONS: PipelineStageType[] = ['No type', 'Apply', 'Phone Screen', 'Interview', 'Evaluation', 'Offer']
const SLAS = ['No time limit', '1 day', '2 days', '3 days', '5 days', '7 days', '14 days', '30 days']
const SECTION_INFO: Record<'applicants' | 'active' | 'hires', string> = {
  applicants: "Stages that show you the candidate's origin",
  active: 'Stages that reflect the hiring process at your company',
  hires: 'Stages for hired candidates',
}
const AUTOMATION_ACTIONS = [
  'Add a note',
  'Send an email',
  'Notify the hiring team',
  'Move to another stage',
]

const selectedId = ref<string | null>(null)
watch(templates, (arr) => {
  if (!selectedId.value && arr.length) selectedId.value = arr[0]!.id
}, { immediate: true })

const selected = computed(() => templates.value.find(t => t.id === selectedId.value) ?? null)
function selectedIndex() {
  return templates.value.findIndex(t => t.id === selectedId.value)
}
const savedLabel = ref('Saved 5 days ago')
watch(selected, () => { savedLabel.value = 'Saved 5 days ago' })
function mutateSelected(patch: (t: PipelineTemplate) => void) {
  const idx = selectedIndex()
  if (idx === -1) return
  patch(templates.value[idx]!)
}
type Section = 'applicants' | 'active' | 'hires'
function sectionArray(t: PipelineTemplate, section: Section) {
  return t[section]
}

// ─────────────── Edit stage (inline form) ───────────────
const editing = ref<{ section: Section, idx: number | null } | null>(null)
const draft = reactive({ name: '', type: 'No type' as PipelineStageType, sla: 'No time limit' })

function openEdit(section: Section, idx: number) {
  const stage = sectionArray(selected.value!, section)[idx]!
  draft.name = stage.name
  draft.type = stage.type
  draft.sla = stage.sla
  editing.value = { section, idx }
}
function openAdd(section: Section) {
  draft.name = ''
  draft.type = 'No type'
  draft.sla = 'No time limit'
  editing.value = { section, idx: null }
}
function cancelEdit() { editing.value = null }
function saveStage(addAnother: boolean) {
  if (!draft.name.trim() || !editing.value) return
  const { section, idx } = editing.value
  mutateSelected((t) => {
    const arr = sectionArray(t, section)
    const stage: PipelineStage = {
      id: idx === null ? newId('stage') : arr[idx]!.id,
      name: draft.name.trim(),
      type: draft.type,
      sla: draft.sla,
      automations: idx === null ? [] : arr[idx]!.automations,
    }
    if (idx === null) arr.push(stage)
    else arr[idx] = stage
  })
  if (addAnother) openAdd(section)
  else editing.value = null
}
function deleteStage() {
  if (!editing.value) return
  const { section, idx } = editing.value
  if (idx === null) return
  mutateSelected((t) => { sectionArray(t, section).splice(idx, 1) })
  editing.value = null
}

// ─────────────── Automations ───────────────
const expandedStageId = ref<string | null>(null)
function toggleExpand(stageId: string) {
  expandedStageId.value = expandedStageId.value === stageId ? null : stageId
}
function addAutomation(section: Section, stageId: string, label: string) {
  mutateSelected((t) => {
    const stage = sectionArray(t, section).find(s => s.id === stageId)
    stage?.automations.push({ id: newId('auto'), label: `When a candidate is moved to this stage, then ${label.toLowerCase()}` })
  })
  expandedStageId.value = stageId
}
function removeAutomation(section: Section, stageId: string, automationId: string) {
  mutateSelected((t) => {
    const stage = sectionArray(t, section).find(s => s.id === stageId)
    if (stage) stage.automations = stage.automations.filter(a => a.id !== automationId)
  })
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
  mutateSelected(t => { t.name = renameDraft.value.trim() })
  renameOpen.value = false
}

// ─────────────── New template (Blank vs Duplicate) ───────────────
const newStep = ref<'closed' | 'choose' | 'blank' | 'duplicate'>('closed')
const blankName = ref('')
function openNewTemplate() { newStep.value = 'choose' }
function chooseBlank() { blankName.value = ''; newStep.value = 'blank' }
function chooseDuplicate() { dupSelectedId.value = null; newStep.value = 'duplicate' }
function createBlank() {
  if (!blankName.value.trim()) return
  const t: PipelineTemplate = {
    id: newId('pl'),
    name: blankName.value.trim(),
    isDefault: false,
    applicants: [
      { id: newId('a'), name: 'Referred', type: 'No type', sla: 'No time limit', automations: [] },
      { id: newId('a'), name: 'Sourced', type: 'No type', sla: 'No time limit', automations: [] },
      { id: newId('a'), name: 'Applied', type: 'Apply', sla: 'No time limit', automations: [] },
    ],
    active: [],
    hires: [
      { id: newId('h'), name: 'Hired', type: 'No type', sla: 'No time limit', automations: [] },
    ],
  }
  templates.value.push(t)
  selectedId.value = t.id
  newStep.value = 'closed'
}
const dupSelectedId = ref<string | null>(null)
function confirmDuplicate() {
  const src = templates.value.find(t => t.id === dupSelectedId.value)
  if (!src) return
  const clone: PipelineTemplate = {
    ...src,
    id: newId('pl'),
    name: `${src.name} (Copy)`,
    isDefault: false,
    applicants: src.applicants.map(s => ({ ...s, id: newId('a'), automations: s.automations.map(a => ({ ...a })) })),
    active: src.active.map(s => ({ ...s, id: newId('s'), automations: s.automations.map(a => ({ ...a })) })),
    hires: src.hires.map(s => ({ ...s, id: newId('h'), automations: s.automations.map(a => ({ ...a })) })),
  }
  templates.value.push(clone)
  selectedId.value = clone.id
  newStep.value = 'closed'
}

// ─────────────── More menu ───────────────
function duplicateTemplate() {
  if (!selected.value) return
  dupSelectedId.value = selected.value.id
  confirmDuplicate()
}
function setAsDefault() {
  if (!selected.value) return
  const id = selected.value.id
  templates.value.forEach((t) => {
    t.isDefault = t.id === id
    if (t.id === id) t.name = `${t.name.replace(/ \(Default\)$/, '')} (Default)`
    else t.name = t.name.replace(/ \(Default\)$/, '')
  })
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
        <div class="text-[15px] font-bold text-[var(--brand-text)] mb-1">Pipeline templates</div>
        <p class="text-[12px] text-[var(--brand-text-quiet)] mb-3">
          Set up hiring workflows and use them for jobs.
          <a href="#" class="text-[var(--brand-teal)] font-semibold">Learn more</a>
        </p>
        <Button size="sm" class="w-full gap-1.5 bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90" @click="openNewTemplate">
          <Plus class="w-3.5 h-3.5" />
          New template
        </Button>
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <p v-if="isLoading && !templates.length" class="px-4 py-4 text-[13px] text-[var(--brand-text-muted)]">Loading…</p>
        <button
          v-for="t in templates"
          v-else
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
    </div>

    <!-- RIGHT: editor -->
    <div class="flex-1 flex flex-col min-w-0 bg-[var(--brand-surface-white)] overflow-hidden">
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
            <div class="text-[12px] text-[var(--brand-text-quiet)]">{{ savedLabel }}</div>
          </div>
          <SettingsRowMenu>
            <SettingsRowMenuItem @click="duplicateTemplate">
              <Copy class="w-3.5 h-3.5" />
              Duplicate
            </SettingsRowMenuItem>
            <SettingsRowMenuItem @click="setAsDefault">
              <Star class="w-3.5 h-3.5" />
              Set as default
            </SettingsRowMenuItem>
            <SettingsRowMenuItem danger @click="deleteTemplate">
              <Trash2 class="w-3.5 h-3.5" />
              Delete
            </SettingsRowMenuItem>
          </SettingsRowMenu>
        </div>

        <div class="flex-1 overflow-y-auto px-8 py-5 max-w-[760px]">
          <template v-for="section in (['applicants', 'active', 'hires'] as Section[])" :key="section">
            <div class="flex items-center gap-1.5 mb-2.5" :class="section !== 'applicants' ? 'mt-4' : ''">
              <span class="text-[13.5px] font-bold text-[var(--brand-text-secondary)]">
                {{ section === 'applicants' ? 'Applicants' : section === 'active' ? 'Active process' : 'Hires' }}
              </span>
              <span class="text-[var(--brand-text-quiet)]" :title="SECTION_INFO[section]">
                <Info class="w-3.5 h-3.5" />
              </span>
            </div>

            <template v-for="(stage, i) in sectionArray(selected, section)" :key="stage.id">
              <!-- Inline edit form -->
              <PipelineStageEditForm
                v-if="editing && editing.section === section && editing.idx === i"
                :draft="draft"
                :type-options="TYPE_OPTIONS"
                :slas="SLAS"
                :is-new="false"
                @cancel="cancelEdit"
                @delete="deleteStage"
                @save="addAnother => saveStage(addAnother)"
              />

              <!-- Stage row -->
              <div v-else class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[10px] mb-1.5 overflow-hidden">
                <div class="flex items-center gap-3 px-4 py-3">
                  <GripVertical v-if="section !== 'applicants'" class="w-3 h-3 text-[var(--brand-text-faint)] cursor-grab shrink-0" />
                  <BrandStatusBadge
                    variant="dot-only"
                    :tone="stageDotTone(section, stage)"
                    :label="stageDotLabel(section, stage)"
                  />
                  <span class="flex-1 text-[14px] font-medium text-[var(--brand-text)]">{{ stage.name }}</span>
                  <button type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] p-1 transition-colors" title="Automations" @click="toggleExpand(stage.id)">
                    <Zap class="w-3.5 h-3.5" />
                  </button>
                  <button v-if="section !== 'applicants'" type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] p-1 transition-colors" title="Edit" @click="openEdit(section, i)">
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                </div>

                <div v-if="stage.automations.length" class="px-4 pb-2.5">
                  <button type="button" class="inline-flex items-center gap-1 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-[6px] px-2.5 py-1 text-[12px] text-[var(--brand-nav-text)] outline-none" @click="toggleExpand(stage.id)">
                    Automations {{ stage.automations.length }}
                    <component :is="expandedStageId === stage.id ? ChevronUp : ChevronDown" class="w-2.5 h-2.5" />
                  </button>
                </div>

                <div v-if="expandedStageId === stage.id" class="px-4 pb-3.5 pt-1 border-t border-[var(--brand-border-fade)] bg-[var(--brand-canvas)] flex flex-col gap-2">
                  <div v-for="au in stage.automations" :key="au.id" class="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[9px]">
                    <span class="text-[12.5px] text-[var(--brand-nav-text)] flex-1">{{ au.label }}</span>
                    <button type="button" class="text-[var(--brand-icon-muted)] outline-none hover:text-[var(--brand-settings-danger)] p-0.5" @click="removeAutomation(section, stage.id, au.id)">
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <button type="button" class="self-start flex items-center gap-1.5 border-[1.5px] border-dashed border-[var(--brand-border-mid)] rounded-[8px] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
                        <Plus class="w-3 h-3" />
                        Add automation
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" class="w-[220px]">
                      <DropdownMenuItem v-for="action in AUTOMATION_ACTIONS" :key="action" class="py-2 text-[13px] cursor-pointer" @click="addAutomation(section, stage.id, action)">
                        {{ action }}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </template>

            <!-- New stage form (appended) -->
            <PipelineStageEditForm
              v-if="editing && editing.section === section && editing.idx === null"
              :draft="draft"
              :type-options="TYPE_OPTIONS"
              :slas="SLAS"
              :is-new="true"
              @cancel="cancelEdit"
              @save="addAnother => saveStage(addAnother)"
            />

            <BrandButton
              v-if="section !== 'applicants' && !(editing && editing.section === section && editing.idx === null)"
              type="button"
              variant="outline"
              size="md"
              class="w-full gap-1.5 border-dashed font-semibold mt-1"
              @click="openAdd(section)"
            >
              <Plus class="w-3.5 h-3.5" />
              Add new
            </BrandButton>
          </template>
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
        <button type="button" class="flex items-center gap-3.5 border border-[var(--brand-border-light)] rounded-[12px] px-[18px] py-4 text-left outline-none hover:shadow-[0_4px_16px_rgba(0,36,39,0.1)] hover:border-[var(--brand-border-mid)] transition-all" @click="chooseBlank">
          <div class="w-10 h-10 rounded-[10px] bg-[var(--brand-badge-settings-bg)] flex items-center justify-center shrink-0">
            <Pencil class="w-[18px] h-[18px] text-[var(--brand-badge-settings-text)]" />
          </div>
          <div class="flex-1">
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">Blank template</div>
            <div class="text-[12.5px] text-[var(--brand-text-quiet)]">Start from scratch.</div>
          </div>
        </button>
        <button type="button" class="flex items-center gap-3.5 border border-[var(--brand-border-light)] rounded-[12px] px-[18px] py-4 text-left outline-none hover:shadow-[0_4px_16px_rgba(0,36,39,0.1)] hover:border-[var(--brand-border-mid)] transition-all" @click="chooseDuplicate">
          <div class="w-10 h-10 rounded-[10px] bg-[var(--brand-badge-settings-bg)] flex items-center justify-center shrink-0">
            <Copy class="w-[18px] h-[18px] text-[var(--brand-badge-settings-text)]" />
          </div>
          <div class="flex-1">
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">Duplicate an existing template</div>
            <div class="text-[12.5px] text-[var(--brand-text-quiet)]">Use an existing template as a starting point.</div>
          </div>
        </button>
      </div>
    </SettingsFormModal>

    <!-- ─────────────── Step 2a: blank name ─────────────── -->
    <SettingsFormModal :model-value="newStep === 'blank'" title="New pipeline template" width="440px" @update:model-value="v => !v && newStep === 'blank' && (newStep = 'closed')">
      <div class="mb-1">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Template name <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input v-model="blankName" type="text" class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors" @keyup.enter="createBlank">
      </div>
      <template #footer>
        <BrandButton type="button" variant="ghost" size="md" @click="newStep = 'closed'">Cancel</BrandButton>
        <BrandButton type="button" variant="primary-teal" size="md" :disabled="!blankName.trim()" @click="createBlank">Create</BrandButton>
      </template>
    </SettingsFormModal>

    <!-- ─────────────── Step 2b: duplicate picker ─────────────── -->
    <SettingsDuplicatePickerModal
      :model-value="newStep === 'duplicate'"
      width="480px"
      :items="templates"
      :selected-id="dupSelectedId"
      @update:model-value="v => !v && newStep === 'duplicate' && (newStep = 'closed')"
      @update:selected-id="v => dupSelectedId = v"
      @confirm="confirmDuplicate"
    />
  </div>
</template>
