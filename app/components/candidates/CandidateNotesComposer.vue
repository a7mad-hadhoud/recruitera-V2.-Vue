<!--
  Notes card composer. Collapsed it's an "Add a note…" input; on focus it
  expands to a rich contenteditable with a formatting toolbar (bold / italic /
  underline / lists / link), an @mention menu (team members from
  useTeamMembers), attach + emoji affordances, and Cancel / Save. Emits
  `save(text)`; the parent prepends the note (client-only, no write endpoint).
-->
<script setup lang="ts">
import { Bold, Italic, Underline, List, ListOrdered, ListChecks, Link2, Paperclip, AtSign, Smile } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import { useTeamMembers } from '~/composables/useTeam'
import type { TeamMember } from '~/types'

const emit = defineEmits<{ save: [text: string] }>()

const { data: teamData } = useTeamMembers()
const roster = computed<TeamMember[]>(() => teamData.value?.data ?? [])

const editorEl = ref<HTMLDivElement | null>(null)
const expanded = ref(false)
const mentionOpen = ref(false)

function exec(cmd: string, value?: string) {
  editorEl.value?.focus()
  document.execCommand(cmd, false, value)
}
function insertLink() {
  const url = window.prompt('Link URL', 'https://')
  if (url) exec('createLink', url)
}
function insertMention(m: TeamMember) {
  editorEl.value?.focus()
  document.execCommand('insertText', false, `@${m.name} `)
  mentionOpen.value = false
}

function save() {
  const text = (editorEl.value?.innerText ?? '').trim()
  if (!text) return
  emit('save', text)
  if (editorEl.value) editorEl.value.innerHTML = ''
  expanded.value = false
}
function cancel() {
  if (editorEl.value) editorEl.value.innerHTML = ''
  expanded.value = false
  mentionOpen.value = false
}

const TOOLS = [
  { cmd: 'bold', icon: Bold, title: 'Bold' },
  { cmd: 'italic', icon: Italic, title: 'Italic' },
  { cmd: 'underline', icon: Underline, title: 'Underline' },
  { cmd: 'insertUnorderedList', icon: List, title: 'Bulleted list' },
  { cmd: 'insertOrderedList', icon: ListOrdered, title: 'Numbered list' },
] as const
</script>

<template>
  <div
    class="relative border-[1.6px] rounded-xl bg-[var(--brand-surface-white)] mb-4 transition-colors"
    :class="expanded ? 'border-[var(--brand-lime)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand-lime)_25%,transparent)]' : 'border-[var(--brand-border)]'"
  >
    <div
      v-show="expanded"
      ref="editorEl"
      contenteditable="true"
      data-placeholder="Add a note…"
      class="note-editable min-h-[64px] px-3 py-2.5 text-[14px] leading-[1.6] text-[var(--brand-text)] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--brand-text-quiet)]"
      @focus="expanded = true"
    />
    <input
      v-show="!expanded"
      type="text"
      placeholder="Add a note…"
      class="w-full box-border border-none outline-none bg-transparent px-3 py-2.5 text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]"
      @focus="expanded = true; nextTick(() => editorEl?.focus())"
    >

    <div v-if="expanded" class="flex items-center justify-between gap-2.5 px-2.5 py-2">
      <div class="flex items-center gap-0.5">
        <button
          v-for="t in TOOLS"
          :key="t.cmd"
          type="button"
          class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer"
          :title="t.title"
          @mousedown.prevent="exec(t.cmd)"
        ><component :is="t.icon" class="w-4 h-4" stroke-width="1.9" /></button>
        <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" title="Checklist" @mousedown.prevent="exec('insertUnorderedList')"><ListChecks class="w-4 h-4" stroke-width="1.9" /></button>
        <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" title="Insert link" @mousedown.prevent="insertLink"><Link2 class="w-4 h-4" stroke-width="1.8" /></button>
      </div>
      <div class="flex items-center gap-0.5">
        <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" title="Attach"><Paperclip class="w-4 h-4" stroke-width="1.8" /></button>
        <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" title="Mention" @mousedown.prevent="mentionOpen = !mentionOpen"><AtSign class="w-4 h-4" stroke-width="1.8" /></button>
        <button type="button" class="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" title="Emoji"><Smile class="w-4 h-4" stroke-width="1.8" /></button>
      </div>
    </div>

    <div v-if="expanded" class="flex items-center justify-end gap-2 px-2.5 pb-2.5">
      <BrandButton variant="outline" size="sm" @click="cancel">Cancel</BrandButton>
      <BrandButton variant="primary-teal" size="sm" @click="save">Save</BrandButton>
    </div>

    <!-- Mention menu -->
    <div
      v-if="mentionOpen"
      class="absolute left-2.5 right-2.5 top-[calc(100%+6px)] z-30 bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-xl shadow-[0_14px_42px_rgba(0,20,18,0.2)] p-1.5 max-h-[220px] overflow-y-auto"
    >
      <button
        v-for="m in roster"
        :key="m.id"
        type="button"
        class="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
        @mousedown.prevent="insertMention(m)"
      >
        <span class="w-[30px] h-[30px] rounded-full inline-flex items-center justify-center font-bold text-[11px] shrink-0" :style="{ background: m.avatarBg, color: m.avatarText }">
          {{ ((m.name.split(' ')[0]?.[0] ?? '') + (m.name.split(' ').slice(-1)[0]?.[0] ?? '')).toUpperCase() }}
        </span>
        <span class="min-w-0"><span class="block text-[14px] font-semibold text-[var(--brand-text)]">{{ m.name }}</span><span class="block text-[12px] text-[var(--brand-text-quiet)] truncate">{{ m.email }}</span></span>
      </button>
      <p v-if="!roster.length" class="px-2 py-2 text-[13px] text-[var(--brand-text-quiet)]">No teammates to mention.</p>
    </div>
  </div>
</template>
