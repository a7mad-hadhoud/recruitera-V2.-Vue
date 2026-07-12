<!--
  Standard content card, built on shadcn `Card`. Inherits shadcn's semantics
  (rounded corners, subtle shadow), then swaps in Recruitera brand borders
  and background so every card looks the same across pages.
-->
<script setup lang="ts">
import { Card } from '~/components/ui/card'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  padded?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Card
    :class="cn(
      'rounded-[14px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-white)] shadow-[0_1px_2px_rgba(0,20,18,0.04)]',
      padded && 'p-5',
      props.class,
    )"
  >
    <slot />
  </Card>
</template>
