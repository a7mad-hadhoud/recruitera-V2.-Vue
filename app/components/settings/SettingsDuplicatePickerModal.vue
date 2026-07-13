<script setup lang="ts">
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import { BrandSearchBar, BrandButton } from '~/components/brand'

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

    <div v-if="search !== undefined" class="mb-3.5">
      <BrandSearchBar
        :model-value="search"
        :placeholder="searchPlaceholder"
        @update:model-value="v => emit('update:search', v)"
      />
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
      <BrandButton variant="ghost" size="sm" @click="emit('update:modelValue', false)">Cancel</BrandButton>
      <BrandButton
        variant="primary-teal"
        size="sm"
        :disabled="!selectedId"
        @click="emit('confirm')"
      >
        Duplicate
      </BrandButton>
    </template>
  </SettingsFormModal>
</template>
