<!--
  Round initials avatar. Defaults to the brand teal/lime combo; pass `bg`/`color`
  to override per-instance (e.g. a per-member palette in a team table).
-->
<script setup lang="ts">
withDefaults(defineProps<{
  initials: string
  size?: 'xs' | 'sm' | 'md' | 'xl' | 'lg'
  bg?: string
  color?: string
}>(), {
  size: 'md',
})

const sizeClasses: Record<string, string> = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-[11.5px]',
  xl: 'w-10 h-10 text-[13px]',
  lg: 'w-14 h-14 text-[18px]',
}
</script>

<template>
  <div
    class="rounded-full flex items-center justify-center font-extrabold shrink-0"
    :class="sizeClasses[size]"
    :style="{
      background: bg ?? 'var(--brand-teal)',
      color: color ?? 'var(--brand-lime)',
    }"
  >
    {{ initials }}
  </div>
</template>
