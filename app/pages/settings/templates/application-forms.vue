<script setup lang="ts">
import {
  Plus, Star, Pencil, GripVertical, Trash2, X,
  Type, AlignLeft, CircleDot, CheckCircle2, ListChecks as MultiChoiceIcon,
  Calendar, Hash, Banknote, Video, Paperclip, Info, Scale, ChevronDown,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import SettingsFormModal from '~/components/settings/SettingsFormModal.vue'
import SettingsRenameModal from '~/components/settings/SettingsRenameModal.vue'
import SettingsRowMenu from '~/components/settings/SettingsRowMenu.vue'
import SettingsRowMenuItem from '~/components/settings/SettingsRowMenuItem.vue'
import { BrandSearchBar } from '~/components/brand'
import { useApplicationForms } from '~/composables/useTemplates'
import type { ApplicationForm, FormQuestion, QuestionType } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useApplicationForms()

// Local editable copy — seeded once from the mock query, then owned client-side
// (matches the same pattern used by locations.vue / job-titles.vue / email.vue).
const forms = ref<ApplicationForm[]>([])
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
const Q_TYPES: { value: QuestionType, icon: typeof Type }[] = [
  { value: 'Text (single line)', icon: Type },
  { value: 'Text (multiple lines)', icon: AlignLeft },
  { value: 'Yes / No', icon: CircleDot },
  { value: 'Single choice', icon: CheckCircle2 },
  { value: 'Multiple choice', icon: MultiChoiceIcon },
  { value: 'Date', icon: Calendar },
  { value: 'Number', icon: Hash },
  { value: 'Salary', icon: Banknote },
  { value: 'Video answer', icon: Video },
  { value: 'Add a file', icon: Paperclip },
  { value: 'Info box', icon: Info },
  { value: 'Legal', icon: Scale },
]
const CHOICE_TYPES: QuestionType[] = ['Single choice', 'Multiple choice']
const NO_QUESTION_TEXT: QuestionType[] = ['Info box', 'Legal']
const iconFor = (t: QuestionType) => Q_TYPES.find(o => o.value === t)?.icon ?? Type

// ─────────────── Grouping (by category, in first-seen order) ───────────────
const grouped = computed(() => {
  const order: string[] = []
  const map = new Map<string, ApplicationForm[]>()
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
function mutateSelected(patch: (f: ApplicationForm) => void) {
  const idx = selectedIndex()
  if (idx === -1) return
  patch(forms.value[idx]!)
}

// ─────────────── Question CRUD ───────────────
const addTypeMenuOpen = ref(false)
function addQuestion(type: QuestionType) {
  mutateSelected((f) => {
    const q: FormQuestion = { id: newId('q'), q: '', type, required: false }
    if (CHOICE_TYPES.includes(type)) q.options = ['', '']
    if (type === 'Salary') q.currency = 'USD'
    f.questions.push(q)
  })
}
function removeQuestion(qid: string) {
  mutateSelected(f => { f.questions = f.questions.filter(q => q.id !== qid) })
}
function setQuestionType(qid: string, type: QuestionType) {
  mutateSelected((f) => {
    const q = f.questions.find(q => q.id === qid)
    if (!q) return
    q.type = type
    q.options = CHOICE_TYPES.includes(type) ? (q.options ?? ['', '']) : undefined
    q.currency = type === 'Salary' ? (q.currency ?? 'USD') : undefined
  })
}
function addOption(qid: string) {
  mutateSelected((f) => {
    const q = f.questions.find(q => q.id === qid)
    q?.options?.push('')
  })
}
function removeOption(qid: string, i: number) {
  mutateSelected((f) => {
    const q = f.questions.find(q => q.id === qid)
    q?.options?.splice(i, 1)
  })
}

// Drag reorder — same pattern as CandidatesFilters favorites reordering.
const dragFromId = ref<string | null>(null)
function onQDragStart(id: string) { dragFromId.value = id }
function onQDrop(targetId: string) {
  if (!dragFromId.value || dragFromId.value === targetId) return
  mutateSelected((f) => {
    const from = f.questions.findIndex(q => q.id === dragFromId.value)
    const to = f.questions.findIndex(q => q.id === targetId)
    if (from === -1 || to === -1) return
    const [moved] = f.questions.splice(from, 1)
    f.questions.splice(to, 0, moved!)
  })
  dragFromId.value = null
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
  const f: ApplicationForm = {
    id: newId('form'),
    name: newName.value.trim(),
    category: newCategory.value.trim(),
    questions: [],
    isDefault: false,
  }
  forms.value.unshift(f)
  selectedId.value = f.id
  newModalOpen.value = false
}

// ─────────────── More menu: duplicate / delete ─────────────── (ground
// truth's "Set as default" is itself a labeled no-op there — mirrored as-is)
function duplicateForm() {
  if (!selected.value) return
  const f: ApplicationForm = {
    ...selected.value,
    id: newId('form'),
    name: `${selected.value.name} (Copy)`,
    isDefault: false,
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
</script>

<template>
  <div class="flex h-[calc(100vh-120px)] min-h-[600px] -m-6 overflow-hidden">
    <!-- LEFT: form list -->
    <div class="w-[280px] shrink-0 border-r border-[var(--brand-border-light)] flex flex-col bg-[var(--brand-surface-white)] overflow-hidden">
      <div class="px-4 pt-[18px] pb-3 border-b border-[var(--brand-border-fade)]">
        <div class="text-[15px] font-bold text-[var(--brand-text)] mb-1">Application Forms</div>
        <p class="text-[12px] text-[var(--brand-text-quiet)] mb-3">
          Create reusable application forms with custom questions for different roles.
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
              <Star v-if="f.isDefault" class="w-3.5 h-3.5 shrink-0 fill-[var(--brand-lime)] text-[var(--brand-badge-settings-text)]" />
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
            <div class="text-[12px] text-[var(--brand-text-quiet)]">
              {{ selected.questions.length }} question{{ selected.questions.length === 1 ? '' : 's' }} · {{ savedLabel }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button size="sm" class="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90 px-5" @click="saveForm">
              Save
            </Button>
            <SettingsRowMenu>
              <div class="px-3 pt-2 pb-1 text-[12px] font-bold text-[var(--brand-text-quiet)]">Not used yet</div>
              <SettingsRowMenuItem disabled>
                <Star class="w-[14px] h-[14px]" />
                Set as default
              </SettingsRowMenuItem>
              <SettingsRowMenuItem @click="duplicateForm">
                <Pencil class="w-[14px] h-[14px]" />
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
            class="bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-[12px] overflow-hidden mb-2"
            draggable="true"
            @dragstart="onQDragStart(question.id)"
            @dragover.prevent
            @drop="onQDrop(question.id)"
          >
            <div class="flex items-center gap-2.5 px-4 py-3 bg-[var(--brand-canvas)] border-b border-[var(--brand-border-fade)]">
              <GripVertical class="w-3.5 h-3.5 text-[var(--brand-text-faint)] cursor-grab shrink-0" />
              <span class="text-[12px] font-semibold text-[var(--brand-text-quiet)] shrink-0">Question {{ i + 1 }}</span>
              <div class="flex-1" />
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button type="button" class="flex items-center gap-1.5 border border-[var(--brand-border-mid)] rounded-[8px] px-2.5 py-1 bg-[var(--brand-surface-white)] text-[13px] text-[var(--brand-text)] outline-none hover:bg-[var(--brand-surface-hover)] transition-colors">
                    <component :is="iconFor(question.type)" class="w-3.5 h-3.5" />
                    {{ question.type }}
                    <ChevronDown class="w-2.5 h-2.5 text-[var(--brand-text-quiet)]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-[220px]">
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
              <div class="flex items-center gap-1.5">
                <Switch :model-value="question.required" class="data-[state=checked]:bg-[var(--brand-teal)]" @update:model-value="v => question.required = v" />
                <span class="text-[12.5px] font-medium text-[var(--brand-nav-text)]">{{ question.required ? 'Required' : 'Optional' }}</span>
              </div>
              <button type="button" class="text-[var(--brand-settings-danger)] outline-none hover:bg-[var(--brand-settings-danger-hover-bg)] rounded-[6px] p-1.5 transition-colors" title="Delete question" @click="removeQuestion(question.id)">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="p-4">
              <!-- Question text (skipped for Info box / Legal — those edit their own body text instead) -->
              <input
                v-if="!NO_QUESTION_TEXT.includes(question.type)"
                v-model="question.q"
                type="text"
                placeholder="Question text"
                class="w-full border-0 outline-none text-[14px] font-medium text-[var(--brand-text)] bg-transparent"
              >

              <!-- Yes / No -->
              <div v-if="question.type === 'Yes / No'" class="flex flex-col gap-2 mt-3">
                <div v-for="ans in ['Yes', 'No']" :key="ans" class="border border-[var(--brand-border-light)] rounded-[9px] px-3.5 py-2.5 text-[13.5px] text-[var(--brand-text)] bg-[var(--brand-canvas)]">
                  {{ ans }}
                </div>
              </div>

              <!-- Single / Multiple choice -->
              <div v-else-if="CHOICE_TYPES.includes(question.type)" class="flex flex-col gap-2 mt-3">
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

              <!-- Salary -->
              <div v-else-if="question.type === 'Salary'" class="mt-3">
                <label class="block text-[12px] font-semibold text-[var(--brand-text-quiet)] mb-1.5">Currency</label>
                <select v-model="question.currency" class="w-full border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2 text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)]">
                  <option v-for="c in ['USD', 'SAR', 'AED', 'EGP', 'JOD']" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>

              <!-- Info box / Legal -->
              <textarea
                v-else-if="NO_QUESTION_TEXT.includes(question.type)"
                v-model="question.text"
                rows="3"
                :placeholder="question.type === 'Info box' ? 'Write your infobox text here' : 'Write your legal note here'"
                class="w-full border border-[var(--brand-border-light)] rounded-[9px] px-3 py-2.5 text-[13.5px] text-[var(--brand-text)] outline-none bg-[var(--brand-surface-white)] focus:border-[var(--brand-teal)] transition-colors resize-none"
              />

              <!-- Date / Number / Video answer / Add a file — no extra config, just a caption -->
              <p v-else class="text-[12.5px] text-[var(--brand-text-quiet)] mt-2">
                Candidates will answer with a {{ question.type.toLowerCase() }}.
              </p>
            </div>
          </div>

          <DropdownMenu v-model:open="addTypeMenuOpen">
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
    <SettingsFormModal v-model="newModalOpen" title="Create application form template" width="480px">
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
          placeholder="e.g. Engineering"
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
