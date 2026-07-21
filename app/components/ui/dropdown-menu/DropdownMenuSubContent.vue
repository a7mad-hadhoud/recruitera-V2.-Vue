<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import {
  DropdownMenuSubContent,
} from "reka-ui"
import { cn } from "@/lib/utils"

// reka-ui's DropdownMenuSubContentProps extends a Menu-generic type that
// Vue 3.5's SFC compiler can't resolve across the node_modules boundary
// ("Failed to resolve extends base type"). Nothing in this app uses nested
// submenus, so we only type the `class` override locally and let every
// other reka-ui prop reach <DropdownMenuSubContent /> via $attrs
// fallthrough. Behavior at runtime is unchanged. If we later start using
// submenus and want typed props back, restore the intermediate-interface
// + @vue-ignore pattern from Vue's SFC docs.
defineOptions({ inheritAttrs: false })
const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <DropdownMenuSubContent
    data-slot="dropdown-menu-sub-content"
    v-bind="$attrs"
    :class="cn('bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg', props.class)"
  >
    <slot />
  </DropdownMenuSubContent>
</template>
