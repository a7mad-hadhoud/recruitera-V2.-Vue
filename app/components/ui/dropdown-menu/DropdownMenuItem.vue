<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { DropdownMenuItem } from "reka-ui"
import { cn } from "@/lib/utils"

// See DropdownMenuContent for the $attrs-fallthrough rationale.
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  inset?: boolean
  variant?: "default" | "destructive"
}>(), {
  variant: "default",
})
</script>

<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    :data-inset="props.inset ? '' : undefined"
    :data-variant="props.variant"
    v-bind="$attrs"
    :class="cn('focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*=\'text-\'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4', props.class)"
  >
    <slot />
  </DropdownMenuItem>
</template>
