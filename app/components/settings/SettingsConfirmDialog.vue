<!--
  Shared confirm dialog for destructive/blocking settings actions (delete
  location, remove team member, etc). One component so copy/button order/
  danger styling never drifts between the ~20 settings pages that need one.
-->
<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { BrandButton } from '~/components/brand'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
}>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: true,
  loading: false,
})

const emit = defineEmits<{
  'update:open': [v: boolean]
  confirm: []
}>()

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="v => emit('update:open', v)">
    <DialogContent class="p-0 border-none shadow-none bg-transparent sm:max-w-[420px]">
      <div class="bg-[var(--brand-settings-modal-bg)] rounded-[24px] p-9 shadow-[var(--brand-settings-modal-shadow)]">
        <DialogHeader>
          <DialogTitle class="text-[16px] font-bold text-[var(--brand-text)]">{{ title }}</DialogTitle>
          <DialogDescription v-if="description" class="text-[13.5px] text-[var(--brand-text-muted)]">
            {{ description }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 mt-8">
          <BrandButton variant="outline" :disabled="loading" @click="close">{{ cancelLabel }}</BrandButton>
          <BrandButton
            :variant="danger ? 'danger' : 'primary-teal'"
            :disabled="loading"
            @click="emit('confirm')"
          >
            {{ loading ? 'Please wait…' : confirmLabel }}
          </BrandButton>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
