<script setup lang="ts">
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Gem,
  Globe,
  IdCard,
  Image as ImageIcon,
  Inbox,
  LayoutTemplate,
  Lock,
  MapPin,
  MessageSquare,
  Monitor,
  Palette,
  Play,
  Quote,
  Smartphone,
  Target,
  Upload,
  Youtube,
} from 'lucide-vue-next'
import { Switch } from '~/components/ui/switch'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

definePageMeta({ layout: 'settings' })

// ─────────────── Toggles ───────────────
const generalApplicationOn = ref(false)
const forEmployeesOn = ref(true)
const publishedOn = ref(true)
const liveOn = ref(true)

// ─────────────── Accordions ───────────────
type AccordionKey = 'branding' | 'hero' | 'video' | 'values' | 'testimonials' | 'employees' | 'publish'
const openAccordions = reactive<Record<AccordionKey, boolean>>({
  branding: true,
  hero: false,
  video: false,
  values: false,
  testimonials: false,
  employees: false,
  publish: false,
})
function toggleAccordion(key: AccordionKey) {
  openAccordions[key] = !openAccordions[key]
}

const SECTIONS: { key: AccordionKey, label: string, icon: any }[] = [
  { key: 'branding', label: 'Branding', icon: Palette },
  { key: 'hero', label: 'Hero', icon: LayoutTemplate },
  { key: 'video', label: 'Culture video', icon: Youtube },
  { key: 'values', label: 'Values', icon: Gem },
  { key: 'testimonials', label: 'Testimonials', icon: Quote },
  { key: 'employees', label: 'For Employees', icon: IdCard },
  { key: 'publish', label: 'Publish & URL', icon: Globe },
]

// ─────────────── Colors ───────────────
const primaryColor = ref('#4d7c0f')
const headerColor = ref('#0f172a')
const btnColor = ref('#4d7c0f')
const ctaColor = ref('#4d7c0f')

function onPrimaryChange(v: string) {
  primaryColor.value = v
  ctaColor.value = v
}
function onBtnChange(v: string) {
  btnColor.value = v
  ctaColor.value = v
}
function hexInput(v: string, setter: (v: string) => void) {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) setter(v)
}

const FONTS = ['Geist', 'Inter', 'Lato', 'Manrope', 'DM Sans', 'Plus Jakarta Sans']
const font = ref('Geist')

// ─────────────── Hero copy ───────────────
const headline = ref('Build the future of hiring with us')
const intro = ref('We help teams hire better and faster. Join a team that values craft, ownership, and candor — and do the best work of your career.')

// ─────────────── Culture video ───────────────
const videoUrl = ref('')

// ─────────────── Values ───────────────
interface ValueItem { icon: number, name: string, desc: string }
const VALUE_ICONS = [Target, Gem, MessageSquare, Palette, Globe, IdCard, Youtube, Quote]
const values = ref<ValueItem[]>([
  { icon: 0, name: 'Ownership', desc: 'We take end-to-end ownership of outcomes, not tasks.' },
  { icon: 1, name: 'Craft', desc: 'We sweat the details and ship work we are proud of.' },
  { icon: 2, name: 'Candor', desc: 'We speak honestly and assume good intent from each other.' },
])
function addValue() {
  if (values.value.length < 6) values.value.push({ icon: 0, name: '', desc: '' })
}
function removeValue(i: number) {
  values.value.splice(i, 1)
}

// ─────────────── Testimonials ───────────────
interface TestimonialItem { name: string, role: string, quote: string }
const testimonials = ref<TestimonialItem[]>([
  { name: 'Mariam Adel', role: 'Senior Engineer', quote: 'The best team I have worked with — real autonomy and real impact from day one.' },
  { name: 'Omar Khaled', role: 'Product Designer', quote: 'Culture of craft is not a slogan here. It shows up in every review and ship.' },
])
function addTestimonial() {
  if (testimonials.value.length < 5) testimonials.value.push({ name: '', role: '', quote: '' })
}
function removeTestimonial(i: number) {
  testimonials.value.splice(i, 1)
}
function initials(name: string) {
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?'
}

// ─────────────── Employees domain ───────────────
const employeeDomain = ref('acme.co')

// ─────────────── Publish & URL ───────────────
const subdomain = ref('acme')
const previewDomain = computed(() => `${subdomain.value}.recruitera.ai`)

const copied = ref(false)
async function copyLink() {
  try { await navigator.clipboard.writeText(`https://${previewDomain.value}`) } catch {}
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const saved = ref(false)
function saveChanges() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 1800)
}

// ─────────────── Preview device ───────────────
const previewMode = ref<'desktop' | 'mobile'>('desktop')

// ─────────────── Jobs (preview mockup content) ───────────────
interface JobItem { title: string, type: 'white' | 'blue', desc: string, location: string, posted: string, employment: string }
const JOBS: JobItem[] = [
  { title: 'Senior Frontend Engineer', type: 'white', desc: 'Own the candidate-facing experience end to end with Vue and TypeScript.', location: 'Cairo, EG', posted: '2d ago', employment: 'Full-time' },
  { title: 'Product Designer', type: 'white', desc: 'Shape flows and design systems across the hiring product.', location: 'Remote', posted: '5d ago', employment: 'Full-time' },
  { title: 'Warehouse Operative', type: 'blue', desc: 'Join our logistics team keeping fulfilment fast and accurate.', location: '6th of October, EG', posted: '1d ago', employment: 'Shift Based' },
  { title: 'Data Scientist', type: 'white', desc: 'Turn hiring data into models that help teams decide faster.', location: 'Cairo, EG', posted: '8d ago', employment: 'Full-time' },
  { title: 'Customer Support Specialist', type: 'white', desc: 'Be the friendly, sharp first line for our customers.', location: 'Remote', posted: '3d ago', employment: 'Full-time' },
  { title: 'Field Technician', type: 'blue', desc: 'Install and maintain equipment on client sites across Greater Cairo.', location: 'Giza, EG', posted: '6d ago', employment: 'Shift Based' },
]
const jobFilter = ref<'all' | 'white' | 'blue'>('all')
const filteredJobs = computed(() => jobFilter.value === 'all' ? JOBS : JOBS.filter(j => j.type === jobFilter.value))

// ─────────────── Preview computed styles ───────────────
const heroBackground = computed(() => `linear-gradient(135deg, ${primaryColor.value} 0%, ${headerColor.value} 130%)`)
const videoBackground = computed(() => `linear-gradient(135deg, ${headerColor.value}, ${primaryColor.value})`)
const previewWidth = computed(() => (previewMode.value === 'desktop' ? '1200px' : '390px'))
const jobsGridClass = computed(() => (previewMode.value === 'desktop' ? 'grid-cols-3' : 'grid-cols-1'))
const valuesGridClass = computed(() => (previewMode.value === 'desktop' ? 'grid-cols-3' : 'grid-cols-1'))
const testimonialsGridClass = computed(() => (previewMode.value === 'desktop' ? 'grid-cols-2' : 'grid-cols-1'))
</script>

<template>
  <div style="margin:-32px -40px;height:calc(100% + 64px);overflow:hidden;display:flex" class="bg-[var(--brand-canvas)]">
    <!-- LEFT SETTINGS PANEL -->
    <div class="w-[340px] shrink-0 flex flex-col border-r border-[var(--brand-border-light)] bg-[var(--brand-surface-white)]">
      <div class="shrink-0 px-5 pt-[22px] pb-4 border-b border-[var(--brand-border-light)]">
        <div class="text-[20px] font-extrabold text-[var(--brand-text)] tracking-tight mb-3.5">Career Site</div>
        <div class="flex gap-2">
          <a
            :href="`https://${previewDomain}`"
            target="_blank"
            rel="noopener"
            class="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[13.5px] font-semibold text-[var(--brand-text)] no-underline hover:bg-[var(--brand-lime-tint)] transition-colors"
          >
            <ExternalLink :size="13" :stroke-width="1.9" />
            Visit site
          </a>
          <button
            type="button"
            class="flex-1 inline-flex items-center justify-center px-3.5 py-2.5 rounded-[10px] text-[13.5px] font-bold text-white transition-colors"
            :class="saved ? 'bg-emerald-600' : 'bg-[var(--brand-teal)] hover:opacity-90'"
            @click="saveChanges"
          >
            {{ saved ? '✓ Saved!' : 'Save changes' }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-2 overscroll-contain">
        <!-- General application -->
        <div class="rounded-xl border border-[var(--brand-border-light)] p-3.5">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Inbox class="w-[15px] h-[15px] text-[var(--brand-icon-default)] shrink-0" />
              <span class="text-[14px] font-bold text-[var(--brand-text)]">General application</span>
            </div>
            <Switch v-model="generalApplicationOn" class="shrink-0 data-[state=checked]:bg-[var(--brand-teal)]" />
          </div>
          <div class="text-[12.5px] text-[var(--brand-text-quiet)] leading-[1.5] mt-1.5 pl-[23px]">Show a CTA that routes open applications to a pinned Talent Pool.</div>
        </div>

        <!-- Accordions -->
        <div v-for="s in SECTIONS" :key="s.key" class="rounded-xl border border-[var(--brand-border-light)] overflow-hidden">
          <button
            type="button"
            class="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-[var(--brand-lime-tint)]"
            @click="toggleAccordion(s.key)"
          >
            <component :is="s.icon" class="w-[15px] h-[15px] text-[var(--brand-icon-default)] shrink-0" />
            <span class="flex-1 text-[14px] font-bold text-[var(--brand-text)]">{{ s.label }}</span>
            <ChevronDown class="w-[14px] h-[14px] text-[var(--brand-icon-muted)] shrink-0 transition-transform" :class="{ 'rotate-180': openAccordions[s.key] }" />
          </button>

          <!-- Branding -->
          <div v-if="s.key === 'branding'" v-show="openAccordions.branding" class="space-y-4 border-t border-[var(--brand-border-fade)] px-3.5 py-4">
            <div class="flex gap-4">
              <div class="space-y-1.5">
                <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">Logo</div>
                <label class="group relative grid size-16 cursor-pointer place-items-center overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-canvas)] transition-colors hover:border-[var(--brand-teal)]/60">
                  <ImageIcon class="w-[20px] h-[20px] text-[var(--brand-icon-muted)]" />
                  <div class="absolute inset-0 grid place-items-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload class="w-[16px] h-[16px] text-white" />
                  </div>
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml" class="sr-only">
                </label>
              </div>
              <div class="flex-1 space-y-1.5">
                <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">Cover image <span class="text-[var(--brand-text-faint)] font-normal">(4:1)</span></div>
                <label class="group relative flex h-16 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-canvas)] transition-colors hover:border-[var(--brand-teal)]/60">
                  <Upload class="w-[15px] h-[15px] text-[var(--brand-icon-muted)]" />
                  <span class="text-[13px] text-[var(--brand-text-muted)]">Upload cover</span>
                  <div class="absolute inset-0 grid place-items-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload class="w-[16px] h-[16px] text-white" />
                  </div>
                  <input type="file" accept="image/png,image/jpeg" class="sr-only">
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-[13px] text-[var(--brand-text)]">Primary color</span>
              <div class="flex items-center gap-2">
                <input type="color" :value="primaryColor" class="size-8 cursor-pointer rounded border border-[var(--brand-border)]" @input="onPrimaryChange(($event.target as HTMLInputElement).value)">
                <Input :model-value="primaryColor" maxlength="7" class="h-8 w-24 font-mono text-xs" @update:model-value="v => hexInput(String(v), onPrimaryChange)" />
              </div>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="text-[13px] text-[var(--brand-text)]">Header / text color</span>
              <div class="flex items-center gap-2">
                <input type="color" :value="headerColor" class="size-8 cursor-pointer rounded border border-[var(--brand-border)]" @input="headerColor = ($event.target as HTMLInputElement).value">
                <Input :model-value="headerColor" maxlength="7" class="h-8 w-24 font-mono text-xs" @update:model-value="v => hexInput(String(v), (nv) => headerColor = nv)" />
              </div>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="text-[13px] text-[var(--brand-text)]">Buttons color</span>
              <div class="flex items-center gap-2">
                <input type="color" :value="btnColor" class="size-8 cursor-pointer rounded border border-[var(--brand-border)]" @input="onBtnChange(($event.target as HTMLInputElement).value)">
                <Input :model-value="btnColor" maxlength="7" class="h-8 w-24 font-mono text-xs" @update:model-value="v => hexInput(String(v), onBtnChange)" />
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">Font</div>
              <Select v-model="font">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="f in FONTS" :key="f" :value="f">{{ f }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Hero -->
          <div v-else-if="s.key === 'hero'" v-show="openAccordions.hero" class="space-y-4 border-t border-[var(--brand-border-fade)] px-3.5 py-4">
            <div class="space-y-1.5">
              <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">Headline</div>
              <Input v-model="headline" type="text" class="w-full" />
            </div>
            <div class="space-y-1.5">
              <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">Intro copy</div>
              <textarea v-model="intro" rows="4" class="w-full box-border resize-y rounded-[9px] border-[1.5px] border-[var(--brand-border)] px-3 py-2.5 text-[14px] text-[var(--brand-text)] leading-[1.6] outline-none focus:border-[var(--brand-teal)] transition-colors" />
            </div>
          </div>

          <!-- Culture video -->
          <div v-else-if="s.key === 'video'" v-show="openAccordions.video" class="space-y-2 border-t border-[var(--brand-border-fade)] px-3.5 py-4">
            <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">YouTube URL</div>
            <Input v-model="videoUrl" type="text" placeholder="https://youtube.com/watch?v=…" class="w-full" />
            <div class="text-[12px] text-[var(--brand-text-quiet)]">Shown as a culture video on the homepage.</div>
          </div>

          <!-- Values -->
          <div v-else-if="s.key === 'values'" v-show="openAccordions.values" class="space-y-3 border-t border-[var(--brand-border-fade)] px-3.5 py-4">
            <div v-for="(v, i) in values" :key="i" class="rounded-[10px] border border-[var(--brand-border-light)] p-3.5 space-y-2">
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="(Ic, idx) in VALUE_ICONS" :key="idx"
                  type="button"
                  class="grid size-8 place-items-center rounded-lg border transition-colors"
                  :class="idx === v.icon ? 'border-[var(--brand-text)] bg-[var(--brand-lime-tint)]' : 'border-[var(--brand-border-light)] hover:border-[var(--brand-border)]'"
                  @click="v.icon = idx"
                >
                  <component :is="Ic" class="w-[15px] h-[15px] text-[var(--brand-text)]" />
                </button>
              </div>
              <Input v-model="v.name" type="text" placeholder="Value name" class="w-full" />
              <textarea v-model="v.desc" rows="2" placeholder="Description" class="w-full box-border resize-none rounded-[9px] border-[1.5px] border-[var(--brand-border)] px-3 py-2 text-[13.5px] text-[var(--brand-text)] leading-[1.5] outline-none focus:border-[var(--brand-teal)] transition-colors" />
              <button type="button" class="text-[13px] font-semibold text-[var(--brand-settings-danger)]" @click="removeValue(i)">Remove</button>
            </div>
            <button v-if="values.length < 6" type="button" class="w-full py-2.5 rounded-[10px] border-[1.5px] border-dashed border-[var(--brand-border)] text-[13.5px] text-[var(--brand-text-muted)] hover:border-[var(--brand-teal)] transition-colors" @click="addValue">+ Add value ({{ values.length }}/6)</button>
          </div>

          <!-- Testimonials -->
          <div v-else-if="s.key === 'testimonials'" v-show="openAccordions.testimonials" class="space-y-3 border-t border-[var(--brand-border-fade)] px-3.5 py-4">
            <div v-for="(t, i) in testimonials" :key="i" class="rounded-[10px] border border-[var(--brand-border-light)] p-3.5 space-y-2">
              <div class="flex items-center gap-2.5">
                <div class="grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white" :style="{ background: primaryColor }">{{ initials(t.name) }}</div>
                <Input v-model="t.name" type="text" placeholder="Name" class="flex-1" />
              </div>
              <Input v-model="t.role" type="text" placeholder="Job title" class="w-full" />
              <textarea v-model="t.quote" rows="3" placeholder="Quote" class="w-full box-border resize-none rounded-[9px] border-[1.5px] border-[var(--brand-border)] px-3 py-2 text-[13.5px] text-[var(--brand-text)] leading-[1.5] outline-none focus:border-[var(--brand-teal)] transition-colors" />
              <button type="button" class="text-[13px] font-semibold text-[var(--brand-settings-danger)]" @click="removeTestimonial(i)">Remove</button>
            </div>
            <button v-if="testimonials.length < 5" type="button" class="w-full py-2.5 rounded-[10px] border-[1.5px] border-dashed border-[var(--brand-border)] text-[13.5px] text-[var(--brand-text-muted)] hover:border-[var(--brand-teal)] transition-colors" @click="addTestimonial">+ Add testimonial ({{ testimonials.length }}/5)</button>
          </div>

          <!-- For Employees -->
          <div v-else-if="s.key === 'employees'" v-show="openAccordions.employees" class="space-y-4 border-t border-[var(--brand-border-fade)] px-3.5 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="text-[13.5px] font-semibold text-[var(--brand-text)] mb-0.5">Enable "For Employees"</div>
                <div class="text-[12.5px] text-[var(--brand-text-quiet)]">Internal jobs via company-email magic link.</div>
              </div>
              <Switch v-model="forEmployeesOn" class="shrink-0 mt-0.5 data-[state=checked]:bg-[var(--brand-teal)]" />
            </div>
            <div class="space-y-1.5">
              <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">Company email domain</div>
              <div class="flex items-center rounded-[9px] border-[1.5px] border-[var(--brand-border)] overflow-hidden bg-[var(--brand-surface-white)] focus-within:border-[var(--brand-teal)] transition-colors">
                <span class="pl-3 pr-1 text-[14px] text-[var(--brand-text-muted)]">@</span>
                <input v-model="employeeDomain" type="text" class="flex-1 border-none outline-none text-[14px] text-[var(--brand-text)] py-2.5 pr-3 bg-transparent">
              </div>
            </div>
          </div>

          <!-- Publish & URL -->
          <div v-else-if="s.key === 'publish'" v-show="openAccordions.publish" class="space-y-4 border-t border-[var(--brand-border-fade)] px-3.5 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="text-[13.5px] font-semibold text-[var(--brand-text)] mb-0.5">Published</div>
                <div class="text-[12.5px] text-[var(--brand-text-quiet)]">Live and publicly accessible.</div>
              </div>
              <Switch v-model="publishedOn" class="shrink-0 mt-0.5 data-[state=checked]:bg-[var(--brand-teal)]" />
            </div>
            <div class="space-y-1.5">
              <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">Subdomain</div>
              <div class="flex items-center rounded-[9px] border-[1.5px] border-[var(--brand-border)] overflow-hidden bg-[var(--brand-surface-white)] focus-within:border-[var(--brand-teal)] transition-colors">
                <input v-model="subdomain" type="text" class="flex-1 border-none outline-none text-[14px] text-[var(--brand-text)] px-3 py-2.5 bg-transparent">
                <span class="px-3 py-2.5 text-[14px] text-[var(--brand-text-muted)] bg-[var(--brand-canvas)] border-l-[1.5px] border-[var(--brand-border)] whitespace-nowrap">.recruitera.ai</span>
              </div>
            </div>
            <button type="button" class="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[13.5px] font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)] transition-colors" @click="copyLink">
              <Check v-if="copied" :size="14" :stroke-width="1.8" />
              <Copy v-else :size="14" :stroke-width="1.8" />
              {{ copied ? 'Copied!' : 'Copy link' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT PREVIEW PANEL -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0 bg-[var(--brand-canvas)]">
      <div class="shrink-0 px-5 py-2.5 bg-[var(--brand-surface-white)] border-b border-[var(--brand-border-light)] flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[12.5px] font-bold px-2.5 py-1 rounded-full">
          <span class="w-[7px] h-[7px] rounded-full bg-emerald-500 shrink-0" />Published
        </span>
        <Globe class="w-[14px] h-[14px] text-[var(--brand-icon-muted)] shrink-0" />
        <span class="text-[13px] text-[var(--brand-text)] font-semibold">{{ previewDomain }}</span>
        <Copy class="cursor-pointer shrink-0 w-[13px] h-[13px] text-[var(--brand-icon-muted)]" @click="copyLink" />
        <span class="flex-1" />
        <span class="text-[13px] text-[var(--brand-text)] font-semibold mr-1.5">Live</span>
        <Switch v-model="liveOn" class="shrink-0 data-[state=checked]:bg-[var(--brand-teal)]" />
      </div>
      <div class="shrink-0 px-5 py-2 bg-[var(--brand-surface-white)] border-b border-[var(--brand-border-light)] flex items-center gap-2.5">
        <Lock class="w-[13px] h-[13px] text-[var(--brand-icon-muted)] shrink-0" />
        <span class="flex-1 text-[13px] text-[var(--brand-text-secondary)]">{{ previewDomain }}</span>
        <div class="flex gap-0.5 bg-[var(--brand-canvas)] border border-[var(--brand-border-light)] rounded-lg p-0.5">
          <button
            type="button"
            class="px-2.5 py-1 rounded-md flex items-center transition-colors"
            :class="previewMode === 'desktop' ? 'bg-[var(--brand-surface-white)] shadow-sm text-[var(--brand-text)]' : 'text-[var(--brand-icon-muted)]'"
            @click="previewMode = 'desktop'"
          >
            <Monitor :size="14" :stroke-width="1.8" />
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-md flex items-center transition-colors"
            :class="previewMode === 'mobile' ? 'bg-[var(--brand-surface-white)] shadow-sm text-[var(--brand-text)]' : 'text-[var(--brand-icon-muted)]'"
            @click="previewMode = 'mobile'"
          >
            <Smartphone :size="14" :stroke-width="1.8" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto flex justify-center items-start p-5">
        <div
          class="bg-white rounded-[10px] shadow-2xl overflow-hidden transition-[width] duration-300"
          :style="{ width: previewWidth, maxWidth: '100%' }"
        >
          <div class="bg-[var(--brand-preview-chrome-bg)] border-b border-black/5 px-3.5 py-2.5 flex items-center gap-2">
            <span class="size-3 rounded-full bg-[var(--brand-preview-dot-red)] inline-block shrink-0" />
            <span class="size-3 rounded-full bg-[var(--brand-preview-dot-yellow)] inline-block shrink-0" />
            <span class="size-3 rounded-full bg-[var(--brand-preview-dot-green)] inline-block shrink-0" />
            <span class="flex-1 bg-white rounded-md px-3 py-1 text-[11.5px] text-[var(--brand-preview-text-secondary)] ml-1.5">{{ previewDomain }}</span>
          </div>

          <div :style="{ fontFamily: `${font}, system-ui, sans-serif` }">
            <!-- Header -->
            <header class="flex items-center justify-between border-b border-black/5 px-6 py-3.5">
              <div class="flex items-center gap-2.5">
                <div class="grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white" :style="{ background: primaryColor }">AT</div>
                <span class="text-[15px] font-semibold" :style="{ color: headerColor }">Acme Talent</span>
              </div>
              <nav class="flex items-center gap-6 text-[13px] font-medium">
                <span class="text-[var(--brand-preview-text-heading)]">Home</span>
                <span :style="{ color: primaryColor }">Opportunities</span>
                <span v-if="forEmployeesOn" class="rounded-lg border px-3 py-1.5" :style="{ color: primaryColor, borderColor: primaryColor }">For Employees</span>
              </nav>
            </header>

            <!-- Hero -->
            <section class="relative flex flex-col items-start justify-center gap-4 overflow-hidden px-6" style="padding-top:56px;padding-bottom:56px;min-height:300px" :style="{ background: heroBackground }">
              <span class="bg-white/15 backdrop-blur text-white text-[11.5px] font-semibold px-3 py-1 rounded-full">We're hiring · {{ JOBS.length }} open roles</span>
              <h1 class="font-extrabold text-white leading-[1.18] max-w-[560px]" style="font-size:34px">{{ headline }}</h1>
              <p class="text-white/85 max-w-[440px] leading-[1.7]" style="font-size:14px">{{ intro }}</p>
              <button type="button" class="text-white rounded-xl px-5 py-2.5 text-[13.5px] font-bold shadow-lg" :style="{ background: ctaColor }">View open roles →</button>
            </section>

            <!-- Opportunities -->
            <section class="px-6 py-8">
              <div class="flex items-baseline justify-between mb-1">
                <div class="font-extrabold text-[var(--brand-preview-text-heading)]" style="font-size:22px">Opportunities</div>
                <span class="text-[12.5px] font-semibold cursor-pointer" :style="{ color: primaryColor }">View all →</span>
              </div>
              <div class="text-[12px] text-[var(--brand-preview-text-muted)] mb-3.5">Found {{ filteredJobs.length }} open positions</div>
              <div class="flex flex-wrap items-center gap-2 mb-4">
                <span class="text-[12px] text-[var(--brand-preview-text-secondary)] mr-0.5">Job type:</span>
                <button
                  type="button"
                  class="rounded-full px-3 py-1 text-[12px] font-bold transition-colors"
                  :class="jobFilter === 'all' ? 'text-white' : 'border border-[var(--brand-preview-border)] text-[var(--brand-preview-text-label)]'"
                  :style="jobFilter === 'all' ? { background: primaryColor } : {}"
                  @click="jobFilter = 'all'"
                >All</button>
                <button
                  type="button"
                  class="rounded-full px-3 py-1 text-[12px] font-bold transition-colors"
                  :class="jobFilter === 'white' ? 'text-white' : 'border border-[var(--brand-preview-border)] text-[var(--brand-preview-text-label)]'"
                  :style="jobFilter === 'white' ? { background: primaryColor } : {}"
                  @click="jobFilter = 'white'"
                >White Collar</button>
                <button
                  type="button"
                  class="rounded-full px-3 py-1 text-[12px] font-bold transition-colors"
                  :class="jobFilter === 'blue' ? 'text-white' : 'border border-[var(--brand-preview-border)] text-[var(--brand-preview-text-label)]'"
                  :style="jobFilter === 'blue' ? { background: primaryColor } : {}"
                  @click="jobFilter = 'blue'"
                >Blue Collar</button>
                <span class="ml-1 flex items-center gap-1 rounded-full border border-[var(--brand-preview-border)] px-3 py-1 text-[12px] text-[var(--brand-preview-text-label)]">
                  Employment type
                  <ChevronDown class="w-[12px] h-[12px]" />
                </span>
              </div>
              <div class="grid gap-3" :class="jobsGridClass">
                <div v-for="j in filteredJobs" :key="j.title" class="rounded-2xl border border-[var(--brand-preview-border-card)] p-3.5" :style="{ boxShadow: `0 1px 3px var(--brand-preview-card-shadow)` }">
                  <div class="flex gap-1.5 mb-2">
                    <span class="rounded-md px-2 py-0.5 text-[10.5px] font-bold" :style="{ background: `${primaryColor}18`, color: primaryColor }">{{ j.employment }}</span>
                    <span class="rounded-md px-2 py-0.5 text-[10.5px] font-bold bg-[var(--brand-preview-surface-alt)] text-[var(--brand-preview-text-label)]">{{ j.type === 'white' ? 'White Collar' : 'Blue Collar' }}</span>
                  </div>
                  <div class="text-[14px] font-semibold text-[var(--brand-preview-text-heading)] mb-1">{{ j.title }}</div>
                  <div class="text-[12px] text-[var(--brand-preview-text-secondary)] leading-[1.5] mb-2 line-clamp-2">{{ j.desc }}</div>
                  <div class="flex items-center gap-3 text-[11.5px] text-[var(--brand-preview-text-muted)] border-t border-[var(--brand-preview-surface-alt)] pt-2">
                    <span class="inline-flex items-center gap-1"><MapPin class="w-[11px] h-[11px]" />{{ j.location }}</span>
                    <span class="inline-flex items-center gap-1"><Clock class="w-[11px] h-[11px]" />{{ j.posted }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Culture video -->
            <section class="px-6 pb-8">
              <div class="font-extrabold text-[var(--brand-preview-text-heading)] mb-3" style="font-size:22px">Life at Acme Talent</div>
              <div class="relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl" :style="{ background: videoBackground }">
                <div class="grid size-14 place-items-center rounded-full bg-white/90 shadow-xl">
                  <Play class="w-[22px] h-[22px] text-[var(--brand-preview-text-heading)] fill-current" />
                </div>
                <span v-if="!videoUrl" class="absolute bottom-3 left-3 text-[12px] text-white/80">Add a YouTube URL to embed your culture video</span>
              </div>
            </section>

            <!-- Values -->
            <section class="px-6 py-8" style="background:var(--brand-preview-surface-section)">
              <div class="text-center font-extrabold text-[var(--brand-preview-text-heading)] mb-5" style="font-size:22px">What we stand for</div>
              <div class="grid gap-3.5" :class="valuesGridClass">
                <div v-for="(v, i) in values" :key="i" class="rounded-2xl border border-[var(--brand-preview-border-card)] bg-white p-4">
                  <div class="grid size-10 place-items-center rounded-xl mb-2.5" :style="{ background: `${primaryColor}18` }">
                    <component :is="VALUE_ICONS[v.icon]" class="w-[18px] h-[18px]" :style="{ color: primaryColor }" />
                  </div>
                  <div class="text-[15px] font-semibold text-[var(--brand-preview-text-heading)] mb-1">{{ v.name || 'Value name' }}</div>
                  <div class="text-[13px] text-[var(--brand-preview-text-secondary)] leading-[1.5]">{{ v.desc || 'Description' }}</div>
                </div>
              </div>
            </section>

            <!-- Testimonials -->
            <section class="px-6 py-8">
              <div class="font-extrabold text-[var(--brand-preview-text-heading)] mb-5" style="font-size:22px">From the team</div>
              <div class="grid gap-3.5" :class="testimonialsGridClass">
                <figure v-for="(t, i) in testimonials" :key="i" class="rounded-2xl border border-[var(--brand-preview-border-card)] bg-white p-4">
                  <Quote class="w-[16px] h-[16px] mb-2" :style="{ color: primaryColor }" />
                  <blockquote class="text-[13.5px] text-[var(--brand-preview-text-body)] leading-[1.6] mb-3">"{{ t.quote || 'Quote' }}"</blockquote>
                  <figcaption class="flex items-center gap-2.5">
                    <div class="grid size-9 place-items-center rounded-full text-[12px] font-semibold text-white" :style="{ background: primaryColor }">{{ initials(t.name) }}</div>
                    <div>
                      <div class="text-[13px] font-semibold text-[var(--brand-preview-text-heading)]">{{ t.name || 'Name' }}</div>
                      <div class="text-[11.5px] text-[var(--brand-preview-text-muted)]">{{ t.role || 'Role' }}</div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            </section>

            <!-- Employees CTA -->
            <section v-if="forEmployeesOn" class="px-6 pb-8">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl p-5" :style="{ background: headerColor }">
                <div>
                  <div class="text-[15px] font-semibold text-white">Already part of the team?</div>
                  <div class="text-[12.5px] text-white/70">Access internal-only roles with your <strong>@{{ employeeDomain }}</strong> email.</div>
                </div>
                <button type="button" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold shrink-0" :style="{ color: headerColor }">For Employees →</button>
              </div>
            </section>

            <!-- Footer -->
            <footer class="border-t border-black/5 px-6 py-5 text-center">
              <div class="text-[13px] font-medium" :style="{ color: headerColor }">Acme Talent</div>
              <div class="text-[11.5px] text-[var(--brand-preview-text-muted)]">{{ previewDomain }} · © 2026 · Powered by Recruitera</div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
