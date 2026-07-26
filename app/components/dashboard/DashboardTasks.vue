<!--
  Tasks tab of the Home dashboard — interactive to-do list seeded from MSW
  (useDashboardTasks). Add-task composer, checkbox rows that move between
  To-Do / Done, and a "Task done 🙌" toast on completion. Reuses
  BrandAvatarInitials + BrandEmptyState. Colors are --brand-* tokens only.
-->
<script setup lang="ts">
import { Filter, ListTodo, PartyPopper, Clock, Plus, Check, X } from 'lucide-vue-next'
import { BrandAvatarInitials, BrandEmptyState } from '~/components/brand'
import { useTeamMembers } from '~/composables/useTeam'
import { useDashboardTasks } from '~/composables/useDashboard'
import type { DashboardTask } from '~/types'

const { data: teamData } = useTeamMembers()
const me = computed(() => teamData.value?.data?.[0])
function toInitials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1]![0] : '')).toUpperCase() || 'AH'
}
const myInitials = computed(() => (me.value ? toInitials(me.value.name) : 'AH'))
const myBg = computed(() => me.value?.avatarBg ?? 'var(--brand-avatar-4)')
const AVATAR_TEXT = 'var(--brand-avatar-text)'

// Seed the local, interactive list from MSW.
const { data: tasksData } = useDashboardTasks()
let seq = 0
const tasks = ref<DashboardTask[]>([])
watch(tasksData, (d) => { if (d?.data && !tasks.value.length) tasks.value = [...d.data] }, { immediate: true })

const todo = computed(() => tasks.value.filter(t => !t.done))
const done = computed(() => tasks.value.filter(t => t.done))
const active = ref<'todo' | 'done'>('todo')
const visible = computed(() => (active.value === 'todo' ? todo.value : done.value))

// Composer
const composing = ref(false)
const draft = ref('')
function openComposer() { composing.value = true }
function cancelComposer() { composing.value = false; draft.value = '' }
function addTask() {
  const text = draft.value.trim()
  if (!text) return
  tasks.value.unshift({ id: `t${++seq}-${text.length}`, text, done: false, ago: 'now' })
  draft.value = ''
  composing.value = false
  active.value = 'todo'
}

// Toast
const toast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null
let lastCompleted: string | null = null
function completeTask(t: DashboardTask) {
  t.done = !t.done
  if (t.done) {
    lastCompleted = t.id
    toast.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.value = false), 4000)
  }
}
function undoComplete() {
  const t = tasks.value.find(x => x.id === lastCompleted)
  if (t) t.done = false
  toast.value = false
}
</script>

<template>
  <div class="relative max-w-[1400px] mx-auto px-6 py-6">
    <h2 class="text-[22px] font-bold text-[var(--brand-text)] mb-4">Tasks</h2>

    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="inline-flex items-center gap-1 p-1 rounded-[10px] bg-[var(--brand-canvas)]">
        <button type="button" class="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-semibold transition" :class="active === 'todo' ? 'bg-[var(--brand-surface-white)] text-[var(--brand-text)] shadow-sm' : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'" @click="active = 'todo'">
          To-Do <span class="text-[var(--brand-text-faint)]">{{ todo.length }}</span>
        </button>
        <button type="button" class="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-semibold transition" :class="active === 'done' ? 'bg-[var(--brand-surface-white)] text-[var(--brand-text)] shadow-sm' : 'text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)]'" @click="active = 'done'">
          Done <span class="text-[var(--brand-text-faint)]">{{ done.length }}</span>
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="inline-flex items-center gap-2 h-9 px-3 text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"><Filter class="w-4 h-4" stroke-width="1.8" /> My tasks</button>
        <button type="button" class="inline-flex items-center gap-2 h-9 px-3 text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"><Filter class="w-4 h-4" stroke-width="1.8" /> Due date</button>
      </div>
    </div>

    <!-- Composer -->
    <div v-if="!composing" class="w-full h-12 px-4 rounded-[12px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] text-[var(--brand-text-quiet)] flex items-center cursor-text" @click="openComposer">Add a task</div>
    <div v-else>
      <div class="rounded-[12px] border-[1.5px] border-[var(--brand-teal)] bg-[var(--brand-surface-white)] overflow-hidden">
        <input v-model="draft" type="text" placeholder="Add a task" autofocus class="w-full h-12 px-4 text-[14px] text-[var(--brand-text)] outline-none placeholder:text-[var(--brand-text-quiet)]" @keydown.enter="addTask" @keydown.esc="cancelComposer">
        <div class="flex items-center justify-between gap-2 px-4 h-12 border-t border-[var(--brand-border-fade)]">
          <button type="button" class="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"><Clock class="w-4 h-4" stroke-width="1.8" /> Set due date</button>
          <div class="flex items-center gap-2">
            <button type="button" class="w-8 h-8 rounded-full border border-dashed border-[var(--brand-border)] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:border-[var(--brand-teal)] transition" aria-label="Add assignee"><Plus class="w-4 h-4" stroke-width="2" /></button>
            <BrandAvatarInitials :initials="myInitials" :bg="myBg" :color="AVATAR_TEXT" size="md" />
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 mt-3">
        <button type="button" class="text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]" @click="cancelComposer">Cancel</button>
        <button type="button" :disabled="!draft.trim()" class="h-9 px-4 rounded-[9px] bg-[var(--brand-teal)] text-[13.5px] font-bold text-[var(--brand-avatar-text)] transition disabled:opacity-40 disabled:cursor-not-allowed" @click="addTask">Add</button>
      </div>
    </div>

    <!-- Task list -->
    <div v-if="visible.length" class="mt-4 rounded-[12px] border border-[var(--brand-border-light)] overflow-hidden">
      <div v-for="(t, i) in visible" :key="t.id" class="flex items-center gap-3 px-4 py-3.5" :class="i < visible.length - 1 ? 'border-b border-[var(--brand-border-fade)]' : ''">
        <button type="button" class="w-[22px] h-[22px] rounded-[6px] border-2 inline-flex items-center justify-center shrink-0 transition" :class="t.done ? 'bg-[var(--brand-lime)] border-[var(--brand-lime)] text-[var(--brand-olive)]' : 'bg-[var(--brand-surface-white)] border-[var(--brand-border-mid)] hover:border-[var(--brand-teal)]'" @click="completeTask(t)">
          <Check v-if="t.done" class="w-3.5 h-3.5" stroke-width="3" />
        </button>
        <span class="flex-1 min-w-0 text-[14px] text-[var(--brand-text)] truncate" :class="t.done ? 'line-through text-[var(--brand-text-quiet)]' : 'font-medium'">{{ t.text }}</span>
        <BrandAvatarInitials :initials="myInitials" :bg="myBg" :color="AVATAR_TEXT" size="md" />
        <span class="text-[12.5px] text-[var(--brand-text-quiet)] shrink-0 w-8 text-right">{{ t.ago }}</span>
      </div>
    </div>

    <!-- Empty states -->
    <BrandEmptyState
      v-else-if="active === 'todo' && done.length"
      :icon="PartyPopper"
      title="Hurray! No tasks"
      description="You can simply enjoy the moment"
    />
    <BrandEmptyState
      v-else-if="active === 'todo'"
      :icon="ListTodo"
      title="What's on your to-do list?"
      description="Click the field above to add a task. All to-do tasks will appear here."
    />
    <BrandEmptyState
      v-else
      :icon="ListTodo"
      title="No completed tasks yet"
      description="Tasks you complete will appear here."
    />

    <!-- Toast -->
    <div v-if="toast" class="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 flex items-center gap-4 px-4 py-3 rounded-[12px] bg-[var(--brand-text)] text-[var(--brand-avatar-text)] shadow-[0_12px_36px_rgba(0,20,18,0.3)]">
      <span class="w-6 h-6 rounded-full bg-[var(--brand-success)] inline-flex items-center justify-center shrink-0"><Check class="w-3.5 h-3.5 text-[var(--brand-avatar-text)]" stroke-width="3" /></span>
      <div class="min-w-0">
        <div class="text-[13.5px] font-bold">Task done 🙌</div>
        <div class="text-[12.5px] opacity-70">High five!</div>
      </div>
      <button type="button" class="text-[13px] font-semibold opacity-90 hover:opacity-100 ml-2" @click="undoComplete">Undo</button>
      <button type="button" class="w-7 h-7 rounded-md inline-flex items-center justify-center opacity-70 hover:bg-[color-mix(in_srgb,var(--brand-avatar-text)_15%,transparent)] transition" aria-label="Dismiss" @click="toast = false"><X class="w-4 h-4" stroke-width="2" /></button>
    </div>
  </div>
</template>
