<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ChevronRight } from "@lucide/vue"
import { DropdownMenuSubTrigger } from "reka-ui"
import { cn } from "@/lib/utils"

// See DropdownMenuContent for the $attrs-fallthrough rationale.
defineOptions({ inheritAttrs: false })
const props = defineProps<{
  class?: HTMLAttributes["class"]
  inset?: boolean
}>()
</script>

<template>
  <DropdownMenuSubTrigger
    data-slot="dropdown-menu-sub-trigger"
    v-bind="$attrs"
    :data-inset="props.inset ? '' : undefined"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4 data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*=\'text-\'])]:text-muted-foreground',
      props.class,
    )"
  >
    <slot />
    <ChevronRight class="ml-auto size-4" />
  </DropdownMenuSubTrigger>
</template>
