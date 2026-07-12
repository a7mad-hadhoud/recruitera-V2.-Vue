<!--
  Wraps shadcn Checkbox with the Recruitera brand accent:
  checked = lime fill + dark olive tick.
  Use this anywhere in the product instead of Checkbox directly.
-->
<script setup lang="ts">
import { Checkbox } from '~/components/ui/checkbox'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const baseClass =
  'size-[18px] rounded-[5px] border-[1.6px] border-[var(--brand-border-mid)] hover:border-[var(--brand-text-quiet)] '
  + 'data-[state=checked]:bg-[var(--brand-lime)] data-[state=checked]:border-[var(--brand-lime)] data-[state=checked]:text-[var(--brand-olive)] '
  + 'data-[state=unchecked]:bg-white shadow-none disabled:border-[var(--brand-border)] disabled:opacity-100'
</script>

<template>
  <Checkbox
    :model-value="props.modelValue"
    :disabled="props.disabled"
    :class="cn(baseClass, props.class)"
    @update:model-value="(v) => emits('update:modelValue', v as boolean)"
  />
</template>
