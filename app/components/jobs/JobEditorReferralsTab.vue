<!--
  Referrals tab for the /jobs/new editor — the final step. A master toggle to
  allow employee referrals and Referral questions (responses
  attach to the referred candidate's profile). Mirrors the reference layout and
  reuses the job-editor card style + the inline question-editor pattern.
-->
<script setup lang="ts">
import { Plus, Pencil, Trash2, X, ChevronDown, Type, AlignLeft, Check, CheckCheck, Calendar, Hash, ListChecks } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'

const enabled = ref(true)

// ── Referral questions ──
type QType = 'text-single' | 'text-multi' | 'yesno' | 'single-choice' | 'multi-choice' | 'date' | 'number'
const QUESTION_TYPES: { key: QType; label: string; icon: any }[] = [
  { key: 'text-single', label: 'Text (single line)', icon: Type },
  { key: 'text-multi', label: 'Text (multiple lines)', icon: AlignLeft },
  { key: 'yesno', label: 'Yes / No', icon: Check },
  { key: 'single-choice', label: 'Single choice', icon: Check },
  { key: 'multi-choice', label: 'Multiple choice', icon: CheckCheck },
  { key: 'date', label: 'Date', icon: Calendar },
  { key: 'number', label: 'Number', icon: Hash },
]
interface Question { id: string; type: QType; text: string; requirement: 'required' | 'optional' }
let qid = 0
const nqid = () => `q${++qid}`
const mkQ = (type: QType, text: string): Question => ({ id: nqid(), type, text, requirement: 'optional' })
const questions = ref<Question[]>([
  mkQ('text-single', 'How do you know each other?'),
  mkQ('text-multi', 'Why are you referring them?'),
])
function removeQuestion(id: string) { questions.value = questions.value.filter(q => q.id !== id) }
const qTypeMeta = (t: QType) => QUESTION_TYPES.find(x => x.key === t) ?? QUESTION_TYPES[0]!

const qEditorOpen = ref(false)
const qDraft = reactive<{ id: string | null; type: QType; text: string; requirement: 'required' | 'optional' }>({
  id: null, type: 'text-single', text: '', requirement: 'optional',
})
const qTypeOpen = ref(false)
const qReqOpen = ref(false)
const canSaveQ = computed(() => qDraft.text.trim().length > 0)
function openQEditor(q?: Question) {
  qDraft.id = q?.id ?? null
  qDraft.type = q?.type ?? 'text-single'
  qDraft.text = q?.text ?? ''
  qDraft.requirement = q?.requirement ?? 'optional'
  qEditorOpen.value = true
}
function saveQ(addAnother = false) {
  if (!canSaveQ.value) return
  if (qDraft.id) {
    const q = questions.value.find(x => x.id === qDraft.id)
    if (q) { q.type = qDraft.type; q.text = qDraft.text.trim(); q.requirement = qDraft.requirement }
  } else {
    questions.value.push({ id: nqid(), type: qDraft.type, text: qDraft.text.trim(), requirement: qDraft.requirement })
  }
  if (addAnother) { qDraft.id = null; qDraft.text = '' } else { qEditorOpen.value = false }
}

const TEMPLATES = ['Default (Default)', 'Engineering referrals', 'Sales referrals']
const template = ref(TEMPLATES[0])
</script>

<template>
  <div class="max-w-[960px] mx-auto pt-8 flex flex-col gap-6">
    <!-- Referrals master toggle -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-8">
      <div class="flex items-start gap-3">
        <button
          type="button"
          role="switch"
          :aria-checked="enabled"
          class="relative w-11 h-6 rounded-full shrink-0 mt-0.5 transition-colors"
          :class="enabled ? 'bg-[var(--brand-teal)]' : 'bg-[var(--brand-border)]'"
          @click="enabled = !enabled"
        >
          <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform" :class="enabled ? 'translate-x-5' : ''" />
        </button>
        <div class="min-w-0">
          <div class="text-[15px] font-bold text-[var(--brand-text)]">Referrals</div>
          <p class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5">
            Allow employees to refer candidates for this job.
            <a href="#" class="font-semibold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]">Learn more</a>
          </p>
        </div>
      </div>
    </section>

    <!-- Referral questions -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-8 transition" :class="!enabled ? 'opacity-40 pointer-events-none select-none' : ''">
      <div class="flex items-start justify-between gap-3 mb-5">
        <div class="min-w-0">
          <h2 class="text-[16px] font-bold text-[var(--brand-text)]">Referral questions</h2>
          <p class="text-[13px] text-[var(--brand-text-quiet)] mt-0.5">Responses will be added to referred candidate profiles.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button type="button" class="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white text-[13px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition shrink-0">
              <ListChecks class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
              Template: {{ template }}
              <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)]" stroke-width="2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-[220px] p-1">
            <DropdownMenuItem v-for="t in TEMPLATES" :key="t" class="px-2.5 py-2 text-[13.5px] cursor-pointer" :class="t === template ? 'font-semibold text-[var(--brand-text)]' : 'text-[var(--brand-text-secondary)]'" @click="template = t">{{ t }}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="flex flex-col gap-2.5">
        <div
          v-for="q in questions"
          :key="q.id"
          class="flex items-center gap-3.5 rounded-[10px] border border-[var(--brand-border-fade)] bg-white px-4 py-3 hover:border-[var(--brand-border)] transition"
        >
          <component :is="qTypeMeta(q.type).icon" class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.7" />
          <span class="flex-1 min-w-0 text-[14px] font-semibold text-[var(--brand-text)]">{{ q.text }}</span>
          <span
            class="inline-flex items-center h-[20px] px-2 rounded-full text-[10.5px] font-bold uppercase tracking-[0.04em]"
            :class="q.requirement === 'required' ? 'text-[var(--brand-status-closed-text)] bg-[var(--brand-status-closed-bg)]' : 'text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)]'"
          >{{ q.requirement }}</span>
          <div class="flex items-center gap-1 shrink-0">
            <button type="button" class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition" aria-label="Edit question" @click="openQEditor(q)"><Pencil class="w-3.5 h-3.5" stroke-width="1.8" /></button>
            <button type="button" class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:text-[var(--brand-status-closed-text)] hover:bg-[var(--brand-status-closed-bg)] transition" aria-label="Delete question" @click="removeQuestion(q.id)"><Trash2 class="w-3.5 h-3.5" stroke-width="1.8" /></button>
          </div>
        </div>

        <!-- Inline question editor -->
        <div v-if="qEditorOpen" class="rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white overflow-hidden">
          <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--brand-border-fade)] bg-[var(--brand-canvas)]">
            <Popover v-model:open="qTypeOpen">
              <PopoverTrigger as-child>
                <button type="button" class="inline-flex items-center gap-2 h-9 px-3 rounded-[9px] border-[1.5px] border-[var(--brand-border-fade)] bg-white text-[13px] font-bold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition">
                  <component :is="qTypeMeta(qDraft.type).icon" class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
                  {{ qTypeMeta(qDraft.type).label }}
                  <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)]" stroke-width="2" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" :side-offset="6" class="w-[240px] p-1 max-h-[300px] overflow-y-auto rounded-[12px] border border-[var(--brand-border-light)] shadow-[0_12px_34px_rgba(0,20,18,0.16)]">
                <button v-for="t in QUESTION_TYPES" :key="t.key" type="button" class="w-full flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13.5px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition" @click="qDraft.type = t.key; qTypeOpen = false">
                  <component :is="t.icon" class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.7" />{{ t.label }}
                </button>
              </PopoverContent>
            </Popover>
            <div class="flex items-center gap-2">
              <Popover v-model:open="qReqOpen">
                <PopoverTrigger as-child>
                  <button type="button" class="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] border-[1.5px] border-[var(--brand-border-fade)] bg-white text-[13px] font-bold text-[var(--brand-text)] capitalize hover:bg-[var(--brand-canvas)] transition">
                    {{ qDraft.requirement }}<ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)]" stroke-width="2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" :side-offset="6" class="w-[150px] p-1 rounded-[12px] border border-[var(--brand-border-light)] shadow-[0_12px_34px_rgba(0,20,18,0.16)]">
                  <button type="button" class="w-full text-left px-3 h-9 rounded-md text-[13.5px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)]" @click="qDraft.requirement = 'optional'; qReqOpen = false">Optional</button>
                  <button type="button" class="w-full text-left px-3 h-9 rounded-md text-[13.5px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-canvas)]" @click="qDraft.requirement = 'required'; qReqOpen = false">Required</button>
                </PopoverContent>
              </Popover>
              <button type="button" class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-white transition" aria-label="Close" @click="qEditorOpen = false"><X class="w-4 h-4" stroke-width="2" /></button>
            </div>
          </div>
          <div class="px-5 py-4">
            <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-1.5">Question <span class="text-[var(--brand-status-closed-text)]">*</span></label>
            <input v-model="qDraft.text" placeholder="Type your question…" class="w-full h-11 px-3.5 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition">
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--brand-border-fade)] bg-[var(--brand-canvas)]">
            <button type="button" class="px-4 h-9 rounded-[9px] text-[13px] font-bold text-[var(--brand-text-secondary)] hover:bg-white transition" @click="qEditorOpen = false">Cancel</button>
            <button type="button" class="px-4 h-9 rounded-[9px] text-[13px] font-bold text-[var(--brand-text)] hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition" :disabled="!canSaveQ" @click="saveQ(true)">Save and add another</button>
            <button type="button" class="px-5 h-9 rounded-[9px] text-[13px] font-bold bg-[var(--brand-teal)] text-white disabled:opacity-40 disabled:pointer-events-none transition" :disabled="!canSaveQ" @click="saveQ(false)">Save</button>
          </div>
        </div>

        <button
          v-else
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 h-12 rounded-[10px] border-[1.5px] border-dashed border-[var(--brand-border)] text-[13.5px] font-bold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] transition"
          @click="openQEditor()"
        >
          <Plus class="w-3.5 h-3.5" stroke-width="2.2" />Add new
        </button>
      </div>
    </section>
  </div>
</template>
