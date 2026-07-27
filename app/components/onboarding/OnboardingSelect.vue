<!--
  Dropdown select for onboarding questions with many options (e.g. industry).
  Matches the polished onboarding input style (h-14, rounded-xl, teal focus).
  v-model is the chosen option string.
-->
<script setup lang="ts">
import { ChevronDown, Check } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

withDefaults(defineProps<{ options: readonly string[], placeholder?: string }>(), {
  placeholder: 'Select an option',
})
const model = defineModel<string>()
const open = ref(false)
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="w-full max-w-[480px] flex items-center justify-between gap-3 h-14 rounded-xl border-[1.5px] bg-[var(--brand-surface-white)] px-4 text-[15px] outline-none cursor-pointer transition-colors"
        :class="[
          open ? 'border-[var(--brand-teal)] ring-4 ring-[var(--brand-lime)]/25' : 'border-[var(--brand-border)] hover:border-[var(--brand-border-mid)]',
          model ? 'font-medium text-[var(--brand-text)]' : 'text-[var(--brand-text-faint)]',
        ]"
      >
        {{ model || placeholder }}
        <ChevronDown class="w-[18px] h-[18px] shrink-0 text-[var(--brand-text-quiet)] transition-transform" :class="{ 'rotate-180': open }" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      class="p-1.5 rounded-xl max-h-[300px] overflow-y-auto"
      :style="{ width: 'var(--reka-popper-anchor-width)' }"
    >
      <button
        v-for="o in options"
        :key="o"
        type="button"
        class="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-lg text-[14px] text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
        @click="model = o; open = false"
      >
        <span class="truncate">{{ o }}</span>
        <Check v-if="o === model" class="w-4 h-4 shrink-0 text-[var(--brand-teal)]" stroke-width="2.4" />
      </button>
    </PopoverContent>
  </Popover>
</template>
