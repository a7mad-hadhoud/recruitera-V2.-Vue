<!--
  Sort dropdown. Trigger button shows the current sort label + direction icon.
  Options list follows the spec order. Active option = lime icon on the right.
  Click active = toggle asc/desc. Click other = set + close.
-->
<script setup lang="ts">
import { ArrowDown, ArrowUp, ArrowDownUp, ChevronDown } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { useCandidateSort, type SortKey } from '~/composables/useCandidateSort'

const { key, dir, label, set, options } = useCandidateSort()
const open = ref(false)

function pick(k: SortKey) {
  set(k)
  // Same-key click keeps the popover open so users can see the direction flip.
  if (k !== key.value) open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        class="h-9 rounded-lg gap-1.5 text-[13px] border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)]"
      >
        <component :is="dir === 'desc' ? ArrowDown : ArrowUp" class="w-3.5 h-3.5" />
        {{ label }}
        <ChevronDown class="w-3 h-3" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      :side-offset="6"
      class="w-[200px] p-0 rounded-lg border-[var(--brand-border-light)] shadow-[0_8px_24px_rgba(0,20,18,0.12)] overflow-hidden"
    >
      <div class="px-3 py-2 text-[13px] font-bold text-[var(--brand-text)] border-b border-[var(--brand-border-fade)]">
        Sort by
      </div>
      <div class="py-1 max-h-[280px] overflow-y-auto">
        <button
          v-for="opt in options"
          :key="opt.key"
          class="w-full flex items-center gap-2 px-3 py-2 text-[13.5px] text-left transition-colors"
          :class="opt.key === key
            ? 'text-[var(--brand-text)] font-semibold bg-[var(--brand-lime-tint)]'
            : 'text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)]'"
          @click="pick(opt.key)"
        >
          <span class="flex-1">{{ opt.label }}</span>
          <component
            v-if="opt.key === key"
            :is="dir === 'desc' ? ArrowDown : ArrowUp"
            class="w-3.5 h-3.5 text-[var(--brand-olive)]"
            stroke-width="2"
          />
          <ArrowDownUp
            v-else
            class="w-3.5 h-3.5 text-[var(--brand-text-faint)] opacity-0 group-hover:opacity-100"
            stroke-width="1.7"
          />
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
