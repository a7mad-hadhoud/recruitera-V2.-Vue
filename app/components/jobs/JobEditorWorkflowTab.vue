<!--
  Workflow tab for the /jobs/new editor — the job's hiring pipeline.

  Sourced entirely from the Settings module (usePipelineTemplates, the
  same data Settings > Templates > Pipeline reads), so the stages,
  groups (Applicants / Active process / Hires), colors and automations
  stay in lockstep with the workspace's pipeline templates. The header
  carries a "Template: <name>" selector to pick which template this job
  uses; the body reuses BrandStatusBadge + PipelineStageEditForm so the
  stage rows, inline edit/add and automation panels match Settings 1:1.
-->
<script setup lang="ts">
import { Info, Zap, Pencil, ChevronDown, ChevronUp, GripVertical, Plus, X, ListChecks } from 'lucide-vue-next'
import { BrandButton, BrandStatusBadge } from '~/components/brand'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import PipelineStageEditForm from '~/components/settings/pipeline/PipelineStageEditForm.vue'
import JobIdealCandidateModal from '~/components/jobs/JobIdealCandidateModal.vue'
import JobStageAutomationModal from '~/components/jobs/JobStageAutomationModal.vue'
import JobAutomationBuilderModal from '~/components/jobs/JobAutomationBuilderModal.vue'
import { usePipelineTemplates } from '~/composables/useTemplates'
import type { PipelineStage, PipelineStageType, PipelineTemplate } from '~/types'

type Section = 'applicants' | 'active' | 'hires'

const PIPELINE_TYPE_TONE: Record<PipelineStageType, 'gray' | 'pipeline-blue' | 'live' | 'pipeline-purple'> = {
  'No type': 'gray',
  'Apply': 'gray',
  'Phone Screen': 'pipeline-blue',
  'Interview': 'pipeline-blue',
  'Evaluation': 'live',
  'Offer': 'pipeline-purple',
}
function stageDotTone(section: Section, stage: PipelineStage) {
  if (section === 'hires') return 'live'
  if (section === 'applicants') return 'gray'
  return PIPELINE_TYPE_TONE[stage.type]
}
function stageDotLabel(section: Section, stage: PipelineStage) {
  if (section === 'hires') return 'Hired'
  if (section === 'applicants') return 'Applied'
  return stage.type
}

const TYPE_OPTIONS: PipelineStageType[] = ['No type', 'Apply', 'Phone Screen', 'Interview', 'Evaluation', 'Offer']
const SLAS = ['No time limit', '1 day', '2 days', '3 days', '5 days', '7 days', '14 days', '30 days']
const SECTION_INFO: Record<Section, string> = {
  applicants: "Stages that show you the candidate's origin",
  active: 'Stages that reflect the hiring process at your company',
  hires: 'Stages for hired candidates',
}
const AUTOMATION_ACTIONS = ['Add a note', 'Send an email', 'Notify the hiring team', 'Move to another stage']

// ── Load templates from Settings, keep a local editable copy ──
const { data, isLoading } = usePipelineTemplates()
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

function newId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

// The template this job uses — defaults to the workspace default.
const selectedId = ref<string | null>(null)
watch(templates, (arr) => {
  if (!selectedId.value && arr.length) {
    selectedId.value = (arr.find(t => t.isDefault) ?? arr[0])!.id
  }
}, { immediate: true })
const selected = computed(() => templates.value.find(t => t.id === selectedId.value) ?? null)
function selectedIndex() { return templates.value.findIndex(t => t.id === selectedId.value) }
function mutateSelected(patch: (t: PipelineTemplate) => void) {
  const idx = selectedIndex()
  if (idx !== -1) patch(templates.value[idx]!)
}
function sectionArray(t: PipelineTemplate, section: Section) { return t[section] }

// ── Inline edit / add (reuses the Settings stage form) ──
const editing = ref<{ section: Section, idx: number | null } | null>(null)
const draft = reactive({ name: '', type: 'No type' as PipelineStageType, sla: 'No time limit' })
function openEdit(section: Section, idx: number) {
  const stage = sectionArray(selected.value!, section)[idx]!
  draft.name = stage.name; draft.type = stage.type; draft.sla = stage.sla
  editing.value = { section, idx }
}
function openAdd(section: Section) {
  draft.name = ''; draft.type = 'No type'; draft.sla = 'No time limit'
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
    if (idx === null) arr.push(stage); else arr[idx] = stage
  })
  if (addAnother) openAdd(section); else editing.value = null
}
function deleteStage() {
  if (!editing.value) return
  const { section, idx } = editing.value
  if (idx === null) return
  mutateSelected((t) => { sectionArray(t, section).splice(idx, 1) })
  editing.value = null
}

// ── Automations ──
const expandedStageId = ref<string | null>(null)
function toggleExpand(id: string) { expandedStageId.value = expandedStageId.value === id ? null : id }
function addAutomation(section: Section, stageId: string, label: string) {
  mutateSelected((t) => {
    const stage = sectionArray(t, section).find(s => s.id === stageId)
    stage?.automations.push({ id: newId('auto'), label: `When a candidate is moved to this stage, then ${label.toLowerCase()}` })
  })
  expandedStageId.value = stageId
}
function removeAutomation(section: Section, stageId: string, autoId: string) {
  mutateSelected((t) => {
    const stage = sectionArray(t, section).find(s => s.id === stageId)
    if (stage) stage.automations = stage.automations.filter(a => a.id !== autoId)
  })
}

// ── AI screening — "Ideal candidate profile" criteria modal ──
const idealModalOpen = ref(false)

// ── Stage automation — chooser → "Add automation" builder ──
type ActionKey = 'notify' | 'talent-pool' | 'task'
const ACTION_LABEL: Record<ActionKey, string> = {
  'notify':      'send an email to the candidate',
  'talent-pool': 'tag them and add to a talent pool',
  'task':        'create a task for the recruiter',
}
const autoModalOpen = ref(false)          // step 1: chooser
const builderOpen = ref(false)            // step 2: full builder
const builderInitialAction = ref<ActionKey | null>(null)
const autoTarget = ref<{ section: Section; stageId: string; stageName: string } | null>(null)

function openStageAutomation(section: Section, stage: PipelineStage) {
  autoTarget.value = { section, stageId: stage.id, stageName: stage.name }
  autoModalOpen.value = true
}
// Chooser → open the builder seeded with the picked action.
function onSelectAutomation(action: ActionKey) {
  builderInitialAction.value = action
  builderOpen.value = true
}
// Builder Save → append the configured actions to the stage.
function onSaveAutomation(actions: { key: ActionKey; config: string }[]) {
  if (!autoTarget.value) return
  const { section, stageId, stageName } = autoTarget.value
  mutateSelected((t) => {
    const stage = sectionArray(t, section).find(s => s.id === stageId)
    if (!stage) return
    for (const a of actions) {
      stage.automations.push({
        id: newId('auto'),
        label: `When a candidate is moved to ${stageName}, then ${ACTION_LABEL[a.key]} (${a.config})`,
      })
    }
  })
  expandedStageId.value = stageId
}
</script>

<template>
  <div class="max-w-[960px] mx-auto pt-8 flex flex-col gap-6">
    <!-- ── Card: Screening and matching candidates (AI) ───────── -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-8">
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold text-[var(--brand-text)]">Screening and matching candidates</h2>
            <span class="inline-flex items-center h-[18px] px-1.5 rounded-md text-[11px] font-bold tracking-[0.02em] text-[var(--brand-pipeline-purple)] bg-[color-mix(in_srgb,var(--brand-pipeline-purple)_14%,white)]">AI</span>
          </div>
          <p class="text-[13px] text-[var(--brand-text-quiet)] mt-1">
            Our AI will screen candidates’ applications to see if they match your criteria. They won’t see this.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white text-[13px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition shrink-0"
          @click="idealModalOpen = true"
        >
          Set criteria
        </button>
      </div>
    </section>

    <!-- ── Card: Pipeline ─────────────────────────────────────── -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-8">
      <!-- Header — title + template selector -->
      <div class="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 class="text-lg font-semibold text-[var(--brand-text)]">Pipeline</h2>
          <p class="text-[13px] text-[var(--brand-text-quiet)] mt-1">
            Create a hiring pipeline to easily manage candidates.
            <a href="#" class="font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]">Learn more</a>
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="inline-flex items-center gap-2 h-9 px-3 rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white text-[13px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition shrink-0"
            >
              <ListChecks class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.9" />
              <span class="whitespace-nowrap">Template: {{ selected?.name ?? '—' }}</span>
              <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)]" stroke-width="2.2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" :side-offset="6" class="w-[240px] p-1.5 rounded-[12px]">
            <DropdownMenuItem
              v-for="t in templates"
              :key="t.id"
              class="flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[13.5px] font-semibold text-[var(--brand-text)] cursor-pointer"
              @select="selectedId = t.id"
            >
              <span class="flex-1 truncate">{{ t.name }}</span>
              <span v-if="t.isDefault" class="text-[11px] font-bold text-[var(--brand-text-quiet)]">Default</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p v-if="isLoading && !selected" class="text-[13px] text-[var(--brand-text-quiet)] py-8">Loading pipeline…</p>

      <template v-else-if="selected">
      <template v-for="section in (['applicants', 'active', 'hires'] as Section[])" :key="section">
        <!-- Group header -->
        <div class="flex items-center gap-1.5 mb-2.5" :class="section !== 'applicants' ? 'mt-6' : ''">
          <span class="text-[13.5px] font-bold text-[var(--brand-text-secondary)]">
            {{ section === 'applicants' ? 'Applicants' : section === 'active' ? 'Active process' : 'Hires' }}
          </span>
          <span class="text-[var(--brand-text-quiet)]" :title="SECTION_INFO[section]">
            <Info class="w-3.5 h-3.5" />
          </span>
        </div>

        <template v-for="(stage, i) in sectionArray(selected, section)" :key="stage.id">
          <!-- Inline edit form (active/hires) -->
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
          <div v-else class="bg-white border border-[var(--brand-border-light)] rounded-[10px] mb-1.5 overflow-hidden">
            <div class="flex items-center gap-3 px-4 py-3">
              <GripVertical v-if="section !== 'applicants'" class="w-3 h-3 text-[var(--brand-text-faint)] cursor-grab shrink-0" />
              <BrandStatusBadge variant="dot-only" :tone="stageDotTone(section, stage)" :label="stageDotLabel(section, stage)" />
              <span class="flex-1 text-[14px] font-medium text-[var(--brand-text)]">{{ stage.name }}</span>
              <button type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] p-1 transition-colors" title="Set up an automation" @click="openStageAutomation(section, stage)">
                <Zap class="w-3.5 h-3.5" />
              </button>
              <button v-if="section !== 'applicants'" type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] p-1 transition-colors" title="Edit" @click="openEdit(section, i)">
                <Pencil class="w-3.5 h-3.5" />
              </button>
            </div>

            <div v-if="stage.automations.length" class="px-4 pb-2.5">
              <button type="button" class="inline-flex items-center gap-1 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-[6px] px-2.5 py-1 text-[12px] text-[var(--brand-text-secondary)] outline-none" @click="toggleExpand(stage.id)">
                Automations {{ stage.automations.length }}
                <component :is="expandedStageId === stage.id ? ChevronUp : ChevronDown" class="w-2.5 h-2.5" />
              </button>
            </div>

            <div v-if="expandedStageId === stage.id" class="px-4 pb-3.5 pt-1 border-t border-[var(--brand-border-fade)] bg-[var(--brand-canvas)] flex flex-col gap-2">
              <div v-for="au in stage.automations" :key="au.id" class="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[var(--brand-border-light)] rounded-[9px]">
                <span class="text-[12.5px] text-[var(--brand-text-secondary)] flex-1">{{ au.label }}</span>
                <button type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-status-closed-text)] p-0.5" @click="removeAutomation(section, stage.id, au.id)">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button type="button" class="self-start flex items-center gap-1.5 border-[1.5px] border-dashed border-[var(--brand-border)] rounded-[8px] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--brand-text-secondary)] outline-none hover:bg-[var(--brand-canvas)] transition-colors">
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

        <!-- Add new (active/hires) -->
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
      </template>
    </section>

    <!-- Ideal candidate profile (AI criteria) modal -->
    <JobIdealCandidateModal v-model:open="idealModalOpen" />

    <!-- Stage automation — step 1: chooser -->
    <JobStageAutomationModal
      v-model:open="autoModalOpen"
      :stage-name="autoTarget?.stageName"
      @select="onSelectAutomation"
    />

    <!-- Stage automation — step 2: builder -->
    <JobAutomationBuilderModal
      v-model:open="builderOpen"
      :stage-name="autoTarget?.stageName"
      :initial-action="builderInitialAction"
      @save="onSaveAutomation"
    />
  </div>
</template>
