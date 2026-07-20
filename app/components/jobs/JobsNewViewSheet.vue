<!--
  Inline "New view" panel — replaces the JobsFilters sidebar column while
  the user is creating a new saved view. Same rounded-tl white-card shell
  as JobsFilters so the swap is invisible outside the body content.
  Layout: Title input → View mode (List / Table) → Visibility options →
  Save / Cancel. Board mode omitted per product decision.
-->
<script setup lang="ts">
import { Smile, Lock, Globe, Users, Check, ChevronDown, Rows3, Columns3 } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

export type ViewVisibility = 'everyone' | 'selected' | 'me'
export type ViewMode = 'list' | 'table'

const emit = defineEmits<{
  cancel: []
  save: [payload: { title: string; visibility: ViewVisibility; mode: ViewMode }]
}>()

const title = ref('')
const visibility = ref<ViewVisibility>('me')
const mode = ref<ViewMode>('list')

const VIS: { key: ViewVisibility; label: string; short: string; desc: string; icon: unknown }[] = [
  { key: 'everyone', label: 'Everyone at Recruitera', short: 'Visible to everyone',    desc: 'Visible to all team members',                icon: Globe },
  { key: 'selected', label: 'Selected team members',  short: 'Visible to selected',    desc: 'Visible only to selected people and roles',  icon: Users },
  { key: 'me',       label: 'Only me',                short: 'Visible only to me',     desc: 'Visible only to you',                        icon: Lock },
]

const MODES: { key: ViewMode; label: string; icon: unknown }[] = [
  { key: 'list',  label: 'List',  icon: Rows3 },
  { key: 'table', label: 'Table', icon: Columns3 },
]

const visSummary = computed(() => VIS.find(v => v.key === visibility.value)!)

function reset() {
  title.value = ''
  visibility.value = 'me'
  mode.value = 'list'
}
function onCancel() { reset(); emit('cancel') }
function onSave() {
  emit('save', {
    title: title.value.trim() || 'New view',
    visibility: visibility.value,
    mode: mode.value,
  })
  reset()
}
</script>

<template>
  <aside
    class="w-[264px] shrink-0 h-full flex flex-col rounded-tl-[22px] bg-white border-t border-l border-r border-[var(--brand-border)] overflow-hidden"
  >
    <!-- Header -->
    <div class="px-5 pt-5 pb-4 border-b border-[var(--brand-border-fade)]">
      <div class="text-[18px] font-bold text-[var(--brand-text)]">New view</div>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto p-5">
      <!-- Title input -->
      <div class="flex items-center gap-2.5 border border-[var(--brand-border)] rounded-[10px] px-3.5 py-2.5 mb-5 bg-[var(--brand-canvas)]">
        <Smile class="w-4 h-4 text-[var(--brand-text-faint)] shrink-0" stroke-width="1.7" />
        <input
          v-model="title"
          type="text"
          placeholder="Enter a view title"
          class="flex-1 bg-transparent outline-none text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]"
        >
      </div>

      <!-- View mode (List / Table) -->
      <div class="grid grid-cols-2 gap-2.5 mb-5">
        <button
          v-for="m in MODES"
          :key="m.key"
          class="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[10px] border transition"
          :class="mode === m.key
            ? 'border-[var(--brand-teal)] bg-[var(--brand-lime-tint)] text-[var(--brand-olive)]'
            : 'border-[var(--brand-border)] bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)]/40'"
          @click="mode = m.key"
        >
          <component :is="m.icon" class="w-4 h-4" stroke-width="1.8" />
          <span class="text-[12.5px] font-semibold">{{ m.label }}</span>
        </button>
      </div>

      <!-- Visibility -->
      <div class="mb-5">
        <div class="text-[14px] font-bold text-[var(--brand-text)] mb-2.5">Visibility options</div>
        <Popover>
          <PopoverTrigger as-child>
            <button class="flex items-center gap-2.5 w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-[10px] bg-[var(--brand-canvas)] text-left hover:brightness-98">
              <component :is="visSummary.icon" class="w-4 h-4 text-[var(--brand-text-secondary)] shrink-0" stroke-width="1.7" />
              <span class="flex-1 text-[14px] text-[var(--brand-text)]">{{ visSummary.short }}</span>
              <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)]" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            class="w-[280px] p-0 rounded-[12px] border border-[var(--brand-border-light)] shadow-[0_8px_28px_rgba(0,20,18,0.16)]"
          >
            <div class="px-4 py-3.5 text-[14px] font-bold text-[var(--brand-text)] border-b border-[var(--brand-border-fade)] text-center">
              Visibility Options
            </div>
            <button
              v-for="opt in VIS"
              :key="opt.key"
              class="flex items-start gap-3 px-4 py-3.5 w-full text-left cursor-pointer border-b border-[var(--brand-border-fade)] last:border-b-0 hover:bg-[var(--brand-lime-tint)]/40"
              @click="visibility = opt.key"
            >
              <component :is="opt.icon" class="w-4 h-4 text-[var(--brand-text-secondary)] mt-0.5 shrink-0" stroke-width="1.7" />
              <div class="flex-1">
                <div class="text-[14px] font-bold text-[var(--brand-text)]">{{ opt.label }}</div>
                <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ opt.desc }}</div>
              </div>
              <Check
                v-if="visibility === opt.key"
                class="w-4 h-4 text-[var(--brand-status-approved-text)] mt-0.5 shrink-0"
                stroke-width="2.5"
              />
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-5 pb-5 flex flex-col gap-2">
      <button
        class="w-full py-3 rounded-[10px] bg-[var(--brand-teal)] text-white text-[15px] font-bold hover:brightness-110"
        @click="onSave"
      >Save view</button>
      <button
        class="w-full py-2.5 rounded-[10px] text-[14px] font-semibold text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint)]/40"
        @click="onCancel"
      >Cancel</button>
    </div>
  </aside>
</template>
