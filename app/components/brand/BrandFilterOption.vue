<!--
  One checkbox row inside a BrandFilterGroup: [lime checkbox] label [count].
  Disabled state applies when count is 0.
-->
<script setup lang="ts">
import BrandLimeCheckbox from './BrandLimeCheckbox.vue'

const props = defineProps<{
  label: string
  count: number
  modelValue: boolean
}>()

const emits = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const disabled = computed(() => props.count === 0)
</script>

<template>
  <label
    class="flex items-center gap-3 px-2.5 py-2 rounded-lg text-[14px] transition-colors"
    :class="disabled
      ? 'cursor-default text-[var(--brand-text-disabled)]'
      : 'cursor-pointer text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)]'"
  >
    <BrandLimeCheckbox
      :model-value="props.modelValue"
      :disabled="disabled"
      @update:model-value="(v) => emits('update:modelValue', v)"
    />
    <span class="flex-1">{{ props.label }}</span>
    <span
      class="text-[12px] tabular-nums font-semibold"
      :class="disabled ? 'text-[var(--brand-text-faint)]' : 'text-[var(--brand-text-muted)]'"
    >{{ props.count }}</span>
  </label>
</template>
