<!--
  Team-member config modal — opens when a member is added to a job from
  the Team tab. Sets the member's Role and, optionally, restricts which
  pipeline stages they can see (Customize Stages → Include Stages).

  Matches the reference: name/email header + close chip, Role* select,
  Customize Stages toggle that reveals an Include-Stages chip input, and
  a Cancel / Save footer. Reuses the shadcn Dialog primitive and
  --brand-* tokens (no hex, no new deps).
-->
<script setup lang="ts">
import { X, ChevronDown } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { BrandButton } from '~/components/brand'
import type { TeamMember } from '~/types'

const props = defineProps<{ member: TeamMember | null }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  save: [payload: { memberId: string; role: string; customizeStages: boolean; stages: string[] }]
}>()

// Job-scoped roles a member can hold on this job.
const ROLES = ['Recruiter', 'Hiring Manager', 'Coordinator', 'Interviewer', 'Admin'] as const

const role = ref('')
const customizeStages = ref(false)
const stages = ref<string[]>([])
const stageDraft = ref('')

const canSave = computed(() => role.value !== '')

// Reset to a clean slate each time the modal opens for a member.
watch(open, (isOpen) => {
  if (isOpen) {
    role.value = props.member?.role ?? ''
    customizeStages.value = false
    stages.value = []
    stageDraft.value = ''
  }
})

function commitStage() {
  const v = stageDraft.value.trim()
  if (!v) return
  if (!stages.value.includes(v)) stages.value = [...stages.value, v]
  stageDraft.value = ''
}
function removeStage(s: string) {
  stages.value = stages.value.filter(x => x !== s)
}

function onSave() {
  if (!canSave.value || !props.member) return
  emit('save', {
    memberId: props.member.id,
    role: role.value,
    customizeStages: customizeStages.value,
    stages: customizeStages.value ? stages.value : [],
  })
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-0 rounded-[20px] max-w-[520px] w-[92vw] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-white overflow-hidden"
    >
      <!-- Header — member identity + close -->
      <div class="flex items-start gap-3 px-7 pt-6 pb-5">
        <div class="flex-1 min-w-0">
          <DialogTitle class="text-[22px] font-bold text-[var(--brand-text)] leading-tight truncate">
            {{ member?.name ?? 'Team member' }}
          </DialogTitle>
          <p class="text-[14px] text-[var(--brand-text-quiet)] mt-1 truncate">{{ member?.email }}</p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-[8px] inline-flex items-center justify-center bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)] hover:text-[var(--brand-text)] transition"
          aria-label="Close"
          @click="open = false"
        >
          <X class="w-4 h-4" stroke-width="2" />
        </button>
      </div>

      <div class="h-px bg-[var(--brand-border-fade)]" />

      <!-- Body -->
      <div class="px-7 py-6 flex flex-col gap-6">
        <!-- Role -->
        <div>
          <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-2">
            Role <span class="text-[var(--brand-status-closed-text)]">*</span>
          </label>
          <div class="relative">
            <select
              v-model="role"
              required
              aria-required="true"
              class="w-full h-11 pl-3.5 pr-9 text-[14px] rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none appearance-none transition"
              :class="role === '' ? 'text-[var(--brand-text-quiet)]' : 'text-[var(--brand-text)]'"
            >
              <option value="" disabled>Select role…</option>
              <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
            </select>
            <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)] pointer-events-none" stroke-width="2" />
          </div>
        </div>

        <!-- Customize Stages -->
        <div>
          <div class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <div class="text-[14px] font-bold text-[var(--brand-text)]">Customize Stages</div>
              <div class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Restrict which pipeline stages this member can see.</div>
            </div>
            <label class="inline-flex items-center cursor-pointer shrink-0">
              <span
                class="relative inline-flex w-[38px] h-[22px] rounded-full transition-colors"
                :style="{ background: customizeStages ? 'var(--brand-lime)' : 'var(--brand-border)' }"
              >
                <span
                  class="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-[0_1px_2px_rgba(0,20,18,0.25)] transition-[left]"
                  :style="{ left: customizeStages ? '18px' : '2px' }"
                />
              </span>
              <input v-model="customizeStages" type="checkbox" class="sr-only" aria-label="Customize stages">
            </label>
          </div>

          <!-- Include Stages — revealed when Customize Stages is on -->
          <div v-if="customizeStages" class="mt-4">
            <div class="flex items-stretch rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white overflow-hidden focus-within:border-[var(--brand-teal)] transition">
              <span class="shrink-0 inline-flex items-center px-3.5 text-[13px] font-semibold text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)] border-r-[1.5px] border-[var(--brand-border)]">
                Include Stages
              </span>
              <div class="flex-1 min-w-0 flex flex-wrap items-center gap-1.5 px-3 py-2">
                <span
                  v-for="s in stages"
                  :key="s"
                  class="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--brand-text-secondary)] bg-[var(--brand-canvas)] rounded-md px-2 py-1"
                >
                  {{ s }}
                  <button class="text-[var(--brand-text-faint)] hover:text-[var(--brand-text-secondary)]" :aria-label="`Remove ${s}`" @click="removeStage(s)">
                    <X class="w-3 h-3" stroke-width="2" />
                  </button>
                </span>
                <input
                  v-model="stageDraft"
                  type="text"
                  placeholder="ex. Phone Call"
                  class="flex-1 min-w-[120px] h-7 text-[13.5px] bg-transparent focus:outline-none text-[var(--brand-text)]"
                  @keydown.enter.prevent="commitStage"
                  @keydown.tab.prevent="commitStage"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 px-7 py-4 border-t border-[var(--brand-border-fade)] bg-white">
        <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" :disabled="!canSave" @click="onSave">Save</BrandButton>
      </div>
    </DialogContent>
  </Dialog>
</template>
