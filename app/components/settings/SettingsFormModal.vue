<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'

withDefaults(defineProps<{
  modelValue: boolean
  title: string
  width?: string
  scrollable?: boolean
}>(), {
  width: '520px',
  scrollable: false,
})

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <Dialog :open="modelValue" @update:open="v => emit('update:modelValue', v)">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-none shadow-none bg-transparent sm:max-w-none"
      :style="{ width, maxWidth: '92vw' }"
    >
      <div class="bg-[var(--brand-settings-modal-bg)] rounded-[24px] p-9 shadow-[var(--brand-settings-modal-shadow)]" :class="scrollable ? 'flex flex-col max-h-[90vh]' : ''">
        <div class="flex items-start justify-between gap-4 mb-6" :class="scrollable ? 'shrink-0' : ''">
          <DialogTitle class="text-[20px] font-bold text-[var(--brand-text)] leading-tight">{{ title }}</DialogTitle>
          <button
            type="button"
            class="inline-flex items-center justify-center w-9 h-9 rounded-[10px] border-[1.5px] border-[var(--brand-border-light)] bg-[var(--brand-surface-white)] text-[var(--brand-text-muted)] shrink-0 outline-none hover:bg-[var(--brand-lime-tint-hover)] transition-colors"
            @click="emit('update:modelValue', false)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div v-if="scrollable" class="flex-1 overflow-y-auto -mx-1 px-1 min-h-0">
          <slot />
        </div>
        <slot v-else />

        <div v-if="$slots.footer" class="flex items-center justify-end gap-3 mt-8" :class="scrollable ? 'shrink-0' : ''">
          <slot name="footer" />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
