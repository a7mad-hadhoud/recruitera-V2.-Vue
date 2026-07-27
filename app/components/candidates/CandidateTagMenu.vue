<!--
  Overview → Tags "+" popover. Searchable list of the workspace's candidate
  tags (from useTags) with a "Create new tag" affordance when the query
  doesn't match an existing tag. Emits `select(name)`; the parent owns the
  applied-tag state (client-only until a write endpoint exists).
-->
<script setup lang="ts">
import { Plus, Search, X } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { useTags } from '~/composables/useTags'

const props = defineProps<{ applied: string[] }>()
const emit = defineEmits<{ select: [name: string] }>()

const open = ref(false)
const query = ref('')

const { data: tagData } = useTags()
const allTags = computed(() => (tagData.value?.candidates ?? []).map(t => t.name))

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return allTags.value.filter(t => !props.applied.includes(t) && (!q || t.toLowerCase().includes(q)))
})
const canCreate = computed(() => {
  const q = query.value.trim()
  return !!q && !allTags.value.some(t => t.toLowerCase() === q.toLowerCase())
})

function pick(name: string) {
  emit('select', name)
  query.value = ''
  open.value = false
}
watch(open, (v) => { if (!v) query.value = '' })
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="w-[30px] h-[30px] inline-flex items-center justify-center border border-[var(--brand-border)] rounded-[9px] text-[var(--brand-icon-default)] hover:bg-[var(--brand-surface-hover)] cursor-pointer"
        title="Add tag"
      >
        <Plus class="w-3.5 h-3.5" stroke-width="1.8" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-[264px] p-0 rounded-xl overflow-hidden">
      <div class="text-center text-[14px] font-bold text-[var(--brand-text)] px-4 py-2.5 border-b border-[var(--brand-border-hairline)] bg-[var(--brand-surface-hover)]">Search tags</div>
      <div class="p-3">
        <div class="flex items-center gap-2 border-[1.6px] border-[var(--brand-border)] rounded-[10px] px-3 py-2 focus-within:border-[var(--brand-lime)]">
          <Search class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
          <input
            v-model="query"
            type="text"
            placeholder="Search..."
            class="flex-1 min-w-0 border-none outline-none bg-transparent text-[13px] text-[var(--brand-text)]"
          >
          <button v-if="query" type="button" class="text-[var(--brand-icon-muted)] cursor-pointer" @click="query = ''"><X class="w-3.5 h-3.5" stroke-width="1.8" /></button>
        </div>
      </div>
      <div class="px-1.5 pb-2 max-h-[168px] overflow-y-auto">
        <button
          v-for="t in filtered"
          :key="t"
          type="button"
          class="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)] cursor-pointer"
          @click="pick(t)"
        >{{ t }}</button>
        <button
          v-if="canCreate"
          type="button"
          class="block w-full text-left px-3 py-2.5 rounded-[9px] bg-[var(--brand-lime-tint)] cursor-pointer"
          @click="pick(query.trim())"
        >
          <span class="block text-[13px] font-bold text-[var(--brand-text)]">Create new tag</span>
          <span class="block text-[13px] text-[var(--brand-text-secondary)]">{{ query.trim() }}</span>
        </button>
        <p v-if="!filtered.length && !canCreate" class="px-3 py-2.5 text-[13px] text-[var(--brand-text-quiet)]">No tags found.</p>
      </div>
    </PopoverContent>
  </Popover>
</template>
