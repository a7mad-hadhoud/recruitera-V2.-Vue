<!--
  Single approval step: numbered badge · title · SLA input · delete step,
  then approvers list + Add-approver button + ALL/ANY rule row.
  `compact` variant is smaller-padded for use inside dept-flow steps.
-->
<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { ApprovalStep, Approver } from '~/types/approval.types'
import ApproverChip from './ApproverChip.vue'
import ApprovalRuleToggle from './ApprovalRuleToggle.vue'

const props = withDefaults(defineProps<{
  step: ApprovalStep
  index: number
  compact?: boolean
}>(), {
  compact: false,
})

const emit = defineEmits<{
  'update:step': [ApprovalStep]
  'add-approver': [event: MouseEvent]
  'remove-approver': [approverId: string]
  'delete-step': []
}>()

function updateSla(value: number) {
  emit('update:step', { ...props.step, slaDays: Math.max(1, value || 1) })
}
function updateRule(rule: 'ALL' | 'ANY') {
  emit('update:step', { ...props.step, rule })
}

const isFirst = computed(() => props.index === 0)

const badgeSize = computed(() => props.compact ? 'w-[22px] h-[22px] rounded-[7px] text-[11px]' : 'w-[26px] h-[26px] rounded-[8px] text-[12px]')

const slaContainerCls = computed(() => props.compact
  ? 'bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[7px] px-2 py-0.5'
  : 'bg-[var(--brand-settings-modal-bg)] rounded-[8px] px-2.5 py-1',
)

const stepCardCls = computed(() => props.compact
  ? 'bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden'
  : 'bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[14px] overflow-hidden',
)
</script>

<template>
  <div :class="stepCardCls">
    <!-- header: number badge / Step N / SLA / delete -->
    <div
      class="flex items-center border-b border-[var(--brand-border-fade)]"
      :class="compact ? 'gap-2.5 px-3.5 py-3' : 'gap-3 px-[18px] py-3.5'"
    >
      <div
        class="flex items-center justify-center font-extrabold shrink-0"
        :class="[
          badgeSize,
          isFirst ? 'bg-[var(--brand-teal)] text-[var(--brand-lime)]' : 'bg-[var(--brand-badge-settings-bg)] text-[var(--brand-badge-settings-text)]',
        ]"
      >
        {{ index + 1 }}
      </div>
      <span class="flex-1 font-bold text-[var(--brand-text)]" :class="compact ? 'text-[13.5px]' : 'text-[14px]'">
        Step {{ index + 1 }}
      </span>
      <div class="flex items-center gap-1.5">
        <span class="font-semibold text-[var(--brand-text-muted)]" :class="compact ? 'text-[12px]' : 'text-[12.5px]'">
          SLA:
        </span>
        <div class="flex items-center gap-1" :class="slaContainerCls">
          <input
            :value="step.slaDays"
            type="number"
            min="1"
            class="border-0 bg-transparent font-bold text-[var(--brand-text)] outline-none text-center tabular-nums"
            :class="compact ? 'w-8 text-[13px]' : 'w-9 text-[13px]'"
            @input="updateSla(Number(($event.target as HTMLInputElement).value))"
          >
          <span :class="compact ? 'text-[12px] text-[var(--brand-text-quiet)]' : 'text-[12.5px] text-[var(--brand-text-quiet)]'">
            days
          </span>
        </div>
        <button
          type="button"
          class="rounded-[6px] border-none bg-transparent text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] transition-colors"
          :class="compact ? 'px-[7px] py-1' : 'px-2 py-[5px] rounded-[7px]'"
          title="Delete step"
          @click="emit('delete-step')"
        >
          <Trash2 :class="compact ? 'w-3 h-3' : 'w-[13px] h-[13px]'" />
        </button>
      </div>
    </div>

    <!-- body: approvers + rule -->
    <div :class="compact ? 'px-3.5 py-3' : 'px-[18px] py-3.5'">
      <div class="font-semibold text-[var(--brand-text-quiet)] uppercase tracking-[0.04em] mb-2" :class="compact ? 'text-[12px] mb-1.5' : 'text-[12.5px]'">
        Approvers
      </div>
      <div class="flex flex-wrap items-center mb-3" :class="compact ? 'gap-1.5' : 'gap-2'">
        <ApproverChip
          v-for="a in step.approvers"
          :key="a.id"
          :type="a.type"
          :name="a.name"
          :initials="a.initials"
          :compact="compact"
          @remove="emit('remove-approver', a.id)"
        />
        <button
          type="button"
          class="inline-flex items-center border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[var(--brand-text-muted)] outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
          :class="compact
            ? 'gap-1 px-2 py-1 rounded-[6px] text-[12px]'
            : 'gap-1.5 px-2.5 py-[5px] rounded-[7px] text-[12.5px]'"
          @click="emit('add-approver', $event)"
        >
          <Plus :class="compact ? 'w-2.5 h-2.5' : 'w-3 h-3'" />
          Add approver
        </button>
      </div>

      <div class="flex items-center gap-2.5">
        <span class="font-semibold text-[var(--brand-text-quiet)] uppercase tracking-[0.04em]" :class="compact ? 'text-[12px]' : 'text-[12.5px]'">
          {{ compact ? 'Rule:' : 'Approval rule:' }}
        </span>
        <ApprovalRuleToggle :model-value="step.rule" :compact="compact" @update:model-value="updateRule" />
        <span v-if="!compact" class="text-[12.5px] text-[var(--brand-text-quiet)]">
          {{ step.rule === 'ALL' ? 'All approvers must approve' : 'Any approver can approve' }}
        </span>
      </div>
    </div>
  </div>
</template>
