<!--
  "Add automation" builder — the destination after picking an action in
  the stage automation chooser. Mirrors the Settings automation builder:
  a WHEN-THIS-HAPPENS trigger card + a THEN-DO-THIS list of configurable
  actions, with "Add an action" to append more.

  Scoped to a pipeline stage: the trigger is fixed to "Candidate is moved
  to <stage>". Emits `save` with the configured actions; the parent turns
  them into stage automations. Reuses shadcn Dialog + DropdownMenu +
  --brand-* tokens, no new deps.
-->
<script setup lang="ts">
import { X, Zap, Clock, ArrowDown, Plus, Mail, Briefcase, ClipboardCheck, ChevronDown } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { BrandButton } from '~/components/brand'

type ActionKey = 'notify' | 'talent-pool' | 'task'
interface BuilderAction { id: string; key: ActionKey; config: string }

const props = defineProps<{ stageName?: string; initialAction?: ActionKey | null }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ save: [actions: { key: ActionKey; config: string }[]] }>()

const ACTION_META: Record<ActionKey, { icon: any; title: string; label: string; options: string[] }> = {
  'notify':      { icon: Mail,           title: 'Notify the candidate',       label: 'Email template', options: ['Disqualification email', 'Interview invitation', 'Offer letter', 'Custom email…'] },
  'talent-pool': { icon: Briefcase,      title: 'Tag and add to talent pool', label: 'Talent pool',    options: ['General talent pool', 'Engineering pool', 'Marketing pool', 'Future roles'] },
  'task':        { icon: ClipboardCheck, title: 'Add task for recruiter',     label: 'Assign to',      options: ['Assign to me', 'Assign to hiring manager', 'Assign to coordinator'] },
}
const ADD_OPTIONS: ActionKey[] = ['notify', 'talent-pool', 'task']

function aid() { return `a-${Math.random().toString(36).slice(2, 7)}` }
function makeAction(key: ActionKey): BuilderAction {
  return { id: aid(), key, config: ACTION_META[key].options[0]! }
}

const actions = ref<BuilderAction[]>([])
// Seed with the action the recruiter picked in the chooser each time the
// builder opens.
watch(open, (isOpen) => {
  if (isOpen) actions.value = props.initialAction ? [makeAction(props.initialAction)] : []
})

function addAction(key: ActionKey) { actions.value.push(makeAction(key)) }
function removeAction(id: string) { actions.value = actions.value.filter(a => a.id !== id) }
function onSave() {
  emit('save', actions.value.map(a => ({ key: a.key, config: a.config })))
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-0 rounded-[18px] !max-w-[760px] sm:!max-w-[760px] w-[95vw] max-h-[90vh] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-[var(--brand-canvas)] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-start gap-3 px-7 pt-6 pb-5 border-b border-[var(--brand-border-fade)] bg-[var(--brand-canvas)] shrink-0">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <DialogTitle class="text-[22px] font-bold text-[var(--brand-text)] leading-tight">Add automation</DialogTitle>
            <span class="inline-flex items-center h-[20px] px-1.5 rounded-md text-[11px] font-extrabold tracking-[0.04em] text-[var(--brand-teal)] bg-[var(--brand-lime)]">NEW</span>
          </div>
          <p class="text-[13.5px] text-[var(--brand-text-quiet)] mt-1">
            Build personalised automations by setting triggers and actions.
            <a href="#" class="font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]">Learn more</a>
          </p>
        </div>
        <BrandButton variant="outline" @click="open = false">Give feedback</BrandButton>
        <BrandButton variant="primary-teal" :disabled="!actions.length" @click="onSave">Save automation</BrandButton>
        <button
          type="button"
          class="w-9 h-9 rounded-[9px] inline-flex items-center justify-center bg-white text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] shadow-[0_1px_3px_rgba(0,20,18,0.08)] transition shrink-0"
          aria-label="Close"
          @click="open = false"
        >
          <X class="w-4 h-4" stroke-width="2" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-7 py-6">
        <!-- WHEN THIS HAPPENS -->
        <span class="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-[var(--brand-lime-tint)] text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--brand-teal)]">
          <Zap class="w-3.5 h-3.5" stroke-width="2.2" />
          When this happens
        </span>
        <div class="mt-3 rounded-[14px] bg-white border border-[var(--brand-border-fade)] p-5">
          <div class="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)] mb-2">Start when</div>
          <div class="inline-flex items-center gap-2.5 h-11 px-3.5 rounded-[10px] bg-[var(--brand-canvas)] border border-[var(--brand-border-fade)] text-[14px] text-[var(--brand-text)]">
            <Clock class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
            Candidate is moved to <span class="font-semibold">{{ stageName || 'this stage' }}</span>
          </div>
        </div>

        <!-- connector -->
        <div class="flex justify-center py-3">
          <span class="w-8 h-8 rounded-full bg-white border border-[var(--brand-border-fade)] inline-flex items-center justify-center text-[var(--brand-text-quiet)]">
            <ArrowDown class="w-4 h-4" stroke-width="2" />
          </span>
        </div>

        <!-- THEN DO THIS -->
        <span class="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-[var(--brand-lime-tint)] text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--brand-teal)]">
          <Zap class="w-3.5 h-3.5" stroke-width="2.2" />
          Then do this
        </span>

        <div class="mt-3 flex flex-col gap-3">
          <div
            v-for="a in actions"
            :key="a.id"
            class="rounded-[14px] bg-white border border-[var(--brand-border-fade)] p-5"
          >
            <div class="flex items-center gap-2.5 mb-3">
              <component :is="ACTION_META[a.key].icon" class="w-4 h-4 text-[var(--brand-teal-secondary)]" stroke-width="1.8" />
              <span class="flex-1 text-[15px] font-bold text-[var(--brand-text)]">{{ ACTION_META[a.key].title }}</span>
              <button
                type="button"
                class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:text-[var(--brand-status-closed-text)] hover:bg-[var(--brand-canvas)] transition"
                aria-label="Remove action"
                @click="removeAction(a.id)"
              >
                <X class="w-3.5 h-3.5" stroke-width="2" />
              </button>
            </div>
            <div class="relative">
              <select
                v-model="a.config"
                class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[10px] border border-[var(--brand-border-fade)] bg-[var(--brand-canvas)] appearance-none focus:border-[var(--brand-teal)] focus:outline-none transition"
                :aria-label="ACTION_META[a.key].label"
              >
                <option v-for="opt in ACTION_META[a.key].options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
            </div>
          </div>

          <!-- Add an action -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button
                type="button"
                class="w-full inline-flex items-center justify-center gap-2 h-12 rounded-[12px] bg-white border border-[var(--brand-border-fade)] text-[14px] font-bold text-[var(--brand-text)] hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] transition"
              >
                <Plus class="w-4 h-4" stroke-width="2.2" />
                Add an action
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" class="w-[280px] p-1.5 rounded-[12px]">
              <DropdownMenuItem
                v-for="key in ADD_OPTIONS"
                :key="key"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-[13.5px] font-semibold text-[var(--brand-text)] cursor-pointer"
                @select="addAction(key)"
              >
                <component :is="ACTION_META[key].icon" class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
                {{ ACTION_META[key].title }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Footer summary -->
      <div class="flex items-center gap-2 px-7 py-4 border-t border-[var(--brand-border-fade)] bg-[var(--brand-lime-tint)] shrink-0">
        <Zap class="w-4 h-4 text-[var(--brand-teal)]" stroke-width="2" />
        <span class="text-[13.5px] text-[var(--brand-teal)]">
          When a candidate is moved to <span class="font-bold">{{ stageName || 'this stage' }}</span>, then perform the selected actions.
        </span>
      </div>
    </DialogContent>
  </Dialog>
</template>
