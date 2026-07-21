<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { Circle } from "@lucide/vue"
import {
  DropdownMenuItemIndicator,
  DropdownMenuRadioItem,
} from "reka-ui"
import { cn } from "@/lib/utils"

// See DropdownMenuContent for the $attrs-fallthrough rationale.
defineOptions({ inheritAttrs: false })
const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <DropdownMenuRadioItem
    data-slot="dropdown-menu-radio-item"
    v-bind="$attrs"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
      props.class,
    )"
  >
    <span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <DropdownMenuItemIndicator>
        <slot name="indicator-icon">
          <Circle class="size-2 fill-current" />
        </slot>
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>
