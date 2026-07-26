<!--
  "Request evaluation" modal — opened from the Schedule-event form. Pick
  an evaluation form and the team members who should fill it in. Forms
  come from useEvaluationForms() (same source as Settings > Templates >
  Evaluation); team from useTeamMembers(). Reuses shadcn Dialog + Brand
  primitives; --brand-* tokens only.
-->
<script setup lang="ts">
import { Settings, ChevronDown, Plus, X } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'
import { useEvaluationForms } from '~/composables/useTemplates'
import { useTeamMembers } from '~/composables/useTeam'
import type { EvaluationForm, TeamMember } from '~/types'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ save: [payload: { formId: string; memberIds: string[] }] }>()

const { data: formsData } = useEvaluationForms()
const forms = computed<EvaluationForm[]>(() => formsData.value?.data ?? [])
const { data: teamData } = useTeamMembers()
const roster = computed<TeamMember[]>(() => teamData.value?.data ?? [])
function initialsFor(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1]![0] : '')).toUpperCase() || '?'
}

const formId = ref('')
const memberIds = ref<string[]>([])
const selectedForm = computed(() => forms.value.find(f => f.id === formId.value))
const members = computed(() => roster.value.filter(m => memberIds.value.includes(m.id)))
const availableToAdd = computed(() => roster.value.filter(m => !memberIds.value.includes(m.id)))

watch(open, (v) => {
  if (v) {
    formId.value = ''
    memberIds.value = roster.value.length ? [roster.value[0]!.id] : []
  }
})

function addMember(id: string) { if (!memberIds.value.includes(id)) memberIds.value = [...memberIds.value, id] }
function removeMember(id: string) { memberIds.value = memberIds.value.filter(x => x !== id) }
const canSave = computed(() => formId.value !== '' && memberIds.value.length > 0)
function onSave() {
  if (!canSave.value) return
  emit('save', { formId: formId.value, memberIds: memberIds.value })
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="p-0 border-0 rounded-[18px] !max-w-[520px] sm:!max-w-[520px] w-[92vw] shadow-[0_24px_64px_rgba(0,20,18,0.22)] bg-white overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 px-7 h-[60px] border-b border-[var(--brand-border-fade)]">
        <DialogTitle class="flex-1 text-[18px] font-bold text-[var(--brand-text)]">Request evaluation</DialogTitle>
        <button type="button" class="w-8 h-8 rounded-[8px] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition" aria-label="Evaluation settings">
          <Settings class="w-4 h-4" stroke-width="1.8" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-7 py-6 flex flex-col gap-6">
        <div>
          <label class="block text-[14px] font-bold text-[var(--brand-text)] mb-2">
            Select evaluation form <span class="text-[var(--brand-status-closed-text)]">*</span>
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button type="button" class="w-full inline-flex items-center gap-2 h-11 px-3.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white text-[14px] hover:border-[var(--brand-teal)] transition" :class="selectedForm ? 'text-[var(--brand-text)]' : 'text-[var(--brand-text-quiet)]'">
                <span class="flex-1 text-left truncate">{{ selectedForm?.name ?? 'Select an evaluation form' }}</span>
                <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-[--reka-dropdown-menu-trigger-width] min-w-[300px] p-1.5 rounded-[12px] max-h-[280px] overflow-y-auto">
              <DropdownMenuItem v-for="f in forms" :key="f.id" class="flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-[8px] cursor-pointer" @select="formId = f.id">
                <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ f.name }}</span>
                <span class="text-[12px] text-[var(--brand-text-quiet)]">{{ f.category }}</span>
              </DropdownMenuItem>
              <div v-if="!forms.length" class="px-3 py-3 text-[13px] text-[var(--brand-text-quiet)] italic">No evaluation forms yet.</div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <div class="text-[14px] font-bold text-[var(--brand-text)] mb-2.5">Team members</div>
          <div class="flex items-center gap-2 flex-wrap">
            <DropdownMenu v-if="availableToAdd.length">
              <DropdownMenuTrigger as-child>
                <button type="button" class="w-9 h-9 rounded-full border-[1.5px] border-dashed border-[var(--brand-border)] inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)] transition" aria-label="Add team member"><Plus class="w-4 h-4" stroke-width="2" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" class="w-[240px] p-1.5 rounded-[12px]">
                <DropdownMenuItem v-for="m in availableToAdd" :key="m.id" class="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] cursor-pointer" @select="addMember(m.id)">
                  <BrandAvatarInitials :initials="initialsFor(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="md" />
                  <span class="text-[13.5px] font-semibold text-[var(--brand-text)]">{{ m.name }}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button v-for="m in members" :key="m.id" type="button" class="group relative" :title="m.name" @click="removeMember(m.id)">
              <BrandAvatarInitials :initials="initialsFor(m.name)" :bg="m.avatarBg" :color="m.avatarText" size="xl" />
              <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-[var(--brand-border)] text-[var(--brand-text-quiet)] opacity-0 group-hover:opacity-100 inline-flex items-center justify-center transition"><X class="w-2.5 h-2.5" stroke-width="2.5" /></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 px-7 py-4 border-t border-[var(--brand-border-fade)]">
        <BrandButton variant="outline" @click="open = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" :disabled="!canSave" @click="onSave">Save</BrandButton>
      </div>
    </DialogContent>
  </Dialog>
</template>
