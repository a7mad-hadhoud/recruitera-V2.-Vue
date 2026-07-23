<!--
  "Set up an automation" modal — opened from the ⚡ button on a pipeline
  stage in the Workflow tab. Mirrors the Settings disqualify-reason
  automation chooser: a stage-scoped list of actions that fire when a
  candidate reaches this stage.

  Reuses the shadcn Dialog primitive + --brand-* tokens; emits `select`
  with the chosen action key so the parent can append the automation.
-->
<script setup lang="ts">
import { X, Mail, Briefcase, ClipboardCheck, ChevronRight } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'

type AutomationAction = 'notify' | 'talent-pool' | 'task'

const props = defineProps<{ stageName?: string }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ select: [action: AutomationAction] }>()

const OPTIONS: { key: AutomationAction; icon: any; title: string; desc: string }[] = [
  { key: 'notify',      icon: Mail,            title: 'Notify the candidate',     desc: "Send an email letting the candidate know they've reached this stage." },
  { key: 'talent-pool', icon: Briefcase,       title: 'Tag and add to talent pool', desc: 'Tag the candidate and add them to a talent pool for future roles.' },
  { key: 'task',        icon: ClipboardCheck,  title: 'Add task for recruiter',   desc: 'Create a task to remind the recruiter about the next step.' },
]

function choose(action: AutomationAction) {
  emit('select', action)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-0 rounded-[20px] !max-w-[560px] sm:!max-w-[560px] w-[94vw] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-[var(--brand-canvas)] overflow-hidden"
    >
      <div class="p-7">
        <!-- Header -->
        <div class="flex items-start gap-3 mb-2">
          <DialogTitle class="flex-1 text-[22px] font-bold text-[var(--brand-text)] leading-tight">Set up an automation</DialogTitle>
          <button
            type="button"
            class="w-8 h-8 rounded-[8px] inline-flex items-center justify-center bg-white text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] shadow-[0_1px_3px_rgba(0,20,18,0.08)] transition"
            aria-label="Close"
            @click="open = false"
          >
            <X class="w-4 h-4" stroke-width="2" />
          </button>
        </div>
        <p class="text-[14px] text-[var(--brand-text-quiet)] mb-5">
          Choose what happens automatically when a candidate is moved to
          <span class="font-semibold text-[var(--brand-text-secondary)]">{{ stageName || 'this stage' }}</span>.
        </p>

        <!-- Options -->
        <div class="flex flex-col gap-3">
          <button
            v-for="o in OPTIONS"
            :key="o.key"
            type="button"
            class="group flex items-center gap-4 text-left rounded-[14px] bg-white border border-[var(--brand-border-fade)] px-5 py-4 hover:border-[var(--brand-teal)] hover:shadow-[0_4px_16px_rgba(0,20,18,0.08)] transition"
            @click="choose(o.key)"
          >
            <span class="w-11 h-11 rounded-[10px] inline-flex items-center justify-center bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)] group-hover:bg-[var(--brand-lime-tint)] group-hover:text-[var(--brand-teal)] shrink-0 transition">
              <component :is="o.icon" class="w-5 h-5" stroke-width="1.8" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-[15px] font-bold text-[var(--brand-text)]">{{ o.title }}</span>
              <span class="block text-[13px] text-[var(--brand-text-quiet)] mt-0.5 leading-relaxed">{{ o.desc }}</span>
            </span>
            <ChevronRight class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" stroke-width="2" />
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
