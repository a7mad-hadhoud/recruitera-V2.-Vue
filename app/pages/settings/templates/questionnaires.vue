<script setup lang="ts">
import {
  Plus, Pencil, ChevronUp, ChevronDown, Copy, Trash2, X, Star, Eye,
  Type, AlignLeft, Video, SlidersHorizontal, CircleDot, CheckCircle2, ListChecks, Calendar, Paperclip,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsRenameModal from '~/components/settings/SettingsRenameModal.vue'
import SettingsRowMenu from '~/components/settings/SettingsRowMenu.vue'
import SettingsRowMenuItem from '~/components/settings/SettingsRowMenuItem.vue'
import { BrandButton, BrandSearchBar } from '~/components/brand'
import { useQuestionnaireForms } from '~/composables/useTemplates'
import type { QFQuestion, QFQuestionType, QuestionnaireForm } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useQuestionnaireForms()

// Local editable copy — seeded once from the mock query, then owned client-side
// (matches the same pattern used by email.vue / application-forms.vue / evaluation-forms.vue).
const forms = ref<QuestionnaireForm[]>([])
const seeded = ref(false)
watch(data, (v) => {
  if (v && !seeded.value) {
    forms.value = v.data.map(f => ({ ...f, questions: f.questions.map(q => ({ ...q })) }))
    seeded.value = true
  }
}, { immediate: true })

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─────────────── Question types ───────────────
const Q_TYPES: { value: QFQuestionType, icon: typeof Type }[] = [
  { value: 'Text (single line)', icon: Type },
  { value: 'Text (multiple lines)', icon: AlignLeft },
  { value: 'Video answer', icon: Video },
  { value: 'Rating scale', icon: SlidersHorizontal },
  { value: 'Yes / No', icon: CircleDot },
  { value: 'Single choice', icon: CheckCircle2 },
  { value: 'Multiple choice', icon: ListChecks },
  { value: 'Date', icon: Calendar },
  { value: 'File Upload', icon: Paperclip },
]
const CHOICE_TYPES: QFQuestionType[] = ['Single choice', 'Multiple choice']
const TIME_LIMITS = ['1 min', '2 min', '3 min', '5 min', '10 min']
const iconFor = (t: QFQuestionType) => Q_TYPES.find(o => o.value === t)?.icon ?? Type
const scaleNumbers = (scale?: string) => Array.from({ length: scale === '1-10' ? 10 : 5 }, (_, i) => i + 1)

// ─────────────── Grouping (by category, in first-seen order) ───────────────
const grouped = computed(() => {
  const order: string[] = []
  const map = new Map<string, QuestionnaireForm[]>()
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
function mutateSelected(patch: (f: QuestionnaireForm) => void) {
  const idx = selectedIndex()
  if (idx === -1) return
  patch(forms.value[idx]!)
}

// ─────────────── Question CRUD ───────────────
function addQuestion(type: QFQuestionType) {
  mutateSelected((f) => {
    const q: QFQuestion = { id: newId('q'), q: '', hint: '', type, required: false }
    if (type === 'Video answer') q.timeLimit = '2 min'
    if (type === 'Rating scale') q.scale = '1-5'
    if (CHOICE_TYPES.includes(type)) q.options = ['', '']
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
    f.questions.splice(idx + 1, 0, { ...f.questions[idx]!, id: newId('q') })
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
function setQuestionType(qid: string, type: QFQuestionType) {
  mutateSelected((f) => {
    const q = f.questions.find(q => q.id === qid)
    if (!q) return
    q.type = type
    q.options = CHOICE_TYPES.includes(type) ? (q.options ?? ['', '']) : undefined
    q.timeLimit = type === 'Video answer' ? (q.timeLimit ?? '2 min') : undefined
    q.scale = type === 'Rating scale' ? (q.scale ?? '1-5') : undefined
  })
}
function addOption(qid: string) {
  mutateSelected((f) => { f.questions.find(q => q.id === qid)?.options?.push('') })
}
function removeOption(qid: string, i: number) {
  mutateSelected((f) => { f.questions.find(q => q.id === qid)?.options?.splice(i, 1) })
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
  const f: QuestionnaireForm = { id: newId('form'), name: newName.value.trim(), category: newCategory.value.trim(), questions: [] }
  forms.value.unshift(f)
  selectedId.value = f.id
  newModalOpen.value = false
}

// ─────────────── More menu: duplicate / delete ───────────────
function duplicateForm() {
  if (!selected.value) return
  const f: QuestionnaireForm = {
    ...selected.value,
    id: newId('form'),
    name: `${selected.value.name} (Copy)`,
    questions: selected.value.questions.map(q => ({ ...q, id: newId('q') })),
  }
  forms.value.unshift(f)
  selectedId.value = f.id
}
function deleteForm() {
  if (!selected.value) return
  forms.value = forms.value.filter(f => f.id !== selected.value!.id)
  selectedId.value = forms.value[0]?.id ?? null
}

// ─────────────── Preview ───────────────
const previewOpen = ref(false)
</script>

<template>
  <div class="flex h-[calc(100vh-120px)] min-h-[600px] -m-6 overflow-hidden">
    <!-- LEFT: form list -->
    <div class="w-[280px] shrink-0 border-r border-[var(--brand-border-light)] flex flex-col bg-[var(--brand-surface-white)] overflow-hidden">
      <div class="px-4 pt-[18px] pb-3 border-b border-[var(--brand-border-fade)]">
        <div class="text-[15px] font-bold text-[var(--brand-text)] mb-1">Questionnaire Forms</div>
        <p class="text-[12px] text-[var(--brand-text-quiet)] mb-3">
          Send candidates a set of screening questions before or after they apply.
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
            <Button size="sm" variant="outline" class="gap-1.5 px-3.5" @click="previewOpen = true">
              <Eye class="w-3.5 h-3.5" />
              Preview
            </Button>
            <SettingsRowMenu>
              <SettingsRowMenuItem @click="duplicateForm">
                <Copy class="w-[14px] h-[14px]" />
                Duplicate
              </SettingsRowMenuItem>
              <SettingsRowMenuItem danger @click="deleteForm">
                <Trash2 class="w-[14px] h-[14px]" />
                Delete
              </SettingsRowMenuItem>
            </SettingsRowMenu>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div
            v-for="(question, i) in selected.questions"
            :key="question.id"
            class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden mb-2.5"
          >
            <div class="flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-[var(--brand-canvas)] border-b border-[var(--brand-border-fade)] flex-wrap">
              <div class="flex items-center gap-2.5 flex-wrap">
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

                <div v-if="question.type === 'Video answer'" class="flex items-center gap-1.5 border border-[var(--brand-border-mid)] rounded-[8px] px-2.5 py-1 bg-[var(--brand-surface-white)]">
                  <Video class="w-3 h-3 text-[var(--brand-nav-text)]" />
                  <select v-model="question.timeLimit" class="border-0 outline-none text-[12.5px] text-[var(--brand-nav-text)] bg-transparent cursor-pointer">
                    <option v-for="t in TIME_LIMITS" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div v-if="question.type === 'Rating scale'" class="flex items-center gap-1.5 border border-[var(--brand-border-mid)] rounded-[8px] px-2.5 py-1 bg-[var(--brand-surface-white)]">
                  <span class="text-[11px] font-bold text-[var(--brand-text-quiet)]">123</span>
                  <select v-model="question.scale" class="border-0 outline-none text-[12.5px] text-[var(--brand-nav-text)] bg-transparent cursor-pointer">
                    <option value="1-5">1-5</option>
                    <option value="1-10">1-10</option>
                  </select>
                </div>
              </div>

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
              <label class="flex items-center gap-1 text-[13px] font-bold text-[var(--brand-text)] mb-2">
                Question <span v-if="question.required" class="text-[var(--brand-settings-danger)]">*</span>
              </label>
              <input
                v-model="question.q"
                type="text"
                class="w-full border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2 text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors mb-2"
              >
              <input
                v-model="question.hint"
                type="text"
                placeholder="Add hint"
                class="w-full border-0 outline-none text-[13px] text-[var(--brand-text-quiet)] bg-transparent"
              >

              <!-- Rating scale grid -->
              <div v-if="question.type === 'Rating scale'" class="mt-3.5">
                <div
                  class="grid gap-1.5 mb-2.5"
                  :style="{ gridTemplateColumns: `repeat(${question.scale === '1-10' ? 10 : 5}, 1fr)` }"
                >
                  <div
                    v-for="n in scaleNumbers(question.scale)"
                    :key="n"
                    class="border border-[var(--brand-border-light)] rounded-[8px] py-2.5 text-center text-[13.5px] font-medium text-[var(--brand-nav-text)] bg-[var(--brand-surface-white)]"
                  >
                    {{ n }}
                  </div>
                </div>
                <div class="flex justify-between gap-3">
                  <input v-model="question.scaleLabelLow" type="text" placeholder="Add label" class="w-[45%] border-0 border-b border-[var(--brand-border-light)] outline-none text-[12.5px] text-[var(--brand-text-quiet)] bg-transparent pb-1">
                  <input v-model="question.scaleLabelHigh" type="text" placeholder="Add label" class="w-[45%] border-0 border-b border-[var(--brand-border-light)] outline-none text-[12.5px] text-[var(--brand-text-quiet)] bg-transparent pb-1 text-right">
                </div>
              </div>

              <!-- Choice options -->
              <div v-else-if="CHOICE_TYPES.includes(question.type)" class="flex flex-col gap-2 mt-3.5">
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
                <BrandButton type="button" variant="outline" size="sm" class="self-start gap-1.5 font-semibold" @click="addOption(question.id)">
                  <Plus class="w-3 h-3" />
                  Add
                </BrandButton>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button type="button" class="w-full flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[var(--brand-border-mid)] rounded-[12px] py-3.5 text-[14px] font-semibold text-[var(--brand-nav-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
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
    <SettingsFormModal v-model="newModalOpen" title="Create questionnaire template" width="480px">
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
          placeholder="e.g. Screening"
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
        <BrandButton type="button" variant="ghost" size="md" @click="newModalOpen = false">Cancel</BrandButton>
        <BrandButton type="button" variant="primary-teal" size="md" :disabled="!newName.trim() || !newCategory.trim()" @click="createForm">Create</BrandButton>
      </template>
    </SettingsFormModal>

    <!-- ─────────────── Preview modal ─────────────── -->
    <SettingsFormModal v-if="selected" v-model="previewOpen" :title="`Preview · ${selected.name}`" width="520px">
      <div class="flex flex-col gap-4 max-h-[60vh] overflow-y-auto -mx-1 px-1">
        <div v-for="question in selected.questions" :key="question.id">
          <label class="flex items-center gap-1 text-[13.5px] font-bold text-[var(--brand-text)] mb-2">
            {{ question.q || question.type }}
            <span v-if="question.required" class="text-[var(--brand-settings-danger)]">*</span>
          </label>
          <p v-if="question.hint" class="text-[12px] text-[var(--brand-text-quiet)] mb-2">{{ question.hint }}</p>

          <input v-if="question.type === 'Text (single line)'" type="text" disabled placeholder="Candidate's answer" class="w-full border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2 text-[13.5px] text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)]">
          <textarea v-else-if="question.type === 'Text (multiple lines)'" disabled rows="3" placeholder="Candidate's answer" class="w-full border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2 text-[13.5px] text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)] resize-none" />
          <div v-else-if="question.type === 'Video answer'" class="flex items-center gap-2 border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2.5 text-[13px] text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)]">
            <Video class="w-4 h-4" /> Record a video ({{ question.timeLimit }} limit)
          </div>
          <div v-else-if="question.type === 'Rating scale'" class="grid gap-1.5" :style="{ gridTemplateColumns: `repeat(${question.scale === '1-10' ? 10 : 5}, 1fr)` }">
            <div v-for="n in scaleNumbers(question.scale)" :key="n" class="border border-[var(--brand-border-light)] rounded-[8px] py-2 text-center text-[13px] text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)]">{{ n }}</div>
          </div>
          <div v-else-if="question.type === 'Yes / No'" class="flex gap-2">
            <div v-for="ans in ['Yes', 'No']" :key="ans" class="border border-[var(--brand-border-light)] rounded-[9px] px-4 py-2 text-[13.5px] text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)]">{{ ans }}</div>
          </div>
          <div v-else-if="CHOICE_TYPES.includes(question.type)" class="flex flex-col gap-1.5">
            <div v-for="(opt, oi) in question.options" :key="oi" class="border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2 text-[13.5px] text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)]">{{ opt || 'Option' }}</div>
          </div>
          <div v-else-if="question.type === 'Date'" class="border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2 text-[13.5px] text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)] w-fit flex items-center gap-2">
            <Calendar class="w-3.5 h-3.5" /> Select a date
          </div>
          <div v-else-if="question.type === 'File Upload'" class="flex items-center gap-2 border border-dashed border-[var(--brand-border-mid)] rounded-[9px] px-3 py-2.5 text-[13px] text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)]">
            <Paperclip class="w-3.5 h-3.5" /> Attach a file
          </div>
        </div>
        <p v-if="!selected.questions.length" class="text-[13px] text-[var(--brand-text-quiet)]">This template has no questions yet.</p>
      </div>
      <template #footer>
        <BrandButton type="button" variant="primary-teal" size="lg" @click="previewOpen = false">Close</BrandButton>
      </template>
    </SettingsFormModal>
  </div>
</template>
