<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { DropdownMenuSeparator } from "reka-ui"
import { cn } from "@/lib/utils"

// See DropdownMenuContent for the $attrs-fallthrough rationale.
defineOptions({ inheritAttrs: false })
const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <DropdownMenuSeparator
    data-slot="dropdown-menu-separator"
    v-bind="$attrs"
    :class="cn('bg-border -mx-1 my-1 h-px', props.class)"
  />
</template>
