<!--
  One button component covering every CTA style in the product:
   - primary-teal: dark deep-teal (main actions, e.g. "Add candidates")
   - primary-lime: lime + olive text (Continue, wizard confirm)
   - outline:     white bg + border (Skip, secondary)
   - ghost:       transparent (Clear, tertiary)
   - danger-ghost: transparent + red text (destructive tertiary)

  Change any variant's colors here → every button in the product updates.
  Extends the shadcn Button so it inherits size + disabled state semantics.
-->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  variant?: 'primary-teal' | 'primary-lime' | 'outline' | 'ghost' | 'danger-ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  class?: HTMLAttributes['class']
}>(), {
  variant: 'outline',
  size: 'md',
})

const variantClass = computed(() => ({
  'primary-teal':
    'bg-[var(--brand-teal)] text-white font-semibold hover:bg-[var(--brand-teal)]/90',
  'primary-lime':
    'bg-[var(--brand-lime)] text-[var(--brand-teal)] font-bold hover:brightness-105',
  'outline':
    'bg-white border border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)]',
  'ghost':
    'bg-transparent text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint-hover)]',
  'danger-ghost':
    'bg-transparent text-[var(--brand-danger)] hover:bg-[var(--brand-danger)]/10',
}[props.variant]))

const sizeClass = computed(() => ({
  'sm':   'h-8 px-3 text-[13px] rounded-lg',
  'md':   'h-9 px-4 text-[13.5px] rounded-lg',
  'lg':   'h-10 px-5 text-[14px] rounded-[10px]',
  'icon': 'h-9 w-9 rounded-lg',
}[props.size]))
</script>

<template>
  <Button
    :class="cn('shrink-0 transition-colors', variantClass, sizeClass, props.class)"
  >
    <slot />
  </Button>
</template>
