<!--
  One row in the Overview-tab aside "jobs" card: status dot + job title +
  collapsible stage/action body. Extracted because a candidate can be linked
  to multiple jobs — this repeats N times inside the same white card shell.
-->
<script setup lang="ts">
import { ChevronDown, GripVertical, XCircle, ArrowRight, RotateCcw, Check } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import type { CandidateJob } from '~/types'

const props = defineProps<{
  job: CandidateJob
  location: string
  assignedDate: string
}>()

const emit = defineEmits<{
  disqualify: []
  proceed: []
  requalify: []
}>()

const open = ref(true)

const STAGES = ['Applied', 'Phone Interview', 'Assessment', 'Offer'] as const
const stage = ref<typeof STAGES[number]>('Applied')
</script>

<template>
  <div class="border-b border-[var(--brand-border-hairline)] last:border-b-0">
    <button
      type="button"
      class="w-full flex items-center gap-2.5 px-5 pt-3 pb-1 cursor-pointer text-left"
      @click="open = !open"
    >
      <GripVertical class="w-3.5 h-3.5 text-[var(--brand-border-mid)] shrink-0" />
      <span class="flex-1 inline-flex items-center gap-2 text-[14px] font-bold text-[var(--brand-text)]">
        <span
          class="w-[9px] h-[9px] rounded-full shrink-0"
          :class="job.disqualified ? 'bg-[var(--brand-danger)]' : 'bg-[var(--brand-status-teal-green)]'"
        />
        {{ job.title }}
      </span>
      <ChevronDown
        class="w-4 h-4 text-[var(--brand-text-quiet)] transition-transform duration-150 shrink-0"
        :class="{ 'rotate-180': open }"
        stroke-width="2"
      />
    </button>
    <div v-show="open" class="px-5 pt-0.5 pb-4">
      <span
        v-if="job.disqualified"
        class="text-[14px] font-semibold text-[var(--brand-danger)]"
      >Not a fit</span>
      <DropdownMenu v-else>
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            class="inline-flex items-center gap-2 mt-1.5 font-semibold text-[14px] text-[var(--brand-text)] bg-[var(--brand-surface-hover)] border border-[var(--brand-border)] rounded-[10px] px-3.5 py-2 cursor-pointer"
          >
            {{ stage }}
            <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-icon-default)]" stroke-width="2" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="min-w-[180px] p-1.5 rounded-[12px]">
          <DropdownMenuItem v-for="s in STAGES" :key="s" class="flex items-center justify-between gap-2 text-[13.5px]" @click="stage = s">
            {{ s }}
            <Check v-if="stage === s" class="w-3.5 h-3.5 text-[var(--brand-teal)]" stroke-width="2" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div class="text-[13px] text-[var(--brand-text-quiet)] mt-3">
        Assigned {{ assignedDate }} · {{ location }}
      </div>
      <div v-if="job.disqualified" class="mt-4">
        <BrandButton variant="outline" size="md" class="w-full !text-[var(--brand-success)] !border-[var(--brand-success)]/35" @click="emit('requalify')">
          <RotateCcw class="w-4 h-4" stroke-width="1.9" />Requalify
        </BrandButton>
      </div>
      <div v-else class="flex gap-2.5 mt-4">
        <BrandButton variant="outline" size="md" class="flex-1 !text-[var(--brand-danger)] !border-[var(--brand-danger)]/25" @click="emit('disqualify')">
          <XCircle class="w-4 h-4" stroke-width="1.8" />Disqualify
        </BrandButton>
        <BrandButton variant="primary-teal" size="md" class="flex-1" @click="emit('proceed')">
          Proceed<ArrowRight class="w-4 h-4" stroke-width="2" />
        </BrandButton>
      </div>
    </div>
  </div>
</template>
