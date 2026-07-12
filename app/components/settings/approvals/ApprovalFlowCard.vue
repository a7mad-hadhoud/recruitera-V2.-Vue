<!--
  Collapsible card that contains the flow header (name, summary, chevron) and
  a stack of ApprovalStepCards + "Add step" dashed button. Optional delete
  button on the header for department flows.

  `variant`:
    - 'default' → the org-wide default flow (larger steps, no delete button)
    - 'dept'    → a per-department flow (smaller/compact steps, red delete btn)
-->
<script setup lang="ts">
import { ChevronDown, Plus, Trash2 } from 'lucide-vue-next'
import { flowSummary, newStepId } from '~/types/approval.types'
import type { ApprovalFlow, ApprovalStep } from '~/types/approval.types'
import ApprovalStepCard from './ApprovalStepCard.vue'

const props = withDefaults(defineProps<{
  flow: ApprovalFlow
  open: boolean
  variant?: 'default' | 'dept'
  summarySuffix?: string
  deletable?: boolean
}>(), {
  variant: 'default',
  summarySuffix: '',
  deletable: false,
})

const emit = defineEmits<{
  'toggle': []
  'update:flow': [ApprovalFlow]
  'add-approver': [step: ApprovalStep, event: MouseEvent]
  'remove-approver': [step: ApprovalStep, approverId: string]
  'delete-flow': []
}>()

const compact = computed(() => props.variant === 'dept')

function updateStep(updated: ApprovalStep) {
  const steps = props.flow.steps.map(s => s.id === updated.id ? updated : s)
  emit('update:flow', { ...props.flow, steps })
}
function deleteStep(id: string) {
  emit('update:flow', { ...props.flow, steps: props.flow.steps.filter(s => s.id !== id) })
}
function addStep() {
  emit('update:flow', {
    ...props.flow,
    steps: [...props.flow.steps, { id: newStepId(), slaDays: 3, approvers: [], rule: 'ALL' }],
  })
}
function removeApproverInStep(step: ApprovalStep, approverId: string) {
  emit('remove-approver', step, approverId)
}
function addApproverInStep(step: ApprovalStep, event: MouseEvent) {
  emit('add-approver', step, event)
}

const summary = computed(() => {
  const base = flowSummary(props.flow)
  return props.summarySuffix ? `${base} · ${props.summarySuffix}` : base
})
</script>

<template>
  <div class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[14px] overflow-hidden">
    <div
      class="flex items-center gap-3 w-full cursor-pointer"
      :class="compact ? 'px-[18px] py-3.5' : 'px-5 py-4'"
      @click="emit('toggle')"
    >
      <div class="flex-1">
        <div class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">{{ flow.name }}</div>
        <div class="text-[12.5px] text-[var(--brand-text-quiet)]">{{ summary }}</div>
      </div>
      <button
        v-if="deletable"
        type="button"
        class="rounded-[7px] px-2 py-1 border-none bg-transparent text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors"
        title="Delete flow"
        @click.stop="emit('delete-flow')"
      >
        <Trash2 class="w-[13px] h-[13px]" />
      </button>
      <ChevronDown
        class="w-4 h-4 text-[var(--brand-text-quiet)] transition-transform shrink-0"
        :class="{ 'rotate-180': open }"
      />
    </div>

    <div v-if="open" class="border-t border-[var(--brand-border-fade)]" :class="compact ? 'px-[18px] pt-3.5 pb-4' : 'px-5 pt-4 pb-5'">
      <div class="flex flex-col gap-2 mb-2.5">
        <ApprovalStepCard
          v-for="(step, idx) in flow.steps"
          :key="step.id"
          :step="step"
          :index="idx"
          :compact="compact"
          @update:step="updateStep"
          @delete-step="deleteStep(step.id)"
          @add-approver="addApproverInStep(step, $event)"
          @remove-approver="removeApproverInStep(step, $event)"
        />
      </div>

      <button
        type="button"
        class="inline-flex items-center border-[1.5px] border-dashed border-[var(--brand-border-mid)] bg-transparent font-semibold text-[var(--brand-text-muted)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
        :class="compact
          ? 'gap-1.5 rounded-[8px] px-3.5 py-2 text-[12.5px]'
          : 'gap-[7px] rounded-[10px] px-4 py-2.5 text-[13px]'"
        @click="addStep"
      >
        <Plus :class="compact ? 'w-3 h-3' : 'w-3.5 h-3.5'" />
        Add step
      </button>
    </div>
  </div>
</template>
