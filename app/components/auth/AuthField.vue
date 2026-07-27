<!--
  One labeled input for the auth screens (signup / login). Renders a small
  "* Label" caption above a bordered input with lime focus ring. When
  type="password" it grows a show/hide eye toggle. Reused by every auth page so
  the field style is defined once — change it here and all auth forms update.
-->
<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  autocomplete?: string
}>(), {
  type: 'text',
  required: false,
})

const model = defineModel<string>({ default: '' })
const reveal = ref(false)
const inputType = computed(() =>
  props.type === 'password' ? (reveal.value ? 'text' : 'password') : props.type,
)
</script>

<template>
  <label class="block">
    <span class="block mb-2 text-[15px] font-bold text-[var(--brand-text-secondary)]">
      <span v-if="required" class="text-[var(--brand-danger)]">*</span> {{ label }}
    </span>
    <div class="relative">
      <input
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        class="w-full box-border h-11 rounded-none border-0 border-b-[1.5px] border-[var(--brand-border-mid)] bg-transparent px-0 text-[16px] leading-[2] text-[var(--brand-text)] outline-none transition-colors placeholder:text-[var(--brand-text-faint)] focus:border-[var(--brand-teal)]"
        :class="{ 'pr-9': type === 'password' }"
      >
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--brand-text-quiet)] outline-none cursor-pointer hover:text-[var(--brand-text-secondary)] transition-colors"
        :aria-label="reveal ? 'Hide password' : 'Show password'"
        @click="reveal = !reveal"
      >
        <EyeOff v-if="reveal" class="w-4 h-4" stroke-width="1.8" />
        <Eye v-else class="w-4 h-4" stroke-width="1.8" />
      </button>
    </div>
  </label>
</template>
