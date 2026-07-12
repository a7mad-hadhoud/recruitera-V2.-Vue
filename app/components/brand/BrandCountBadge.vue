<!--
  Small tabular count pill — used in Favorites, filter option counts,
  status chips, anywhere we need to show "N" against a subtle bg.
  Zero-state renders in a lighter tone automatically.
-->
<script setup lang="ts">
const props = defineProps<{ count: number }>()
</script>

<template>
  <span
    class="text-[12px] rounded-md px-1.5 py-px min-w-[18px] text-center tabular-nums bg-white border border-[var(--brand-border-light)]"
    :class="props.count === 0
      ? 'text-[var(--brand-text-quiet)]'
      : 'text-[var(--brand-text-muted)] font-semibold'"
  >{{ props.count }}</span>
</template>
