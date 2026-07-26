<!--
  SchedulerSelect — the rounded "readonly + dropdown" select used across the
  Event scheduler link dialog (duration, event type, timezone, expiry unit…).
  Mirrors Recruitee's rt-input.rounded.has-dropdown. Brand tokens only.
-->
<script setup lang="ts">
import type { Component } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'

interface Option { value: string; label: string; icon?: Component }

const props = withDefaults(defineProps<{
  options: Option[]
  placeholder?: string
  disabled?: boolean
}>(), { placeholder: 'Select', disabled: false })

const model = defineModel<string>({ default: '' })

const selected = computed(() => props.options.find(o => o.value === model.value))
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child :disabled="disabled">
      <button
        type="button"
        :disabled="disabled"
        class="w-full inline-flex items-center gap-2 h-10 px-3 rounded-[10px] border border-[var(--brand-border)] bg-white text-[14px] transition hover:border-[var(--brand-teal)] disabled:opacity-60 disabled:hover:border-[var(--brand-border)]"
        :class="selected ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-quiet)]'"
      >
        <component :is="selected.icon" v-if="selected?.icon" class="w-4 h-4 text-[var(--brand-text-subtle)] shrink-0" stroke-width="1.8" />
        <span class="flex-1 text-left truncate">{{ selected?.label ?? placeholder }}</span>
        <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)] shrink-0" stroke-width="2" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-[--reka-dropdown-menu-trigger-width] min-w-[180px] p-1.5 rounded-[12px] max-h-[280px] overflow-y-auto">
      <DropdownMenuItem
        v-for="o in options"
        :key="o.value"
        class="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] cursor-pointer text-[13.5px] font-medium text-[var(--brand-text)]"
        :class="o.value === model ? 'bg-[var(--brand-lime-tint)]' : ''"
        @select="model = o.value"
      >
        <component :is="o.icon" v-if="o.icon" class="w-4 h-4 text-[var(--brand-text-subtle)] shrink-0" stroke-width="1.8" />
        <span class="flex-1 truncate">{{ o.label }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
