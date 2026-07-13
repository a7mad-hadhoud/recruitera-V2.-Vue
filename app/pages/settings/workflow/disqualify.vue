<script setup lang="ts">
import { ArrowDown, Briefcase, CheckSquare, ChevronDown, ChevronRight, Clock, GripVertical, Mail, Pencil, Plus, X, Zap } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { BrandButton } from '~/components/brand'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'

definePageMeta({ layout: 'settings' })

interface Reason { id: string, name: string, automationCount: number }

const reasons = ref<Reason[]>([
  { id: 'dq-1', name: 'Not a fit', automationCount: 0 },
  { id: 'dq-2', name: 'Hired elsewhere', automationCount: 0 },
  { id: 'dq-3', name: 'Lack of knowledge', automationCount: 0 },
  { id: 'dq-4', name: 'Overpriced', automationCount: 0 },
  { id: 'dq-5', name: 'Spam', automationCount: 0 },
  { id: 'dq-6', name: 'Lacks interpersonal skills', automationCount: 0 },
  { id: 'dq-7', name: 'Wrong skill set', automationCount: 0 },
])

const formOpen = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function focusInput() {
  nextTick(() => inputRef.value?.focus())
}

function openAdd() {
  formMode.value = 'add'
  editingId.value = null
  inputValue.value = ''
  formOpen.value = true
  focusInput()
}

function openEdit(reason: Reason) {
  formMode.value = 'edit'
  editingId.value = reason.id
  inputValue.value = reason.name
  formOpen.value = true
  focusInput()
}

function closeForm() {
  formOpen.value = false
}

function save() {
  const v = inputValue.value.trim()
  if (!v) return
  if (formMode.value === 'edit' && editingId.value) {
    const r = reasons.value.find(r => r.id === editingId.value)
    if (r) r.name = v
  }
  else {
    reasons.value.push({ id: `dq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: v, automationCount: 0 })
  }
  formOpen.value = false
}

function saveAndAddAnother() {
  const v = inputValue.value.trim()
  if (!v) return
  if (formMode.value === 'edit' && editingId.value) {
    const r = reasons.value.find(r => r.id === editingId.value)
    if (r) r.name = v
  }
  else {
    reasons.value.push({ id: `dq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: v, automationCount: 0 })
  }
  formMode.value = 'add'
  editingId.value = null
  inputValue.value = ''
  focusInput()
}

function deleteReason() {
  if (editingId.value) {
    reasons.value = reasons.value.filter(r => r.id !== editingId.value)
    formOpen.value = false
  }
}

// ─────────────── Automation (lightning icon) ───────────────
const AUTOMATION_TEMPLATES = [
  {
    key: 'notify',
    icon: Mail,
    title: 'Notify the candidate',
    description: 'Send an email letting the candidate know they\'ve been disqualified.',
  },
  {
    key: 'talent',
    icon: Briefcase,
    title: 'Tag and add to talent pool',
    description: 'Tag the candidate and add them to a talent pool for future roles.',
  },
  {
    key: 'task',
    icon: CheckSquare,
    title: 'Add task for recruiter',
    description: 'Create a task to remind the recruiter about the next step.',
  },
] as const

const EMAIL_TEMPLATE_OPTIONS = ['Disqualification email', 'Custom rejection template', 'Standard rejection']

type AutomationType = typeof AUTOMATION_TEMPLATES[number]['key']

interface AutomationAction {
  id: string
  type: AutomationType
  emailTemplate: string
  taskName: string
  talentPool: string
}

function templateFor(type: AutomationType) {
  return AUTOMATION_TEMPLATES.find(t => t.key === type)!
}

function newAction(type: AutomationType): AutomationAction {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    emailTemplate: EMAIL_TEMPLATE_OPTIONS[0],
    taskName: '',
    talentPool: '',
  }
}

const autoModalOpen = ref(false)
const autoStep = ref<'pick' | 'builder'>('pick')
const autoReasonId = ref<string | null>(null)
const autoActions = ref<AutomationAction[]>([])
const showActionPicker = ref(false)

const autoReason = computed(() => reasons.value.find(r => r.id === autoReasonId.value) ?? null)

function openAutomation(reason: Reason) {
  autoReasonId.value = reason.id
  autoStep.value = 'pick'
  autoActions.value = []
  showActionPicker.value = false
  autoModalOpen.value = true
}

function pickTemplate(type: AutomationType) {
  autoActions.value = [newAction(type)]
  autoStep.value = 'builder'
}

function addAction(type: AutomationType) {
  autoActions.value.push(newAction(type))
  showActionPicker.value = false
}

function removeAction(id: string) {
  autoActions.value = autoActions.value.filter(a => a.id !== id)
}

function clearReason() {
  autoReasonId.value = null
}

function saveAutomation() {
  const reason = autoReason.value
  if (reason) reason.automationCount += 1
  autoModalOpen.value = false
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Disqualify reasons"
      subtitle="Manage disqualify reasons across all jobs."
      learn-more-href="#"
    />

    <div class="flex flex-col gap-1.5 max-w-[680px]">
      <template v-for="reason in reasons" :key="reason.id">
        <div class="flex items-center gap-2.5 px-[18px] py-[13px] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[10px] hover:bg-[var(--brand-surface-hover)] transition-colors">
          <GripVertical class="w-3.5 h-3.5 text-[var(--brand-text-faint)] shrink-0 cursor-grab" />
          <span class="flex-1 text-[13.5px] font-medium text-[var(--brand-text)]">{{ reason.name }}</span>
          <span
            v-if="reason.automationCount > 0"
            class="text-[11px] font-semibold text-[var(--brand-olive)] bg-[var(--brand-lime-tint)] px-2 py-[3px] rounded-[6px]"
          >
            {{ reason.automationCount }} automation{{ reason.automationCount === 1 ? '' : 's' }}
          </span>
          <button
            type="button"
            class="inline-flex items-center justify-center p-1.5 rounded-[8px] border-none bg-transparent text-[var(--brand-text-faint)] outline-none hover:bg-[var(--brand-badge-settings-bg)] hover:text-[var(--brand-text)] transition-colors"
            title="Add automation"
            @click="openAutomation(reason)"
          >
            <Zap class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center p-1.5 rounded-[8px] border-none bg-transparent text-[var(--brand-text-faint)] outline-none hover:bg-[var(--brand-badge-settings-bg)] hover:text-[var(--brand-text)] transition-colors"
            title="Edit"
            @click="openEdit(reason)"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          v-if="formOpen && formMode === 'edit' && editingId === reason.id"
          class="bg-[var(--brand-settings-modal-bg)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(0,36,39,0.08)]"
        >
          <div class="flex items-center justify-between px-5 pt-4 pb-3">
            <span class="text-[14px] font-bold text-[var(--brand-text)]">Reason name</span>
            <button type="button" class="text-[var(--brand-text-quiet)] outline-none" @click="closeForm">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="px-5 pb-3.5">
            <input
              ref="inputRef"
              v-model="inputValue"
              type="text"
              placeholder="e.g. Overqualified"
              class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-teal)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
              @keyup.enter="save"
            >
          </div>
          <div class="flex items-center justify-between px-5 py-3 bg-[var(--brand-settings-modal-bg)] border-t border-[var(--brand-border-light)]">
            <BrandButton variant="ghost" size="sm" class="px-0 h-auto font-normal" @click="deleteReason">
              Delete
            </BrandButton>
            <div class="flex items-center gap-2">
              <BrandButton variant="ghost" size="sm" @click="closeForm">
                Cancel
              </BrandButton>
              <BrandButton variant="outline" size="sm" @click="saveAndAddAnother">
                Save and add another
              </BrandButton>
              <BrandButton variant="primary-teal" size="sm" @click="save">
                Save
              </BrandButton>
            </div>
          </div>
        </div>
      </template>

      <div
        v-if="formOpen && formMode === 'add'"
        class="bg-[var(--brand-settings-modal-bg)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(0,36,39,0.08)] mt-0.5"
      >
        <div class="flex items-center justify-between px-5 pt-4 pb-3">
          <span class="text-[14px] font-bold text-[var(--brand-text)]">Reason name</span>
          <button type="button" class="text-[var(--brand-text-quiet)] outline-none" @click="closeForm">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="px-5 pb-3.5">
          <input
            ref="inputRef"
            v-model="inputValue"
            type="text"
            placeholder="e.g. Overqualified"
            class="w-full box-border px-3.5 py-2.5 rounded-[9px] border-[1.5px] border-[var(--brand-teal)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]"
            @keyup.enter="save"
          >
        </div>
        <div class="flex items-center justify-end px-5 py-3 bg-[var(--brand-settings-modal-bg)] border-t border-[var(--brand-border-light)] gap-2">
          <BrandButton variant="ghost" size="sm" @click="closeForm">
            Cancel
          </BrandButton>
          <BrandButton variant="outline" size="sm" @click="saveAndAddAnother">
            Save and add another
          </BrandButton>
          <BrandButton variant="primary-teal" size="sm" @click="save">
            Save
          </BrandButton>
        </div>
      </div>

      <div class="mt-1.5 border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden">
        <BrandButton variant="ghost" class="w-full rounded-none gap-1.5" @click="openAdd">
          <Plus class="w-3.5 h-3.5 text-[var(--brand-olive)]" />
          <span class="text-[var(--brand-olive)]">Add new</span>
        </BrandButton>
      </div>
    </div>

    <!-- Step 1: template picker -->
    <SettingsFormModal
      v-if="autoStep === 'pick'"
      v-model="autoModalOpen"
      title="Set up an automation"
      width="580px"
    >
      <p class="text-[14.5px] text-[var(--brand-text)] mb-5">Choose what happens automatically when a candidate is disqualified.</p>
      <div class="flex flex-col gap-2.5">
        <button
          v-for="tpl in AUTOMATION_TEMPLATES"
          :key="tpl.key"
          type="button"
          class="flex items-center gap-4 bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[14px] px-[18px] py-4 text-left outline-none hover:border-[var(--brand-teal)] transition-colors"
          @click="pickTemplate(tpl.key)"
        >
          <div class="w-11 h-11 rounded-[12px] bg-[var(--brand-surface-badge)] flex items-center justify-center shrink-0">
            <component :is="tpl.icon" class="w-[18px] h-[18px] text-[var(--brand-icon-default)]" />
          </div>
          <div class="flex-1">
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-[3px]">{{ tpl.title }}</div>
            <div class="text-[12.5px] text-[var(--brand-text-quiet)] leading-relaxed">{{ tpl.description }}</div>
          </div>
          <ChevronRight class="w-4 h-4 text-[var(--brand-text-faint)] shrink-0" />
        </button>
      </div>
    </SettingsFormModal>

    <!-- Step 2: automation builder — custom header (Give feedback / Save automation / Close) -->
    <Dialog v-else :open="autoModalOpen" @update:open="v => autoModalOpen = v">
      <DialogContent
        :show-close-button="false"
        class="p-0 border-none shadow-none bg-transparent sm:max-w-none"
        style="width: 680px; max-width: 92vw;"
      >
        <div class="bg-[var(--brand-settings-modal-bg)] rounded-[24px] shadow-[var(--brand-settings-modal-shadow)] max-h-[88vh] overflow-y-auto">
          <div class="flex items-start justify-between gap-4 px-6 py-[18px] border-b border-[var(--brand-border-light)] sticky top-0 bg-[var(--brand-settings-modal-bg)] z-10 rounded-t-[24px]">
            <div>
              <div class="flex items-center gap-2.5 mb-1">
                <DialogTitle class="text-[17px] font-bold text-[var(--brand-text)]">Add automation</DialogTitle>
                <span class="bg-[var(--brand-teal)] text-[var(--brand-lime)] text-[10px] font-bold px-2 py-[2px] rounded-[5px] tracking-[0.02em]">NEW</span>
              </div>
              <p class="text-[12.5px] text-[var(--brand-text-quiet)]">Build personalised automations by setting triggers and actions. <a href="#" class="text-[var(--brand-teal)] font-semibold underline">Learn more</a></p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <BrandButton variant="outline">
                Give feedback
              </BrandButton>
              <BrandButton variant="primary-teal" @click="saveAutomation">
                Save automation
              </BrandButton>
              <button
                type="button"
                class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[10px] w-9 h-9 flex items-center justify-center text-[var(--brand-nav-text)] outline-none"
                @click="autoModalOpen = false"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="px-6 py-6 flex flex-col items-center">
            <div class="w-full max-w-[540px]">
              <div class="inline-flex items-center gap-1.5 bg-[var(--brand-settings-pill-bg)] rounded-full px-3.5 py-1.5 mb-4">
                <Zap class="w-3 h-3 text-[var(--brand-olive)]" />
                <span class="text-[11px] font-bold text-[var(--brand-olive)] uppercase tracking-[0.04em]">When this happens</span>
              </div>

              <div class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[16px] px-5 py-[18px] grid grid-cols-2 gap-3.5">
                <div>
                  <div class="text-[11px] font-bold text-[var(--brand-text-quiet)] uppercase tracking-[0.03em] mb-2">Start when</div>
                  <div class="flex items-center gap-2 border border-[var(--brand-border-light)] rounded-[12px] px-3.5 py-2.5 bg-[var(--brand-canvas)]">
                    <Clock class="w-3.5 h-3.5 text-[var(--brand-olive)] shrink-0" />
                    <span class="text-[13.5px] text-[var(--brand-text)]">Candidate is disqualified</span>
                  </div>
                </div>
                <div>
                  <div class="text-[11px] font-bold text-[var(--brand-text-quiet)] uppercase tracking-[0.03em] mb-2">Disqualify reason</div>
                  <div class="relative flex items-center gap-2 border border-[var(--brand-border-light)] rounded-[12px] pl-3.5 pr-2.5 py-2.5 bg-[var(--brand-canvas)]">
                    <select
                      v-model="autoReasonId"
                      class="flex-1 bg-transparent text-[13.5px] text-[var(--brand-text)] outline-none cursor-pointer"
                      style="appearance: none; -webkit-appearance: none; -moz-appearance: none;"
                    >
                      <option :value="null">Any reason</option>
                      <option v-for="r in reasons" :key="r.id" :value="r.id">{{ r.name }}</option>
                    </select>
                    <button v-if="autoReasonId" type="button" class="text-[var(--brand-text-quiet)] outline-none shrink-0" @click="clearReason">
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex justify-center py-4">
                <div class="flex flex-col items-center">
                  <div class="w-px h-5 bg-[var(--brand-border-light)]" />
                  <div class="w-[30px] h-[30px] rounded-full border-[1.5px] border-[var(--brand-border-light)] bg-[var(--brand-surface-white)] flex items-center justify-center">
                    <ArrowDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="2.5" />
                  </div>
                </div>
              </div>

              <div class="inline-flex items-center gap-1.5 bg-[var(--brand-settings-pill-bg)] rounded-full px-3.5 py-1.5 mb-4">
                <Zap class="w-3 h-3 text-[var(--brand-olive)]" />
                <span class="text-[11px] font-bold text-[var(--brand-olive)] uppercase tracking-[0.04em]">Then do this</span>
              </div>

              <div class="flex flex-col gap-2.5">
                <div
                  v-for="action in autoActions"
                  :key="action.id"
                  class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[16px] px-5 py-4"
                >
                  <div class="flex items-center gap-2.5 mb-3">
                    <component :is="templateFor(action.type).icon" class="w-4 h-4 text-[var(--brand-olive)] shrink-0" />
                    <span class="flex-1 text-[13.5px] font-bold text-[var(--brand-text)]">{{ templateFor(action.type).title }}</span>
                    <button type="button" class="text-[var(--brand-text-quiet)] outline-none shrink-0" @click="removeAction(action.id)">
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div v-if="action.type === 'notify'" class="relative">
                    <select
                      v-model="action.emailTemplate"
                      class="w-full appearance-none box-border pl-3.5 pr-9 py-2.5 rounded-[9px] border border-[var(--brand-border)] text-[13px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] cursor-pointer"
                    >
                      <option v-for="opt in EMAIL_TEMPLATE_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <input
                    v-else-if="action.type === 'talent'"
                    v-model="action.talentPool"
                    type="text"
                    placeholder="e.g. Future Engineering candidates"
                    class="w-full box-border px-3.5 py-2.5 rounded-[9px] border border-[var(--brand-border)] text-[13px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] focus:border-[var(--brand-teal)] transition-colors"
                  >
                  <input
                    v-else-if="action.type === 'task'"
                    v-model="action.taskName"
                    type="text"
                    placeholder="e.g. Follow up on disqualified candidate"
                    class="w-full box-border px-3.5 py-2.5 rounded-[9px] border border-[var(--brand-border)] text-[13px] text-[var(--brand-text)] outline-none bg-[var(--brand-canvas)] focus:border-[var(--brand-teal)] transition-colors"
                  >
                </div>
              </div>

              <div class="mt-3.5 border border-[var(--brand-border-light)] rounded-[12px] bg-[var(--brand-surface-white)] overflow-hidden">
                <BrandButton
                  variant="ghost"
                  class="w-full rounded-none gap-1.5 text-[var(--brand-olive)] hover:text-[var(--brand-olive)]"
                  @click="showActionPicker = !showActionPicker"
                >
                  <Plus class="w-3.5 h-3.5" />
                  Add an action
                </BrandButton>
                <div v-if="showActionPicker" class="border-t border-[var(--brand-border-fade)] px-4 py-3.5 flex flex-wrap gap-2">
                  <button
                    v-for="tpl in AUTOMATION_TEMPLATES"
                    :key="tpl.key"
                    type="button"
                    class="inline-flex items-center gap-1.5 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-[8px] px-3 py-[7px] text-[13px] text-[var(--brand-text)] outline-none hover:border-[var(--brand-teal)] transition-colors"
                    @click="addAction(tpl.key)"
                  >
                    <component :is="tpl.icon" class="w-3.5 h-3.5 text-[var(--brand-icon-default)]" />
                    {{ tpl.title }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-3.5 border-t border-[var(--brand-border-light)] bg-[var(--brand-badge-settings-bg)] rounded-b-[24px] flex items-center gap-2">
            <Zap class="w-3.5 h-3.5 text-[var(--brand-olive)] shrink-0" />
            <span class="text-[13px] text-[var(--brand-olive)]">When a candidate is <strong>disqualified</strong>, then perform the selected actions.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
