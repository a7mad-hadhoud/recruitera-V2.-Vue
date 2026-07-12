<script setup lang="ts">
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'

withDefaults(defineProps<{
  modelValue: boolean
  draft: string
  title?: string
  label?: string
}>(), {
  title: 'Rename template',
  label: 'Template name',
})

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'update:draft': [string]
  confirm: []
}>()
</script>

<template>
  <SettingsFormModal :model-value="modelValue" :title="title" width="420px" @update:model-value="v => emit('update:modelValue', v)">
    <div class="mb-1">
      <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">{{ label }}</label>
      <input
        :value="draft"
        type="text"
        class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        @input="emit('update:draft', ($event.target as HTMLInputElement).value)"
        @keyup.enter="emit('confirm')"
      >
    </div>
    <template #footer>
      <button type="button" class="px-[18px] py-2 text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none" @click="emit('update:modelValue', false)">Cancel</button>
      <button type="button" class="px-[18px] py-2 rounded-[8px] bg-[var(--brand-teal)] text-white text-[13.5px] font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!draft.trim()" @click="emit('confirm')">Save</button>
    </template>
  </SettingsFormModal>
</template>
