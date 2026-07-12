<script setup lang="ts">
import { AlertCircle, X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message: string
  autoDismissMs?: number
}>(), {
  title: "Location can't be deleted",
  autoDismissMs: 5000,
})

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

let timer: ReturnType<typeof setTimeout> | undefined

watch(() => props.modelValue, (open) => {
  clearTimeout(timer)
  if (open) {
    timer = setTimeout(() => emit('update:modelValue', false), props.autoDismissMs)
  }
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    leave-active-class="transition duration-150 ease-in"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="modelValue"
      class="fixed bottom-7 left-1/2 -translate-x-1/2 z-[1000] flex items-start gap-3.5 w-[90%] max-w-[440px] rounded-[14px] px-5 py-4 text-white shadow-[0_8px_32px_rgba(0,0,0,0.22)]"
      style="background: var(--brand-settings-toast-bg)"
    >
      <AlertCircle class="w-[18px] h-[18px] shrink-0 mt-0.5" />
      <div class="flex-1">
        <div class="text-[14px] font-bold mb-[3px]">{{ title }}</div>
        <div class="text-[13.5px] leading-relaxed opacity-90">{{ message }}</div>
      </div>
      <div class="w-px self-stretch mx-1.5 bg-white/30" />
      <button
        type="button"
        class="shrink-0 p-0.5 text-white/80 outline-none hover:text-white transition-colors"
        @click="emit('update:modelValue', false)"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>
