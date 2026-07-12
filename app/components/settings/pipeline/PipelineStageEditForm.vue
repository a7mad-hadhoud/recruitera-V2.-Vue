<!--
  Inline stage editor used by pipeline.vue for both "edit existing stage" and
  "add new stage" — a single shared component so the two flows can't drift
  out of sync with each other (they used to be copy-pasted and did).
-->
<script setup lang="ts">
import { Clock, Info, ChevronDown, Trash2 } from 'lucide-vue-next'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import { PIPELINE_TYPE_COLORS } from '~/types'
import type { PipelineStageType } from '~/types'

const props = defineProps<{
  draft: { name: string, type: PipelineStageType, sla: string }
  typeOptions: PipelineStageType[]
  slas: string[]
  isNew: boolean
}>()

defineEmits<{
  cancel: []
  delete: []
  save: [addAnother: boolean]
}>()
</script>

<template>
  <div class="bg-[var(--brand-email-highlight-bg)] border border-[var(--brand-email-highlight-border)] rounded-[12px] mb-2 px-4 pt-4 pb-3">
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <label class="block text-[11px] font-bold text-[var(--brand-text-subtle)] uppercase tracking-[0.05em] mb-1.5">Stage name</label>
        <input v-model="draft.name" type="text" placeholder="e.g. Phone Screen" class="w-full border-[1.5px] border-[var(--brand-teal)] rounded-[9px] px-3.5 py-2 text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]">
      </div>
      <div>
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-text-subtle)] uppercase tracking-[0.05em] mb-1.5">
          Type
          <Info class="w-3 h-3 normal-case" title="Select a stage type to connect this stage's data to reports." />
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button type="button" class="w-full flex items-center justify-between gap-2 border border-[var(--brand-border-mid)] rounded-[9px] px-3.5 py-2 bg-[var(--brand-surface-white)] outline-none">
              <span class="flex items-center gap-2 text-[13px] text-[var(--brand-text)]">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: PIPELINE_TYPE_COLORS[draft.type] }" />
                {{ draft.type }}
              </span>
              <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-[200px]">
            <DropdownMenuItem v-for="opt in typeOptions" :key="opt" class="gap-2.5 py-2 text-[13px] cursor-pointer" @click="draft.type = opt">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: PIPELINE_TYPE_COLORS[opt] }" />
              {{ opt }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="mb-3">
      <label class="flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-text-subtle)] uppercase tracking-[0.05em] mb-1.5">
        <Clock class="w-3 h-3" />
        Time limit
        <Info class="w-3 h-3 normal-case" title="Candidates who exceed this stage's time limit will be flagged as overdue." />
      </label>
      <select v-model="draft.sla" class="w-full border border-[var(--brand-border-mid)] rounded-[9px] px-3.5 py-2 text-[13px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]">
        <option v-for="s in slas" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <div class="flex items-center justify-between pt-2.5 border-t border-[var(--brand-email-highlight-border)]">
      <button v-if="!isNew" type="button" class="flex items-center gap-1.5 text-[13px] text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-settings-danger)] transition-colors" @click="$emit('delete')">
        <Trash2 class="w-3.5 h-3.5" />
        Delete
      </button>
      <div v-else />
      <div class="flex items-center gap-2">
        <button type="button" class="text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none px-3 py-1.5" @click="$emit('cancel')">Cancel</button>
        <button type="button" class="border border-[var(--brand-border-mid)] rounded-[9px] px-3.5 py-1.5 text-[13px] font-medium text-[var(--brand-nav-text)] bg-[var(--brand-surface-white)] outline-none disabled:opacity-50" :disabled="!draft.name.trim()" @click="$emit('save', true)">Save and add another</button>
        <button type="button" class="bg-[var(--brand-teal)] text-white rounded-[9px] px-4 py-1.5 text-[13px] font-bold outline-none disabled:opacity-50" :disabled="!draft.name.trim()" @click="$emit('save', false)">Save</button>
      </div>
    </div>
  </div>
</template>
