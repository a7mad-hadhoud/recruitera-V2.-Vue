<!--
  "Save search as favorite" popover, opened by the star icon next to
  the Candidates page title. Design: Recruitera Candidates.dc.html:285-300.
  Form is validated with Zod via vee-validate — never trust client input.
-->
<script setup lang="ts">
import { Star, HelpCircle } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { BrandLimeCheckbox } from '~/components/brand'
import { SaveSearchSchema, type SaveSearchInput } from '~/types/candidate.schema'

const emits = defineEmits<{ save: [payload: SaveSearchInput] }>()

const open = ref(false)

const { defineField, handleSubmit, resetForm, errors, meta } = useForm({
  validationSchema: toTypedSchema(SaveSearchSchema),
  initialValues: { name: '', shared: true },
})
const [name, nameProps] = defineField('name')
const [shared] = defineField('shared')

const onSubmit = handleSubmit((values) => {
  emits('save', values)
  resetForm()
  open.value = false
})

// Reset form each time the popover reopens so stale errors don't linger.
watch(open, (v) => { if (v) resetForm() })
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        class="relative inline-flex items-center justify-center w-[34px] h-[34px] rounded-[10px] text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint)] data-[state=open]:bg-[var(--brand-lime-tint)] transition-colors"
        aria-label="Save search as favorite"
      >
        <Star class="w-[19px] h-[19px]" stroke-width="1.7" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      side="bottom"
      align="start"
      :side-offset="8"
      class="w-[380px] p-0 rounded-2xl shadow-[0_16px_48px_rgba(0,20,18,0.22)] border-[var(--brand-border-light)] overflow-hidden"
    >
      <div class="text-center font-bold text-[15px] text-[var(--brand-text)] px-5 py-3.5 border-b border-[var(--brand-border-fade)] bg-[var(--brand-canvas)]">
        Save search as favorite
      </div>

      <form @submit.prevent="onSubmit">
        <div class="px-5 py-4">
          <label class="block font-bold text-[14px] text-[var(--brand-text)] mb-2">Search name</label>
          <Input
            v-model="name"
            v-bind="nameProps"
            type="text"
            class="h-10 rounded-[10px] border-[1.6px] border-[var(--brand-border)] focus-visible:border-[var(--brand-teal)] focus-visible:ring-0 text-[14px] text-[var(--brand-text)]"
          />
          <p v-if="errors.name" class="text-[12px] text-[var(--brand-danger)] mt-1.5">{{ errors.name }}</p>

          <label class="flex items-center gap-3 mt-4 cursor-pointer">
            <BrandLimeCheckbox
              v-model="shared"
              class="size-[22px] rounded-md"
            />
            <span class="font-semibold text-[14px] text-[var(--brand-text)]">Share with team members</span>
            <HelpCircle class="w-[18px] h-[18px] text-[var(--brand-text-faint)]" stroke-width="1.7" />
          </label>
        </div>

        <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--brand-border-fade)]">
          <Button
            type="button"
            variant="ghost"
            class="font-semibold text-[14px] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint-hover)] rounded-[9px] px-3.5"
            @click="open = false"
          >Cancel</Button>
          <Button
            type="submit"
            class="font-bold text-[14px] bg-[var(--brand-lime)] text-[var(--brand-teal)] hover:brightness-105 rounded-[9px] px-5 border-0"
            :disabled="!meta.valid"
          >Add</Button>
        </div>
      </form>
    </PopoverContent>
  </Popover>
</template>
