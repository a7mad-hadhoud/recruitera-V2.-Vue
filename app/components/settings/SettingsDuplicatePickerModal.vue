<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  width?: string
  description?: string
  items: { id: string, name: string, subtitle?: string }[]
  selectedId: string | null
  search?: string
  searchPlaceholder?: string
  listLabel?: string
  listCount?: number
}>(), {
  title: 'Duplicate an existing template',
  width: '480px',
  searchPlaceholder: 'Search templates',
})

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'update:selectedId': [v: string]
  'update:search': [v: string]
  confirm: []
}>()
</script>

<template>
  <SettingsFormModal
    :model-value="modelValue"
    :title="title"
    :width="width"
    @update:model-value="v => emit('update:modelValue', v)"
  >
    <p v-if="description" class="text-[13px] text-[var(--brand-text-quiet)] mb-4 -mt-3">{{ description }}</p>

    <div
      v-if="search !== undefined"
      class="flex items-center gap-2 border-[1.5px] border-[var(--brand-teal)] rounded-[10px] px-3.5 py-2.5 bg-[var(--brand-surface-white)] mb-3.5"
    >
      <Search class="w-3.5 h-3.5 text-[var(--brand-text-quiet)] shrink-0" />
      <input
        :value="search"
        type="text"
        :placeholder="searchPlaceholder"
        class="border-0 outline-none text-[14px] text-[var(--brand-text)] bg-transparent flex-1"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div v-if="listLabel" class="flex items-center gap-2 text-[13px] font-bold text-[var(--brand-text)] mb-2">
      {{ listLabel }}
      <span class="bg-[var(--brand-teal)] text-[var(--brand-lime)] text-[11px] font-bold px-[7px] py-0.5 rounded-[5px]">{{ listCount ?? items.length }}</span>
    </div>

    <div class="border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden max-h-[280px] overflow-y-auto">
      <button
        v-for="(t, i) in items"
        :key="t.id"
        type="button"
        class="flex items-center gap-3.5 w-full px-4 py-3 border-b border-[var(--brand-border-fade)] last:border-0 outline-none text-left transition-colors"
        :class="[i % 2 === 1 ? 'bg-[var(--brand-surface-table-alt)]' : 'bg-[var(--brand-surface-white)]', 'hover:bg-[var(--brand-surface-hover)]']"
        @click="emit('update:selectedId', t.id)"
      >
        <span
          class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
          :class="selectedId === t.id ? 'border-[var(--brand-teal)]' : 'border-[var(--brand-border-mid)]'"
        >
          <span v-if="selectedId === t.id" class="w-2.5 h-2.5 rounded-full bg-[var(--brand-teal)]" />
        </span>
        <div>
          <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ t.name }}</div>
          <div v-if="t.subtitle" class="text-[12px] text-[var(--brand-text-quiet)]">{{ t.subtitle }}</div>
        </div>
      </button>
    </div>

    <template #footer>
      <button type="button" class="px-[18px] py-2 text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none" @click="emit('update:modelValue', false)">Cancel</button>
      <button
        type="button"
        class="px-[22px] py-2 rounded-[8px] bg-[var(--brand-teal)] text-white text-[13.5px] font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!selectedId"
        @click="emit('confirm')"
      >
        Duplicate
      </button>
    </template>
  </SettingsFormModal>
</template>
