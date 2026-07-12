<script setup lang="ts">
import { Check, ChevronDown, Plus } from 'lucide-vue-next'
import { Switch } from '~/components/ui/switch'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsToggleCard from '~/components/settings/SettingsToggleCard.vue'
import ApprovalFlowCard from '~/components/settings/approvals/ApprovalFlowCard.vue'
import ApproverPickerPopover from '~/components/settings/approvals/ApproverPickerPopover.vue'
import { BrandAvatarInitials } from '~/components/brand'
import type { ApprovalFlow, ApprovalStep, Approver } from '~/types/approval.types'
import { newApproverId, newFlowId, newStepId } from '~/types/approval.types'

definePageMeta({ layout: 'settings' })

// ─────────────── Approver picker options ───────────────
const DYNAMIC_ROLES = [
  { name: 'Hiring Manager', desc: 'Resolved at submission' },
  { name: 'Requisition Owner', desc: 'Resolved at submission' },
  { name: 'Department Head', desc: 'Resolved at submission' },
]
const USER_LIST = [
  { name: 'Mohamed Salem', initials: 'MS', role: 'Head of People' },
  { name: 'Amr Hammad', initials: 'AH', role: 'CEO' },
  { name: 'Sara Al-Farsi', initials: 'SA', role: 'Senior Recruiter' },
  { name: 'James Okafor', initials: 'JO', role: 'Recruiter' },
  { name: 'Lina Mahmoud', initials: 'LM', role: 'Talent Acquisition' },
]

const DEPARTMENT_OPTIONS = ['Engineering', 'Product', 'Sales', 'Human Resources', 'Marketing', 'Finance', 'Operations', 'Design', 'Customer Success']

// ─────────────── State ───────────────
const enabled = ref(true)
const activeTab = ref<'flows' | 'form' | 'setup'>('flows')

const defaultFlow = ref<ApprovalFlow>({
  id: 'default',
  name: 'Default approval flow',
  steps: [
    {
      id: 's-1',
      slaDays: 3,
      approvers: [
        { id: 'a-1', type: 'user', name: 'Mohamed Salem', initials: 'MS' },
        { id: 'a-2', type: 'dynamic', name: 'Hiring Manager' },
      ],
      rule: 'ALL',
    },
    {
      id: 's-2',
      slaDays: 5,
      approvers: [
        { id: 'a-3', type: 'user', name: 'Amr Hammad', initials: 'AH' },
      ],
      rule: 'ANY',
    },
  ],
})
const defaultFlowOpen = ref(false)

// ─────────────── Department flows ───────────────
const deptFlowsEnabled = ref(false)
const deptFlows = ref<ApprovalFlow[]>([])
const openDeptFlows = ref<Set<string>>(new Set())

const availableDepartments = computed(() =>
  DEPARTMENT_OPTIONS.filter(d => !deptFlows.value.some(f => f.name === d)),
)

function toggleDeptFlow(id: string) {
  const s = new Set(openDeptFlows.value)
  s.has(id) ? s.delete(id) : s.add(id)
  openDeptFlows.value = s
}
function updateDeptFlow(idx: number, updated: ApprovalFlow) {
  deptFlows.value[idx] = updated
}
function deleteDeptFlow(id: string) {
  deptFlows.value = deptFlows.value.filter(f => f.id !== id)
  const s = new Set(openDeptFlows.value); s.delete(id); openDeptFlows.value = s
}

// ─────────────── Approver picker ───────────────
const pickerOpen = ref(false)
const pickerAnchor = ref<{ x: number, y: number } | null>(null)
const pickerTargetStep = ref<{ flow: ApprovalFlow, step: ApprovalStep } | null>(null)

function openPicker(flow: ApprovalFlow, step: ApprovalStep, event: MouseEvent) {
  pickerTargetStep.value = { flow, step }
  const btn = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  pickerAnchor.value = { x: rect.left, y: rect.bottom + 6 }
  pickerOpen.value = true
}
function closePicker() {
  pickerOpen.value = false
  pickerTargetStep.value = null
}
function pickApprover(picked: { type: 'user' | 'dynamic', name: string, initials?: string }) {
  const target = pickerTargetStep.value
  if (!target) return
  const dup = target.step.approvers.some(a => a.name === picked.name)
  if (!dup) {
    target.step.approvers.push({
      id: newApproverId(),
      type: picked.type,
      name: picked.name,
      initials: picked.initials,
    })
  }
  closePicker()
}

function removeApprover(_flow: ApprovalFlow, step: ApprovalStep, approverId: string) {
  step.approvers = step.approvers.filter(a => a.id !== approverId)
}

// ─────────────── Add department flow modal ───────────────
const addDeptModalOpen = ref(false)
const addDeptSelection = ref('')

function openAddDeptModal() {
  addDeptSelection.value = ''
  addDeptModalOpen.value = true
}
function confirmAddDept() {
  const name = addDeptSelection.value
  if (!name) return
  const id = newFlowId()
  deptFlows.value.push({
    id,
    name,
    steps: [{ id: newStepId(), slaDays: 3, approvers: [], rule: 'ALL' }],
  })
  const s = new Set(openDeptFlows.value); s.add(id); openDeptFlows.value = s
  addDeptModalOpen.value = false
}

// ─────────────── Setup tab state ───────────────
const setupRequireReq = ref(false)
const setupAllowWithdraw = ref(true)
const setupAutoAssign = ref(false)
const recruiterAssignments = ref<Record<string, string>>({
  Engineering: 'Sara Al-Farsi',
  Product: 'James Okafor',
  Sales: '',
  Marketing: '',
})
const SLA_ITEMS = [
  'Reminder to approver at T-2 days before SLA',
  'Reminder to approver on SLA day',
  'Escalation to admin at +1, +3, +5 days overdue',
]

// recruiter picker (setup tab) — reuses ApproverPickerPopover with a "No assignment" clear option, no dynamic roles
const recPickerOpen = ref(false)
const recPickerDept = ref<string | null>(null)
const recPickerAnchor = ref<{ x: number, y: number } | null>(null)
const RECRUITER_ROLE_OPTIONS: { name: string, desc: string }[] = []

function openRecPicker(dept: string, event: MouseEvent) {
  recPickerDept.value = dept
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  recPickerAnchor.value = { x: rect.left, y: rect.bottom + 6 }
  recPickerOpen.value = true
}
function closeRecPicker() {
  recPickerOpen.value = false
  recPickerDept.value = null
}
function pickRecruiter(picked: { name: string }) {
  if (recPickerDept.value) recruiterAssignments.value[recPickerDept.value] = picked.name
  closeRecPicker()
}
function clearRecruiter() {
  if (recPickerDept.value) recruiterAssignments.value[recPickerDept.value] = ''
  closeRecPicker()
}
</script>

<template>
  <div class="relative">
    <SettingsPageHeader
      title="Requisition approvals"
      subtitle="Create job requisitions and link them with jobs that you are hiring for."
      learn-more-href="#"
      learn-more-label="How requisitions work"
      no-divider
      class="relative z-20"
    >
      <template #title-suffix>
        <Switch v-model="enabled" class="data-[state=checked]:bg-[var(--brand-teal)]" />
      </template>
    </SettingsPageHeader>

    <!-- Tabs -->
    <div class="flex gap-0 border-b border-[var(--brand-border-light)] mt-4 mb-6 relative z-20">
      <button
        v-for="tab in [
          { key: 'flows', label: 'Approval flows' },
          { key: 'form', label: 'Requisition form' },
          { key: 'setup', label: 'Setup' },
        ]"
        :key="tab.key"
        type="button"
        class="px-4 py-2.5 text-[14px] outline-none border-b-2 -mb-px transition-colors"
        :class="activeTab === tab.key
          ? 'font-semibold text-[var(--brand-text)] border-[var(--brand-text)]'
          : 'font-normal text-[var(--brand-text-quiet)] border-transparent hover:text-[var(--brand-text)]'"
        @click="activeTab = tab.key as any"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content (dimmed when master toggle is off) -->
    <div :class="{ 'opacity-40 pointer-events-none select-none': !enabled }">
      <!-- ─── Approval flows tab ─── -->
      <div v-if="activeTab === 'flows'">
        <ApprovalFlowCard
          v-model:flow="defaultFlow"
          :open="defaultFlowOpen"
          summary-suffix="Applies to all depts without a specific flow"
          class="mb-5"
          @toggle="defaultFlowOpen = !defaultFlowOpen"
          @add-approver="(step, e) => openPicker(defaultFlow, step, e)"
          @remove-approver="(step, id) => removeApprover(defaultFlow, step, id)"
        />

        <div class="h-px bg-[var(--brand-border-light)] my-5" />

        <SettingsToggleCard
          v-model="deptFlowsEnabled"
          title="Department-based flows"
          description="When enabled, the department selected on the requisition determines which flow is used. Falls back to default if none configured."
        >
          <template #body>
            <div v-if="deptFlows.length" class="flex flex-col gap-2 mb-2.5">
              <ApprovalFlowCard
                v-for="(f, idx) in deptFlows"
                :key="f.id"
                :flow="f"
                :open="openDeptFlows.has(f.id)"
                variant="dept"
                :deletable="true"
                @toggle="toggleDeptFlow(f.id)"
                @update:flow="(u) => updateDeptFlow(idx, u)"
                @add-approver="(step, e) => openPicker(f, step, e)"
                @remove-approver="(step, id) => removeApprover(f, step, id)"
                @delete-flow="deleteDeptFlow(f.id)"
              />
            </div>

            <button
              type="button"
              class="flex items-center justify-center gap-2 w-full py-3 border-[1.5px] border-dashed border-[var(--brand-border-mid)] rounded-[12px] bg-transparent text-[13.5px] font-semibold text-[var(--brand-text-muted)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
              @click="openAddDeptModal"
            >
              <Plus class="w-3.5 h-3.5" />
              Add department flow
            </button>
          </template>
        </SettingsToggleCard>
      </div>

      <!-- ─── Requisition form tab ─── -->
      <div v-else-if="activeTab === 'form'" class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[14px] p-8 text-center">
        <div class="text-[14px] font-semibold text-[var(--brand-text-muted)]">Requisition form builder coming soon</div>
        <p class="text-[13px] text-[var(--brand-text-quiet)] mt-1">Add/reorder fields collected on requisitions.</p>
      </div>

      <!-- ─── Setup tab ─── -->
      <div v-else>
        <div class="text-[15px] font-bold text-[var(--brand-text)] mb-1">Setup</div>
        <p class="text-[13.5px] text-[var(--brand-text-quiet)] mb-5">Configure how requisitions work in your organization.</p>

        <div class="flex flex-col gap-3">
          <SettingsToggleCard
            v-model="setupRequireReq"
            title="Require requisitions before job creation"
            description="When ON, recruiters cannot create jobs without an approved requisition. When OFF, job creation is unrestricted."
          />

          <SettingsToggleCard
            v-model="setupAllowWithdraw"
            title="Allow hiring managers to withdraw requisitions"
            description="When ON, hiring managers can withdraw a pending requisition at any time."
          />

          <!-- SLA reminders informational card -->
          <div class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[14px] px-5 py-[18px]">
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-[3px]">SLA reminders &amp; escalations</div>
            <p class="text-[13px] text-[var(--brand-text-quiet)] mb-3.5">Automatic reminders and escalations when approval SLAs are breached.</p>
            <div class="flex flex-col gap-2">
              <div v-for="item in SLA_ITEMS" :key="item" class="flex items-center gap-2.5 text-[13.5px] text-[var(--brand-text-secondary)]">
                <Check class="w-3.5 h-3.5 text-[var(--brand-olive)] shrink-0" stroke-width="2.5" />
                <span v-html="item.replace(/(T-2 days|on SLA day|\+1, \+3, \+5 days)/g, '<strong>$1</strong>')" />
              </div>
            </div>
          </div>

          <!-- Auto-assign recruiter (toggle + body table when on) -->
          <SettingsToggleCard
            v-model="setupAutoAssign"
            title="Auto-assign recruiter on approval"
            description="When a requisition is approved, automatically assign it to a recruiter based on the department."
          >
            <template #body>
              <div class="grid grid-cols-2 gap-3 px-1 pb-2 text-[11px] font-bold text-[var(--brand-text-quiet)] uppercase tracking-[0.06em]">
                <span>Department</span>
                <span>Assigned Recruiter</span>
              </div>
              <div class="border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden">
                <div
                  v-for="(dept, i) in Object.keys(recruiterAssignments)"
                  :key="dept"
                  class="grid grid-cols-2 gap-3 items-center px-4 py-3 border-b border-[var(--brand-border-light)] last:border-0"
                  :class="i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]' : 'bg-[var(--brand-surface-white)]'"
                >
                  <span class="text-[13.5px] font-medium text-[var(--brand-text)]">{{ dept }}</span>
                  <button
                    type="button"
                    class="flex items-center gap-2 border rounded-[8px] px-3 py-[7px] bg-[var(--brand-surface-white)] outline-none"
                    :class="recruiterAssignments[dept] ? 'border-[var(--brand-border)]' : 'border-[var(--brand-border-mid)]'"
                    @click="openRecPicker(dept, $event)"
                  >
                    <template v-if="recruiterAssignments[dept]">
                      <BrandAvatarInitials :initials="USER_LIST.find(u => u.name === recruiterAssignments[dept])?.initials || ''" size="sm" />
                      <span class="text-[13px] text-[var(--brand-text)] flex-1 text-left">{{ recruiterAssignments[dept] }}</span>
                    </template>
                    <span v-else class="text-[13px] text-[var(--brand-text-quiet)] flex-1 text-left">Select recruiter...</span>
                    <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)] shrink-0" />
                  </button>
                </div>
              </div>
              <div class="flex justify-end mt-3.5">
                <button
                  type="button"
                  class="bg-[var(--brand-teal)] text-white border-none rounded-[8px] px-5 py-2.5 text-[13px] font-semibold outline-none"
                >
                  Save assignments
                </button>
              </div>
            </template>
          </SettingsToggleCard>
        </div>
      </div>
    </div>

    <!-- Approver picker (shared, floating) -->
    <ApproverPickerPopover
      :open="pickerOpen"
      :anchor="pickerAnchor"
      :roles="DYNAMIC_ROLES"
      :users="USER_LIST"
      @close="closePicker"
      @pick="pickApprover"
    />

    <!-- Recruiter picker (Setup tab) — shared popover, no dynamic roles, with a clear option -->
    <ApproverPickerPopover
      :open="recPickerOpen"
      :anchor="recPickerAnchor"
      :roles="RECRUITER_ROLE_OPTIONS"
      :users="USER_LIST"
      clear-label="No assignment"
      @close="closeRecPicker"
      @pick="pickRecruiter"
      @clear="clearRecruiter"
    />

    <!-- Add department flow modal -->
    <SettingsFormModal
      v-model="addDeptModalOpen"
      title="Add department flow"
      width="440px"
    >
      <div class="mb-1">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Department <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <select
          v-model="addDeptSelection"
          class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
          <option value="">Select department…</option>
          <option v-for="d in availableDepartments" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-[18px] py-2 text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none"
          @click="addDeptModalOpen = false"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-[18px] py-2 rounded-[8px] bg-[var(--brand-teal)] text-white text-[13.5px] font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!addDeptSelection"
          @click="confirmAddDept"
        >
          Add flow
        </button>
      </template>
    </SettingsFormModal>
  </div>
</template>
