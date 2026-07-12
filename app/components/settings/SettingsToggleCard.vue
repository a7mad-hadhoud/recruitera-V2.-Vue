<!--
  Standard "title + description + Switch on the right" card. Used across every
  Settings page that needs a toggle option (Hiring Rules, Job Titles show-on-create,
  Approvals Setup, Company preferences, etc). Optional `#body` slot renders below
  the toggle when the switch is on (e.g. auto-assign recruiter table).
-->
<script setup lang="ts">
import { Switch } from '~/components/ui/switch'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description?: string
  /** When set, renders below the toggle regardless of modelValue */
  alwaysShowBody?: boolean
}>(), {
  alwaysShowBody: false,
})

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const value = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})
</script>

<template>
  <div class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[14px]">
    <div class="flex items-start gap-4 px-5 py-[18px]">
      <div class="flex-1">
        <div class="text-[14px] font-bold text-[var(--brand-text)] mb-[3px]">{{ title }}</div>
        <div v-if="description" class="text-[13px] text-[var(--brand-text-quiet)]">{{ description }}</div>
      </div>
      <Switch v-model="value" class="shrink-0 mt-0.5 data-[state=checked]:bg-[var(--brand-teal)]" />
    </div>
    <div v-if="$slots.body && (alwaysShowBody || value)" class="border-t border-[var(--brand-border-fade)] px-5 py-4">
      <slot name="body" />
    </div>
  </div>
</template>
