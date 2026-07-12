<!--
  Small uppercase section header — the "FAVORITES", "FILTERS" style.
  Used at the top of any grouped list.
-->
<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-secondary)] pt-3.5 px-2 pb-1.5">
    {{ label }}
  </div>
</template>
