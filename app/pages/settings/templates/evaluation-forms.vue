<script setup lang="ts">
import {
  Plus, Pencil, ChevronUp, ChevronDown, Copy, Trash2, X, Star,
  Type, AlignLeft, ThumbsUp, CircleDot, CheckCircle2, ListChecks, ChevronsUpDown as DropdownIcon,
  Paperclip, Info,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsRenameModal from '~/components/settings/SettingsRenameModal.vue'
import SettingsRowMenu from '~/components/settings/SettingsRowMenu.vue'
import SettingsRowMenuItem from '~/components/settings/SettingsRowMenuItem.vue'
import { BrandSearchBar } from '~/components/brand'
import { useEvaluationForms } from '~/composables/useTemplates'
import type { EvalQuestion, EvalQuestionType, EvaluationForm } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useEvaluationForms()

// Local editable copy — seeded once from the mock query, then owned client-side
// (matches the same pattern used by email.vue / application-forms.vue).
const forms = ref<EvaluationForm[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    forms.value = v.data.map(f => ({
      ...f,
      questions: f.questions.map(q => ({ ...q, statements: q.statements?.map(s => ({ ...s })) })),
    }))
    seeded.value = true
  }
}, { immediate: true })

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─────────────── Question types ───────────────
const Q_TYPES: { value: EvalQuestionType, icon: typeof Type }[] = [
  { value: 'Text (single line)', icon: Type },
  { value: 'Text (multiple lines)', icon: AlignLeft },
  { value: 'Scorecard', icon: ThumbsUp },
  { value: 'Yes / No', icon: CircleDot },
  { value: 'Single choice', icon: CheckCircle2 },
  { value: 'Multiple choice', icon: ListChecks },
  { value: 'Drop-down', icon: DropdownIcon },
  { value: 'Add a file', icon: Paperclip },
  { value: 'Info box', icon: Info },
]
const CHOICE_TYPES: EvalQuestionType[] = ['Single choice', 'Multiple choice', 'Drop-down']
const iconFor = (t: EvalQuestionType) => Q_TYPES.find(o => o.value === t)?.icon ?? Type

// ─────────────── Grouping (by category, in first-seen order) ───────────────
const grouped = computed(() => {
  const order: string[] = []
  const map = new Map<string, EvaluationForm[]>()
  for (const f of forms.value) {
    if (!map.has(f.category)) { map.set(f.category, []); order.push(f.category) }
    map.get(f.category)!.push(f)
  }
  return order.map(category => ({ category, items: map.get(category)! }))
})
const categories = computed(() => grouped.value.map(g => g.category))

const search = ref('')
const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return grouped.value
  return grouped.value
    .map(g => ({ ...g, items: g.items.filter(f => f.name.toLowerCase().includes(q)) }))
    .filter(g => g.items.length > 0)
})

const selectedId = ref<string | null>(null)
watch(forms, (arr) => {
  if (!selectedId.value && arr.length) selectedId.value = arr[0]!.id
}, { immediate: true })

const selected = computed(() => forms.value.find(f => f.id === selectedId.value) ?? null)
function selectedIndex() {
  return forms.value.findIndex(f => f.id === selectedId.value)
}
const savedLabel = ref('Saved 16 days ago')
watch(selected, () => { savedLabel.value = 'Saved 16 days ago' })
function saveForm() { savedLabel.value = 'Saved just now' }
function mutateSelected(patch: (f: EvaluationForm) => void) {
  const idx = selectedIndex()
  if (idx === -1) return
  patch(forms.value[idx]!)
}

// ─────────────── Question CRUD ───────────────
function addQuestion(type: EvalQuestionType) {
  mutateSelected((f) => {
    const q: EvalQuestion = { id: newId('q'), q: '', type, required: false, hint: type === 'Info box' ? undefined : '' }
    if (CHOICE_TYPES.includes(type)) q.options = ['', '']
    if (type === 'Scorecard') q.statements = [{ id: newId('s'), s: '', d: '' }, { id: newId('s'), s: '', d: '' }]
    f.questions.push(q)
  })
}
function removeQuestion(qid: string) {
  mutateSelected(f => { f.questions = f.questions.filter(q => q.id !== qid) })
}
function duplicateQuestion(qid: string) {
  mutateSelected((f) => {
    const idx = f.questions.findIndex(q => q.id === qid)
    if (idx === -1) return
    const clone: EvalQuestion = {
      ...f.questions[idx]!,
      id: newId('q'),
      statements: f.questions[idx]!.statements?.map(s => ({ ...s, id: newId('s') })),
    }
    f.questions.splice(idx + 1, 0, clone)
  })
}
function moveQuestion(qid: string, dir: -1 | 1) {
  mutateSelected((f) => {
    const i = f.questions.findIndex(q => q.id === qid)
    const j = i + dir
    if (i === -1 || j < 0 || j >= f.questions.length) return
    ;[f.questions[i], f.questions[j]] = [f.questions[j]!, f.questions[i]!]
  })
}
function toggleRequired(qid: string) {
  mutateSelected((f) => {
    const q = f.questions.find(q => q.id === qid)
    if (q) q.required = !q.required
  })
}
function setQuestionType(qid: string, type: EvalQuestionType) {
  mutateSelected((f) => {
    const q = f.questions.find(q => q.id === qid)
    if (!q) return
    q.type = type
    q.options = CHOICE_TYPES.includes(type) ? (q.options ?? ['', '']) : undefined
    q.statements = type === 'Scorecard' ? (q.statements ?? [{ id: newId('s'), s: '', d: '' }, { id: newId('s'), s: '', d: '' }]) : undefined
  })
}
function addOption(qid: string) {
  mutateSelected((f) => { f.questions.find(q => q.id === qid)?.options?.push('') })
}
function removeOption(qid: string, i: number) {
  mutateSelected((f) => { f.questions.find(q => q.id === qid)?.options?.splice(i, 1) })
}
function addStatement(qid: string) {
  mutateSelected((f) => { f.questions.find(q => q.id === qid)?.statements?.push({ id: newId('s'), s: '', d: '' }) })
}
function removeStatement(qid: string, i: number) {
  mutateSelected((f) => { f.questions.find(q => q.id === qid)?.statements?.splice(i, 1) })
}

// ─────────────── Rename ───────────────
const renameOpen = ref(false)
const renameDraft = ref('')
function openRename() {
  if (!selected.value) return
  renameDraft.value = selected.value.name
  renameOpen.value = true
}
function confirmRename() {
  if (!renameDraft.value.trim()) return
  mutateSelected(f => { f.name = renameDraft.value.trim() })
  renameOpen.value = false
}

// ─────────────── New template ───────────────
const newModalOpen = ref(false)
const newName = ref('')
const newCategory = ref('')
function openNewModal() {
  newName.value = ''
  newCategory.value = categories.value[0] ?? 'General'
  newModalOpen.value = true
}
function createForm() {
  if (!newName.value.trim() || !newCategory.value.trim()) return
  const f: EvaluationForm = {
    id: newId('form'),
    name: newName.value.trim(),
    category: newCategory.value.trim(),
    description: '',
    scoreRequired: true,
    questions: [],
  }
  forms.value.unshift(f)
  selectedId.value = f.id
  newModalOpen.value = false
}

// ─────────────── More menu: duplicate / delete ───────────────
function duplicateForm() {
  if (!selected.value) return
  const f: EvaluationForm = {
    ...selected.value,
    id: newId('form'),
    name: `${selected.value.name} (Copy)`,
    questions: selected.value.questions.map(q => ({
      ...q,
      id: newId('q'),
      statements: q.statements?.map(s => ({ ...s, id: newId('s') })),
    })),
  }
  forms.value.unshift(f)
  selectedId.value = f.id
}
function deleteForm() {
  if (!selected.value) return
  forms.value = forms.value.filter(f => f.id !== selected.value!.id)
  selectedId.value = forms.value[0]?.id ?? null
}

// ─────────────── Score-required select ───────────────
function setScoreRequired(v: string) {
  mutateSelected(f => { f.scoreRequired = v === 'Required' })
}
const SCORE_OPTIONS = [
  { icon: '👎', label: 'No' },
  { icon: '👎👍', label: 'Not sure' },
  { icon: '👍', label: 'Yes' },
  { icon: '👍👍', label: 'Strong yes' },
]
</script>

<template>
  <div class="flex h-[calc(100vh-120px)] min-h-[600px] -m-6 overflow-hidden">
    <!-- LEFT: form list -->
    <div class="w-[280px] shrink-0 border-r border-[var(--brand-border-light)] flex flex-col bg-[var(--brand-surface-white)] overflow-hidden">
      <div class="px-4 pt-[18px] pb-3 border-b border-[var(--brand-border-fade)]">
        <div class="text-[15px] font-bold text-[var(--brand-text)] mb-1">Evaluation Forms</div>
        <p class="text-[12px] text-[var(--brand-text-quiet)] mb-3">
          Standardize how interviewers score and give feedback on candidates.
          <a href="#" class="text-[var(--brand-teal)] font-semibold">Learn more</a>
        </p>
        <Button size="sm" class="w-full gap-1.5 bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90" @click="openNewModal">
          <Plus class="w-3.5 h-3.5" />
          New template
        </Button>
      </div>

      <div class="px-3 py-2.5 border-b border-[var(--brand-border-fade)]">
        <BrandSearchBar v-model="search" placeholder="Search templates" size="sm" />
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <p v-if="isLoading && !forms.length" class="px-4 py-4 text-[13px] text-[var(--brand-text-muted)]">Loading…</p>
        <template v-else>
          <div v-for="g in filteredGroups" :key="g.category" class="mb-1">
            <div class="px-4 py-1 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[var(--brand-text-quiet)]">
              {{ g.category.toUpperCase() }}
            </div>
            <button
              v-for="f in g.items"
              :key="f.id"
              class="w-full flex items-center justify-between gap-2 mx-1.5 px-3.5 py-[9px] rounded-[8px] text-left text-[13.5px] transition-colors"
              :class="selectedId === f.id
                ? 'bg-[var(--brand-email-highlight-bg)] text-[var(--brand-teal)] font-semibold'
                : 'text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)]'"
              :style="{ width: 'calc(100% - 12px)' }"
              @click="selectedId = f.id"
            >
              <span class="flex-1 truncate">{{ f.name }}</span>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- RIGHT: editor -->
    <div class="flex-1 flex flex-col min-w-0 bg-[var(--brand-canvas)] overflow-hidden">
      <div v-if="!selected" class="flex-1 flex items-center justify-center text-[13px] text-[var(--brand-text-muted)]">
        Select a template
      </div>
      <template v-else>
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--brand-border-light)] bg-[var(--brand-surface-white)]">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-[16px] font-bold text-[var(--brand-text)]">{{ selected.name }}</span>
              <button type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] transition-colors" title="Rename" @click="openRename">
                <Pencil class="w-[13px] h-[13px]" />
              </button>
            </div>
            <div class="text-[12px] text-[var(--brand-text-quiet)]">{{ selected.category }} · {{ savedLabel }}</div>
          </div>
          <div class="flex items-center gap-2">
            <Button size="sm" class="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90 px-5" @click="saveForm">
              Save
            </Button>
            <SettingsRowMenu>
              <SettingsRowMenuItem @click="duplicateForm">
                <Copy class="w-3.5 h-3.5" />
                Duplicate
              </SettingsRowMenuItem>
              <SettingsRowMenuItem danger @click="deleteForm">
                <Trash2 class="w-3.5 h-3.5" />
                Delete
              </SettingsRowMenuItem>
            </SettingsRowMenu>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <!-- Description card -->
          <div class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[12px] mb-3.5">
            <input
              v-model="selected.description"
              type="text"
              placeholder="Describe this form in a few words"
              class="w-full border-0 border-b border-[var(--brand-border-fade)] outline-none text-[14px] text-[var(--brand-text)] bg-transparent px-4 py-3"
            >
          </div>

          <!-- Questions -->
          <div
            v-for="(question, i) in selected.questions"
            :key="question.id"
            class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden mb-2.5"
          >
            <div class="flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-[var(--brand-canvas)] border-b border-[var(--brand-border-fade)]">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button type="button" class="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-nav-text)] outline-none hover:text-[var(--brand-text)] transition-colors">
                    <component :is="iconFor(question.type)" class="w-3.5 h-3.5" />
                    {{ question.type }}
                    <ChevronDown class="w-2.5 h-2.5 text-[var(--brand-text-quiet)]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-[220px]">
                  <DropdownMenuItem
                    v-for="opt in Q_TYPES"
                    :key="opt.value"
                    class="gap-2.5 py-2 text-[13px] cursor-pointer"
                    @click="setQuestionType(question.id, opt.value)"
                  >
                    <component :is="opt.icon" class="w-3.5 h-3.5" />
                    {{ opt.value }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div class="flex items-center gap-1">
                <button type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] disabled:opacity-30 p-1" title="Move up" :disabled="i === 0" @click="moveQuestion(question.id, -1)">
                  <ChevronUp class="w-3.5 h-3.5" />
                </button>
                <button type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] disabled:opacity-30 p-1" title="Move down" :disabled="i === selected.questions.length - 1" @click="moveQuestion(question.id, 1)">
                  <ChevronDown class="w-3.5 h-3.5" />
                </button>
                <button type="button" class="p-1 outline-none" title="Required" @click="toggleRequired(question.id)">
                  <Star class="w-3.5 h-3.5" :class="question.required ? 'fill-[var(--brand-settings-danger)] text-[var(--brand-settings-danger)]' : 'text-[var(--brand-text-faint)]'" />
                </button>
                <button type="button" class="text-[var(--brand-text-quiet)] outline-none hover:text-[var(--brand-text)] p-1" title="Duplicate" @click="duplicateQuestion(question.id)">
                  <Copy class="w-3.5 h-3.5" />
                </button>
                <button type="button" class="text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] rounded-[6px] p-1 transition-colors" title="Delete" @click="removeQuestion(question.id)">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="p-4">
              <template v-if="question.type === 'Info box'">
                <textarea
                  v-model="question.q"
                  rows="3"
                  placeholder="Write your infobox text here"
                  class="w-full border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2.5 text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors resize-none"
                />
              </template>
              <template v-else>
                <label class="block text-[13px] font-bold text-[var(--brand-text)] mb-2">Question</label>
                <input
                  v-model="question.q"
                  type="text"
                  class="w-full border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2 text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors mb-2"
                >
                <input
                  v-if="question.hint !== undefined"
                  v-model="question.hint"
                  type="text"
                  placeholder="Add hint"
                  class="w-full border-0 outline-none text-[13px] text-[var(--brand-text-quiet)] bg-transparent"
                >
              </template>

              <!-- Choice / Drop-down answers -->
              <div v-if="CHOICE_TYPES.includes(question.type)" class="flex flex-col gap-2 mt-3.5">
                <div class="text-[14px] font-bold text-[var(--brand-text)] mb-0.5">
                  Answers <span class="text-[var(--brand-settings-danger)]">*</span>
                </div>
                <div v-for="(_opt, oi) in question.options" :key="oi" class="flex items-center gap-2">
                  <input
                    v-model="question.options![oi]"
                    type="text"
                    placeholder="Add option"
                    class="flex-1 border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2 text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
                  >
                  <button type="button" class="text-[var(--brand-icon-muted)] outline-none hover:text-[var(--brand-settings-danger)] p-1" @click="removeOption(question.id, oi)">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
                <button type="button" class="self-start flex items-center gap-1.5 border-[1.5px] border-[var(--brand-border-mid)] rounded-[8px] px-3 py-1.5 text-[13px] font-semibold text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors" @click="addOption(question.id)">
                  <Plus class="w-3 h-3" />
                  Add
                </button>
              </div>

              <!-- Scorecard statements -->
              <div v-else-if="question.type === 'Scorecard'" class="flex flex-col gap-3 mt-3.5">
                <div class="text-[14px] font-bold text-[var(--brand-text)]">Answers</div>
                <div v-for="(st, si) in question.statements" :key="st.id" class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <input
                      v-model="st.s"
                      type="text"
                      placeholder="Statement name..."
                      class="flex-1 border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2 text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
                    >
                    <button type="button" class="text-[var(--brand-icon-muted)] outline-none hover:text-[var(--brand-settings-danger)] p-1" @click="removeStatement(question.id, si)">
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    v-model="st.d"
                    type="text"
                    placeholder="Add description..."
                    class="border-0 outline-none text-[13px] text-[var(--brand-text-quiet)] bg-transparent pl-1"
                  >
                </div>
                <button type="button" class="self-start flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-badge-settings-text)] outline-none pl-1" @click="addStatement(question.id)">
                  <Plus class="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button type="button" class="w-full flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[var(--brand-border-mid)] rounded-[12px] py-3.5 text-[14px] font-semibold text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors mb-4">
                <Plus class="w-3.5 h-3.5" />
                Add new
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" class="w-[240px]">
              <DropdownMenuItem
                v-for="opt in Q_TYPES"
                :key="opt.value"
                class="gap-2.5 py-2 text-[13.5px] cursor-pointer"
                @click="addQuestion(opt.value)"
              >
                <component :is="opt.icon" class="w-3.5 h-3.5" />
                {{ opt.value }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Evaluation score card -->
          <div class="border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden bg-[var(--brand-surface-white)]">
            <div class="flex items-center justify-between px-[18px] py-3.5 border-b border-[var(--brand-border-fade)]">
              <span class="text-[14px] font-bold text-[var(--brand-text)]">Give the candidate an evaluation score</span>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button type="button" class="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-nav-text)] outline-none">
                    <Star class="w-3 h-3 fill-[var(--brand-settings-danger)] text-[var(--brand-settings-danger)]" />
                    {{ selected.scoreRequired ? 'Required' : 'Optional' }}
                    <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-[160px]">
                  <DropdownMenuItem class="gap-2.5 py-2 text-[13.5px] cursor-pointer" @click="setScoreRequired('Required')">Required</DropdownMenuItem>
                  <DropdownMenuItem class="gap-2.5 py-2 text-[13.5px] cursor-pointer" @click="setScoreRequired('Optional')">Optional</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div class="px-[18px] py-3.5">
              <div class="text-[13px] text-[var(--brand-text-quiet)] mb-3">Available options</div>
              <div class="flex gap-2 flex-wrap">
                <div
                  v-for="opt in SCORE_OPTIONS"
                  :key="opt.label"
                  class="flex items-center gap-1.5 px-3.5 py-1.5 border border-[var(--brand-border-light)] rounded-[10px] bg-[var(--brand-canvas)] text-[13px] font-medium text-[var(--brand-nav-text)]"
                >
                  {{ opt.icon }} {{ opt.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ─────────────── Rename modal ─────────────── -->
    <SettingsRenameModal
      v-model="renameOpen"
      :draft="renameDraft"
      @update:draft="renameDraft = $event"
      @confirm="confirmRename"
    />

    <!-- ─────────────── New template modal ─────────────── -->
    <SettingsFormModal v-model="newModalOpen" title="Create evaluation form template" width="480px">
      <div class="mb-4">
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Form name <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="newName"
          type="text"
          class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors"
        >
      </div>
      <div>
        <label class="block text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
          Template category <span class="text-[var(--brand-settings-danger)]">*</span>
        </label>
        <input
          v-model="newCategory"
          type="text"
          placeholder="e.g. Development"
          class="w-full box-border px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--brand-border)] text-[14px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors mb-2"
        >
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="c in categories"
            :key="c"
            type="button"
            class="border border-[var(--brand-border)] rounded-full px-2.5 py-1 text-[12px] text-[var(--brand-text-secondary)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors"
            @click="newCategory = c"
          >
            {{ c }}
          </button>
        </div>
      </div>
      <template #footer>
        <button type="button" class="px-[18px] py-2 text-[13.5px] font-semibold text-[var(--brand-nav-text)] outline-none" @click="newModalOpen = false">Cancel</button>
        <button type="button" class="px-[22px] py-2 rounded-[8px] bg-[var(--brand-teal)] text-white text-[13.5px] font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newName.trim() || !newCategory.trim()" @click="createForm">Create</button>
      </template>
    </SettingsFormModal>
  </div>
</template>
