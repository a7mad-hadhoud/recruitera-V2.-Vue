<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import {
  DropdownMenuContent,
  DropdownMenuPortal,
} from "reka-ui"
import { cn } from "@/lib/utils"

// reka-ui's DropdownMenuContentProps extends a Menu-generic type that
// Vue 3.5's SFC compiler can't resolve across the node_modules boundary.
// We only type the `class` override locally and let every other reka-ui
// prop reach <DropdownMenuContent /> via $attrs fallthrough. Same shape
// at runtime; only compile-time type-checking on those props is skipped.
defineOptions({ inheritAttrs: false })
const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      data-slot="dropdown-menu-content"
      :side-offset="4"
      v-bind="$attrs"
      :class="cn('bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--reka-dropdown-menu-content-available-height) min-w-[8rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md', props.class)"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
