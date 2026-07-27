<!--
  Small reusable confirm dialog for the candidate profile's guarded actions:
  Delete candidate, Requalify, Remove from talent pool, Re-parse / Delete
  resume. A tone drives the icon colour + primary-button variant. An optional
  default slot renders extra body content (e.g. the resume dropzone).
-->
<script setup lang="ts">
import type { Component } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog'
import { BrandButton } from '~/components/brand'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'success' | 'neutral'
  icon?: Component
}>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  tone: 'neutral',
})

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [] }>()

const iconWrap = computed(() => ({
  danger: 'bg-[color-mix(in_srgb,var(--brand-danger)_14%,white)] text-[var(--brand-danger)]',
  success: 'bg-[var(--brand-lime-tint)] text-[var(--brand-olive)]',
  neutral: 'bg-[var(--brand-surface-hover)] text-[var(--brand-text-secondary)]',
}[props.tone]))

function confirm() { emit('confirm'); open.value = false }
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[440px] p-7">
      <DialogHeader class="space-y-0 text-left">
        <span v-if="icon" class="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" :class="iconWrap">
          <component :is="icon" class="w-6 h-6" stroke-width="1.9" />
        </span>
        <DialogTitle class="text-[18px] font-bold text-[var(--brand-text)]">{{ title }}</DialogTitle>
        <DialogDescription v-if="description" class="text-[14px] leading-[1.6] text-[var(--brand-text-secondary)] mt-2">{{ description }}</DialogDescription>
      </DialogHeader>

      <slot />

      <DialogFooter class="gap-3 mt-2 sm:justify-end">
        <BrandButton variant="outline" size="md" @click="open = false">{{ cancelLabel }}</BrandButton>
        <BrandButton :variant="tone === 'danger' ? 'danger' : 'primary-teal'" size="md" @click="confirm">{{ confirmLabel }}</BrandButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
