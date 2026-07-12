<!--
  Approver chip. Two visual variants:
   - type: 'user'    → dark round avatar with initials
   - type: 'dynamic' → blue outline chip with generic user icon (Hiring Manager etc.)
  Removable via `@remove`. Compact prop tightens padding/font/icon sizes for use
  inside dept-flow steps (which have a smaller step card).
-->
<script setup lang="ts">
import { User, X } from 'lucide-vue-next'

withDefaults(defineProps<{
  type: 'user' | 'dynamic'
  name: string
  initials?: string
  compact?: boolean
  removable?: boolean
}>(), {
  compact: false,
  removable: true,
})

defineEmits<{ remove: [] }>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-[8px]"
    :class="[
      type === 'dynamic'
        ? 'bg-[var(--brand-dynamic-role-bg)] border border-[var(--brand-dynamic-role-border)] text-[var(--brand-dynamic-role-text)]'
        : 'bg-[var(--brand-badge-settings-bg)] text-[var(--brand-text)]',
      compact ? 'gap-1.5 px-2 py-1' : 'gap-[7px] px-2.5 py-1.5',
    ]"
  >
    <div
      v-if="type === 'user'"
      class="rounded-full bg-[var(--brand-teal)] text-[var(--brand-lime)] font-extrabold flex items-center justify-center shrink-0"
      :class="compact ? 'w-5 h-5 text-[9px]' : 'w-[22px] h-[22px] text-[10px]'"
    >
      {{ initials }}
    </div>
    <User v-else class="shrink-0" :class="compact ? 'w-3 h-3' : 'w-3.5 h-3.5'" />
    <span class="font-semibold" :class="compact ? 'text-[12.5px]' : 'text-[13px]'">{{ name }}</span>
    <button
      v-if="removable"
      type="button"
      class="text-[var(--brand-text-quiet)] outline-none"
      @click.stop="$emit('remove')"
    >
      <X :class="compact ? 'w-2.5 h-2.5' : 'w-[11px] h-[11px]'" />
    </button>
  </span>
</template>
