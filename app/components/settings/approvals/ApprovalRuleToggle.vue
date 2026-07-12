<!--
  ALL / ANY segmented toggle used inside each approval step. Compact prop
  shrinks it for nested (dept-flow) steps.
-->
<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: 'ALL' | 'ANY'
  compact?: boolean
}>(), {
  compact: false,
})
const emit = defineEmits<{ 'update:modelValue': ['ALL' | 'ANY'] }>()
</script>

<template>
  <div
    class="flex border-[1.5px] border-[var(--brand-border-light)] overflow-hidden"
    :class="compact ? 'rounded-[7px]' : 'rounded-[8px]'"
  >
    <button
      type="button"
      class="font-bold outline-none transition-colors"
      :class="[
        modelValue === 'ALL' ? 'bg-[var(--brand-teal)] text-white' : 'bg-transparent text-[var(--brand-text-muted)]',
        compact ? 'px-3 py-1 text-[12px]' : 'px-3.5 py-[5px] text-[13px]',
      ]"
      @click="emit('update:modelValue', 'ALL')"
    >
      ALL
    </button>
    <button
      type="button"
      class="font-bold outline-none transition-colors"
      :class="[
        modelValue === 'ANY' ? 'bg-[var(--brand-teal)] text-white' : 'bg-transparent text-[var(--brand-text-muted)]',
        compact ? 'px-3 py-1 text-[12px]' : 'px-3.5 py-[5px] text-[13px]',
      ]"
      @click="emit('update:modelValue', 'ANY')"
    >
      ANY
    </button>
  </div>
</template>
