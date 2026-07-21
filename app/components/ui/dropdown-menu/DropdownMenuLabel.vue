<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { DropdownMenuLabel } from "reka-ui"
import { cn } from "@/lib/utils"

// See DropdownMenuContent for the $attrs-fallthrough rationale.
defineOptions({ inheritAttrs: false })
const props = defineProps<{
  class?: HTMLAttributes["class"]
  inset?: boolean
}>()
</script>

<template>
  <DropdownMenuLabel
    data-slot="dropdown-menu-label"
    :data-inset="props.inset ? '' : undefined"
    v-bind="$attrs"
    :class="cn('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', props.class)"
  >
    <slot />
  </DropdownMenuLabel>
</template>
