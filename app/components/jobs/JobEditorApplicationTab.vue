<!--
  Application tab body for the /jobs/new editor. Ports the reference
  layout (candidate info + screening questions + auto-confirmation
  email + application preferences).

  Everything reuses --brand-* tokens; no hex colors. Reuses BrandButton
  where a CTA fits its variants. Section cards match the JobDetails
  cards (rounded-12, white, border-fade) so the editor reads as one
  design system.
-->
<script setup lang="ts">
import { User, Mail, Phone, UserCircle2, Paperclip, Image as ImageIcon, GripVertical,
         Sparkles, ChevronDown, Search, Pencil, Trash2, Plus, Info, Type, AlignLeft,
         Check, CheckCheck, Calendar, Hash, CircleDollarSign, Video, FileText, Scale, Eye } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

type FieldRequirement = 'required' | 'optional' | 'remove'
type CandidateFieldKey = 'name' | 'email' | 'phone' | 'gender' | 'cv' | 'photo'

interface CandidateField {
  key: CandidateFieldKey
  label: string
  icon: any
  locked?: boolean
  value: FieldRequirement
}

// Candidate information — the six default fields (Name / Email are
// locked-required; the other four have a Required / Optional / Remove
// tri-toggle). Editable by the recruiter creating the job.
const candidateFields = reactive<CandidateField[]>([
  { key: 'name',   label: 'Name',          icon: User,        locked: true, value: 'required' },
  { key: 'email',  label: 'Email Address', icon: Mail,        locked: true, value: 'required' },
  { key: 'phone',  label: 'Phone Number',  icon: Phone,       value: 'required' },
  { key: 'gender', label: 'Gender',        icon: UserCircle2, value: 'required' },
  { key: 'cv',     label: 'CV',            icon: Paperclip,   value: 'required' },
  { key: 'photo',  label: 'Photo',         icon: ImageIcon,   value: 'optional' },
])
function setFieldValue(f: CandidateField, v: FieldRequirement) {
  if (f.locked) return
  f.value = v
}

// Screening questions — Q/A list + editor. Fixture today; each row
// carries text, visibility ("Everyone" / "Only me"), knockout flag.
type QuestionType =
  | 'text-single' | 'text-multi' | 'yesno'
  | 'single-choice' | 'multi-choice'
  | 'date' | 'number' | 'salary' | 'video' | 'file' | 'infobox' | 'legal'

interface ScreeningQuestion {
  id: string
  type: QuestionType
  text: string
  visibility: 'everyone' | 'me'
  knockout?: boolean
  choices?: string[]  // for single/multi choice
}

const questions = reactive<ScreeningQuestion[]>([
  { id: 'q1', type: 'text-single',   text: 'What do you consider to be your top 5 core strengths?', visibility: 'everyone' },
  { id: 'q2', type: 'multi-choice',  text: 'Which areas you feel are your strongest:',              visibility: 'me',       knockout: true,
    choices: ['Product marketing', 'Social Media', 'SEO / SEM', 'Content strategy', 'Market research'] },
  { id: 'q3', type: 'text-single',   text: 'Which city do you live in?',                            visibility: 'everyone' },
  { id: 'q4', type: 'video',         text: 'Tell us why you want to join us.',                      visibility: 'everyone' },
])
function removeQuestion(id: string) {
  const idx = questions.findIndex(q => q.id === id)
  if (idx >= 0) questions.splice(idx, 1)
}

// Type picker — same catalog the reference shows in the +Add new popover.
const QUESTION_TYPES: Array<{ key: QuestionType; label: string; icon: any }> = [
  { key: 'text-single',   label: 'Text (single line)',    icon: Type              },
  { key: 'text-multi',    label: 'Text (multiple lines)', icon: AlignLeft         },
  { key: 'yesno',         label: 'Yes / No',              icon: Check             },
  { key: 'single-choice', label: 'Single choice',         icon: Check             },
  { key: 'multi-choice',  label: 'Multiple choice',       icon: CheckCheck        },
  { key: 'date',          label: 'Date',                  icon: Calendar          },
  { key: 'number',        label: 'Number',                icon: Hash              },
  { key: 'salary',        label: 'Salary',                icon: CircleDollarSign  },
  { key: 'video',         label: 'Video answer',          icon: Video             },
  { key: 'file',          label: 'Add a file',            icon: Paperclip         },
  { key: 'infobox',       label: 'Info box',              icon: Info              },
  { key: 'legal',         label: 'Legal',                 icon: Scale             },
]
function addQuestion(type: QuestionType) {
  const id = `q${questions.length + 1}-${Date.now()}`
  questions.push({ id, type, text: '', visibility: 'everyone', choices: (type === 'single-choice' || type === 'multi-choice') ? [''] : undefined })
}

const templatePickerOpen = ref(false)

// Auto-confirmation email toggle. Enabled by default in the ref, but
// gated behind PAID PLANS ONLY — flip on trial and the upgrade banner
// stays visible below the toggle.
const autoEmailOn = ref(true)
</script>

<template>
  <div class="max-w-[700px] mx-auto p-6 flex flex-col gap-4">
    <!-- 1) Candidate information ────────────────────────────── -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] overflow-hidden">
      <div class="px-5 pt-5 pb-4 border-b border-[var(--brand-border-fade)]">
        <h2 class="text-[16px] font-bold text-[var(--brand-text)] leading-tight">Candidate information</h2>
        <p class="text-[13px] text-[var(--brand-text-quiet)] mt-1">Candidates will fill out these details on the application form.</p>
      </div>

      <div
        v-for="f in candidateFields"
        :key="f.key"
        class="flex items-center gap-3.5 px-5 py-3 border-b border-[var(--brand-border-fade)] last:border-b-0"
      >
        <GripVertical
          class="w-3.5 h-3.5 text-[var(--brand-border)] shrink-0"
          :class="f.locked ? '' : 'cursor-grab text-[var(--brand-text-quiet)]'"
          stroke-width="2"
        />
        <component :is="f.icon" class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.7" />
        <span class="flex-1 text-[14px] font-semibold text-[var(--brand-text)]">{{ f.label }}</span>

        <span
          v-if="f.locked"
          class="text-[12px] font-semibold text-[var(--brand-text-faint)]"
        >Required · Locked</span>
        <div v-else role="group" class="inline-flex items-stretch rounded-[10px] overflow-hidden border border-[var(--brand-border-fade)]">
          <button
            type="button"
            class="px-3.5 h-8 text-[12.5px] font-bold transition"
            :class="f.value === 'required'
              ? 'bg-[var(--brand-text)] text-white'
              : 'bg-white text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)]'"
            @click="setFieldValue(f, 'required')"
          >Required</button>
          <span class="w-px bg-[var(--brand-border-fade)]" />
          <button
            type="button"
            class="px-3.5 h-8 text-[12.5px] font-bold transition"
            :class="f.value === 'optional'
              ? 'bg-[var(--brand-text)] text-white'
              : 'bg-white text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)]'"
            @click="setFieldValue(f, 'optional')"
          >Optional</button>
          <span class="w-px bg-[var(--brand-border-fade)]" />
          <button
            type="button"
            class="px-3.5 h-8 text-[12.5px] font-bold transition text-[var(--brand-text-secondary)] hover:bg-[var(--brand-status-closed-bg)] hover:text-[var(--brand-status-closed-text)]"
            @click="setFieldValue(f, 'remove')"
          >Remove</button>
        </div>
      </div>
    </section>

    <!-- 2) Screening questions ──────────────────────────────── -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] overflow-hidden">
      <div class="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-[var(--brand-border-fade)]">
        <div>
          <h2 class="text-[16px] font-bold text-[var(--brand-text)] leading-tight">Screening questions</h2>
          <p class="text-[13px] text-[var(--brand-text-quiet)] mt-1">
            Candidates will answer these questions before applying.
            <a class="font-bold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]" href="#">Learn more</a>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button class="inline-flex items-center gap-1.5 px-3 h-9 rounded-[8px] border-[1.5px] border-[var(--brand-border-fade)] bg-[var(--brand-canvas)] text-[13px] font-bold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] transition">
            <Sparkles class="w-3.5 h-3.5" stroke-width="1.8" />
            AI Suggestions
          </button>
          <Popover v-model:open="templatePickerOpen">
            <PopoverTrigger as-child>
              <button class="inline-flex items-center gap-1.5 px-3 h-9 rounded-[8px] border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-canvas)] text-[13px] font-bold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] transition">
                Custom for this job
                <ChevronDown class="w-3 h-3" stroke-width="2" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" class="w-[220px] p-1">
              <div class="px-3 pt-2 pb-1 relative">
                <Search class="w-3.5 h-3.5 absolute left-5 top-1/2 -translate-y-1/2 text-[var(--brand-text-quiet)]" stroke-width="2" />
                <input placeholder="Search" class="w-full h-8 pl-7 pr-2 text-[13px] rounded-md bg-[var(--brand-canvas)] border border-transparent focus:border-[var(--brand-teal)] focus:bg-white focus:outline-none">
              </div>
              <button class="w-full text-left px-3 py-2 text-[13.5px] font-semibold rounded-md hover:bg-[var(--brand-canvas)]">None</button>
              <button class="w-full text-left px-3 py-2 text-[13.5px] font-semibold rounded-md bg-[var(--brand-lime-tint)] text-[var(--brand-teal)]">Custom for this job</button>
              <div class="my-1 border-t border-[var(--brand-border-fade)]" />
              <div class="px-3 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)]">Templates</div>
              <button class="w-full text-left px-3 py-2 text-[13.5px] font-semibold rounded-md hover:bg-[var(--brand-canvas)]">Test 1</button>
              <div class="my-1 border-t border-[var(--brand-border-fade)]" />
              <button class="w-full flex items-center gap-2 px-3 py-2 text-[13.5px] font-semibold rounded-md hover:bg-[var(--brand-canvas)]">
                <Plus class="w-3.5 h-3.5" stroke-width="2" />
                Save as template
              </button>
              <button class="w-full flex items-center gap-2 px-3 py-2 text-[13.5px] font-semibold rounded-md hover:bg-[var(--brand-canvas)]">
                <Pencil class="w-3.5 h-3.5" stroke-width="1.8" />
                Manage templates
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div
        v-for="q in questions"
        :key="q.id"
        class="flex items-start gap-3.5 px-5 py-3.5 border-b border-[var(--brand-border-fade)] last:border-b-0"
      >
        <GripVertical class="w-3.5 h-3.5 text-[var(--brand-border)] shrink-0 cursor-grab mt-0.5" stroke-width="2" />
        <component
          :is="QUESTION_TYPES.find(t => t.key === q.type)?.icon ?? Type"
          class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0 mt-0.5"
          stroke-width="1.7"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[14px] font-semibold text-[var(--brand-text)]">{{ q.text }}</span>
            <span
              v-if="q.knockout"
              class="text-[10.5px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 bg-[color-mix(in_srgb,orange_18%,white)] text-[color-mix(in_srgb,orange_65%,black)]"
            >KNOCKOUT</span>
          </div>
          <div v-if="q.choices?.length" class="text-[12px] text-[var(--brand-text-quiet)] mt-1">
            {{ q.choices.join(' · ') }}
          </div>
        </div>
        <span class="text-[12px] text-[var(--brand-text-quiet)] whitespace-nowrap self-center">
          {{ q.visibility === 'me' ? 'Only me' : 'Everyone' }}
        </span>
        <div class="flex items-center gap-1 shrink-0 self-center">
          <button class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-canvas)] transition" aria-label="Edit question">
            <Pencil class="w-3.5 h-3.5" stroke-width="1.8" />
          </button>
          <button
            class="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-status-closed-bg)] hover:text-[var(--brand-status-closed-text)] transition"
            aria-label="Delete question"
            @click="removeQuestion(q.id)"
          >
            <Trash2 class="w-3.5 h-3.5" stroke-width="1.8" />
          </button>
        </div>
      </div>

      <!-- Add new question — type picker popover -->
      <div class="p-3">
        <Popover>
          <PopoverTrigger as-child>
            <button class="w-full inline-flex items-center justify-center gap-2 h-11 rounded-[9px] border-[1.5px] border-dashed border-[var(--brand-border)] bg-transparent text-[13.5px] font-bold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] hover:border-[var(--brand-teal)] hover:bg-[var(--brand-lime-tint)] transition">
              <Plus class="w-3.5 h-3.5" stroke-width="2.2" />
              Add new
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" :side-offset="6" class="w-[260px] p-1.5">
            <div class="px-2.5 pt-1.5 pb-1 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--brand-text-quiet)]">Answer type</div>
            <button
              v-for="t in QUESTION_TYPES"
              :key="t.key"
              class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13.5px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)]/60 transition"
              @click="addQuestion(t.key)"
            >
              <component :is="t.icon" class="w-4 h-4 text-[var(--brand-text-quiet)] shrink-0" stroke-width="1.7" />
              {{ t.label }}
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </section>

    <!-- 3) Auto-confirmation email ──────────────────────────── -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-5">
      <div class="flex items-start gap-3.5">
        <!-- Toggle switch -->
        <label class="inline-flex items-center cursor-pointer shrink-0 mt-1">
          <span
            class="relative inline-flex w-[34px] h-5 rounded-full transition-colors"
            :style="{ background: autoEmailOn ? 'var(--brand-teal)' : 'var(--brand-border)' }"
          >
            <span
              class="absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-[0_1px_2px_rgba(0,20,18,0.25)] transition-[left]"
              :style="{ left: autoEmailOn ? '16px' : '2px' }"
            />
          </span>
          <input v-model="autoEmailOn" type="checkbox" class="sr-only" aria-label="Send auto-confirmation email">
        </label>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[14px] font-bold text-[var(--brand-text)]">Send an auto-confirmation email</span>
            <span class="inline-flex items-center gap-1 text-[10.5px] font-bold rounded px-1.5 py-0.5 bg-[var(--brand-status-closed-bg)] text-[var(--brand-status-closed-text)]">
              <Info class="w-3 h-3" stroke-width="2" />
              PAID PLANS ONLY
            </span>
          </div>
          <p class="text-[13px] text-[var(--brand-text-quiet)] mt-1">
            Candidates receive a confirmation email after applying.
            <a class="font-bold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]" href="#">Learn more</a>
          </p>
        </div>

        <button class="inline-flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition">
          <AlignLeft class="w-3.5 h-3.5" stroke-width="1.7" />
          Template: Auto-confirmation (Default)
          <ChevronDown class="w-3 h-3" stroke-width="2" />
        </button>
      </div>

      <!-- Trial upgrade banner -->
      <div class="mt-4 flex items-center gap-3 p-3.5 rounded-[9px] border border-[color-mix(in_srgb,orange_25%,white)] bg-[color-mix(in_srgb,orange_10%,white)]">
        <Info class="w-4 h-4 shrink-0 text-[color-mix(in_srgb,orange_60%,black)]" stroke-width="2" />
        <span class="flex-1 text-[13px] text-[color-mix(in_srgb,orange_60%,black)]">
          This feature is not available on trial. Upgrade your plan to send auto-confirmation emails.
        </span>
        <a class="text-[13px] font-bold underline text-[var(--brand-text)]" href="#">Upgrade</a>
      </div>

      <!-- Email preview -->
      <div class="mt-4 rounded-[10px] border border-[var(--brand-border-fade)] overflow-hidden">
        <div class="px-4 py-3.5 border-b border-[var(--brand-border-fade)] text-[13.5px] text-[var(--brand-text-quiet)]">
          [job_offer] – Confirmation of your application
        </div>
        <div class="p-4 text-[13.5px] leading-relaxed text-[var(--brand-text-secondary)] space-y-2.5">
          <p>Your application for the [job_offer] position has been successfully submitted.</p>
          <p>If you want to add something to your application just respond to this email.</p>
          <p>[company]</p>
        </div>
      </div>
    </section>

    <!-- 4) Application preferences ──────────────────────────── -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-5">
      <h2 class="text-[16px] font-bold text-[var(--brand-text)] leading-tight">Application preferences</h2>
      <p class="text-[13px] text-[var(--brand-text-quiet)] mt-1 mb-4">Choose the platforms through which candidates will be able to apply.</p>

      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-4 p-4 rounded-[12px] border border-[var(--brand-border-fade)] bg-white">
          <span class="w-8 h-8 rounded-md inline-flex items-center justify-center bg-[color-mix(in_srgb,var(--brand-pipeline-blue)_12%,white)] shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--brand-pipeline-blue)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-[14px] font-bold text-[var(--brand-text)]">Apply with LinkedIn</div>
            <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Allow candidates to apply using their LinkedIn profile.</div>
          </div>
          <BrandButton variant="outline">Add integration</BrandButton>
        </div>

        <div class="flex items-center gap-4 p-4 rounded-[12px] border border-[var(--brand-border-fade)] bg-white">
          <span class="w-8 h-8 rounded-md inline-flex items-center justify-center bg-[color-mix(in_srgb,var(--brand-status-approved-text)_14%,white)] shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--brand-status-approved-text)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-[14px] font-bold text-[var(--brand-text)]">Apply with WhatsApp</div>
            <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Allow candidates to apply through WhatsApp.</div>
          </div>
          <BrandButton variant="outline">Add integration</BrandButton>
        </div>
      </div>
    </section>
  </div>
</template>
