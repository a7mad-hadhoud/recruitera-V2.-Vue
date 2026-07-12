<!--
  Search input built on top of shadcn `Input` — inherits the shadcn v-model
  machinery, disabled state, aria-invalid handling, focus ring semantics.
  Adds the Recruitera pill background, search-icon prefix, and optional ⌘K hint.

  Change the padding / height / hover here → propagates to every search
  input across the product. All colors come from `--brand-*` tokens.
-->
<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { Input } from '~/components/ui/input'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  hint?: string           // right-side kbd hint, e.g. "⌘ K"
  size?: 'sm' | 'md'
  class?: HTMLAttributes['class']
}>(), {
  placeholder: 'Search',
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const heightClass = computed(() => (props.size === 'sm' ? 'h-8' : 'h-9'))
</script>

<template>
  <div class="relative w-full">
    <Search
      class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-text-quiet)] pointer-events-none z-10"
    />
    <Input
      :model-value="modelValue"
      :placeholder="placeholder"
      :class="cn(
        // Override shadcn's neutral defaults with our brand pill look.
        heightClass,
        'w-full pl-10 rounded-lg border shadow-none bg-[var(--brand-topbar-pill-bg)] border-[var(--brand-topbar-pill-border)]',
        'text-[14px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-quiet)]',
        'focus-visible:bg-white focus-visible:border-[var(--brand-border-mid)] focus-visible:ring-0',
        hint ? 'pr-16' : 'pr-3',
        props.class,
      )"
      @update:model-value="(v) => emit('update:modelValue', String(v ?? ''))"
    />
    <kbd
      v-if="hint"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-mono text-[var(--brand-text-subtle)] border border-[var(--brand-border-key)] rounded-md px-1.5 py-0.5 bg-transparent pointer-events-none"
    >{{ hint }}</kbd>
  </div>
</template>
