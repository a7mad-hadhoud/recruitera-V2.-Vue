<!--
  Post-signup onboarding — a 4-step wizard. Left: the form (logo, progress, the
  step's questions as single-select pills / cards, Back + Continue). Right: a
  branded "Welcome" panel with a rotating testimonial card over the deep-teal +
  R-pattern backdrop. Mock-only: choices are local state; Continue on the last
  step routes into the app. Replace with the real onboarding endpoint when ready.
-->
<script setup lang="ts">
import { ArrowRight, Target, ClipboardList, Building2, Globe, Check } from 'lucide-vue-next'
import { BrandButton, BrandAvatarInitials } from '~/components/brand'
import OnboardingPillGroup from '~/components/onboarding/OnboardingPillGroup.vue'
import OnboardingSelect from '~/components/onboarding/OnboardingSelect.vue'

definePageMeta({ layout: false })
useHead({ title: 'Set up your workspace · Recruitera' })

const TOTAL = 4
const step = ref(1)

const form = reactive({
  company: '',
  website: '',
  language: 'English',
  industry: '',
  size: '',
  role: '',
  recruitment: '',
  usedApp: '',
  startMode: 'sample' as 'sample' | 'empty',
})

const LANGS = ['English', 'Arabic', 'French', 'German'] as const
const SIZES = ['1 - 20', '21 - 50', '51 - 100', '101 - 150', '151 - 250', '251 - 500', '501 - 1000', 'over 1000'] as const
const ROLES = ['Recruiter', 'HR Manager', 'Team Manager', 'Employee', 'Payroll Admin', 'IT Admin', 'Leader', 'External'] as const
const RECRUIT = ['Only me', 'The recruitment team', 'A few teams', "We're a recruitment agency", 'None of these'] as const
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Hospitality', 'Real Estate', 'Marketing & Advertising', 'Consulting', 'Non-profit', 'Other'] as const

const canContinue = computed(() => {
  if (step.value === 1) return form.company.trim().length > 0
  if (step.value === 2) return !!form.language && !!form.industry && !!form.size
  if (step.value === 3) return !!form.role && !!form.recruitment && !!form.usedApp
  return true
})

async function next() {
  if (!canContinue.value) return
  if (step.value < TOTAL) { step.value++; return }
  // TODO: POST onboarding answers once the endpoint exists.
  await navigateTo('/')
}
async function back() {
  if (step.value > 1) { step.value--; return }
  await navigateTo('/auth/signup')
}

// Rotating testimonials (placeholder copy — swap for real quotes when available).
const TESTIMONIALS = [
  { quote: 'Setting up our first hiring pipeline took minutes, not days. Recruitera just made sense from the very first click.', name: 'Nadia Rahman', title: 'Head of Talent, Brightloom', initials: 'NR' },
  { quote: 'We finally have every candidate, note and interview in one place. Our team stopped living in spreadsheets overnight.', name: 'Omar Fahmy', title: 'HR Manager, Northwind', initials: 'OF' },
  { quote: 'The reporting alone paid for itself — I can see exactly where every open role stands at a single glance.', name: 'Lea Schmidt', title: 'Recruitment Lead, Voltaic', initials: 'LS' },
  { quote: 'Onboarding new hiring managers is effortless now. They just get it, with zero training from us.', name: 'Youssef Amin', title: 'People Ops, Cedar & Co', initials: 'YA' },
]
const testimonial = computed(() => TESTIMONIALS[step.value - 1] ?? TESTIMONIALS[0])
</script>

<template>
  <div class="min-h-screen flex bg-[var(--brand-surface-white)]">
    <!-- LEFT — form -->
    <div class="flex-1 flex flex-col overflow-y-auto px-6 sm:px-12 lg:px-16 py-8">
      <!-- header: logo + progress -->
      <header class="flex items-center justify-between gap-4 shrink-0">
        <NuxtLink to="/" class="flex items-center gap-2.5 outline-none">
          <img src="/logo.svg" alt="Recruitera" class="w-9 h-9 rounded-[10px]">
          <span class="font-bold text-[19px] tracking-tight text-[var(--brand-teal)]">Recruitera</span>
        </NuxtLink>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1.5">
            <span
              v-for="i in TOTAL"
              :key="i"
              class="h-[5px] w-9 rounded-full transition-colors"
              :class="i <= step ? 'bg-[var(--brand-teal)]' : 'bg-[var(--brand-border-light)]'"
            />
          </div>
          <span class="text-[13px] text-[var(--brand-text-quiet)] whitespace-nowrap">Step {{ step }} of {{ TOTAL }}</span>
        </div>
      </header>

      <!-- step content -->
      <div class="flex-1 flex flex-col justify-center py-10">
        <div class="w-full max-w-[620px]">
          <!-- Step 1 — company + website -->
          <template v-if="step === 1">
            <h2 class="text-[22px] font-bold text-[var(--brand-text)]">Let's set up your workspace</h2>
            <p class="mt-2 text-[14px] text-[var(--brand-text-quiet)]">Tell us about your company.</p>

            <div class="mt-8 max-w-[480px] space-y-6">
              <label class="block group">
                <span class="mb-2 flex items-center gap-2 text-[14px] font-bold text-[var(--brand-text-secondary)]">
                  Company name <span class="text-[var(--brand-danger)]">*</span>
                </span>
                <div class="relative">
                  <Building2 class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--brand-text-quiet)] transition-colors group-focus-within:text-[var(--brand-teal)]" stroke-width="1.8" />
                  <input
                    v-model="form.company"
                    type="text"
                    placeholder="e.g. Recruitera Inc."
                    class="w-full box-border h-14 rounded-xl border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] pl-12 pr-11 text-[15px] font-medium text-[var(--brand-text)] outline-none transition-all placeholder:font-normal placeholder:text-[var(--brand-text-faint)] hover:border-[var(--brand-border-mid)] focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-lime)]/25"
                  >
                  <span v-if="form.company.trim()" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--brand-teal)] inline-flex items-center justify-center">
                    <Check class="w-3 h-3 text-white" stroke-width="3" />
                  </span>
                </div>
              </label>

              <label class="block group">
                <span class="mb-2 flex items-center gap-1.5 text-[14px] font-bold text-[var(--brand-text-secondary)]">
                  Website <span class="font-medium text-[var(--brand-text-quiet)]">(optional)</span>
                </span>
                <div class="relative">
                  <Globe class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--brand-text-quiet)] transition-colors group-focus-within:text-[var(--brand-teal)]" stroke-width="1.8" />
                  <input
                    v-model="form.website"
                    type="url"
                    placeholder="yourcompany.com"
                    class="w-full box-border h-14 rounded-xl border-[1.5px] border-[var(--brand-border)] bg-[var(--brand-surface-white)] pl-12 pr-4 text-[15px] font-medium text-[var(--brand-text)] outline-none transition-all placeholder:font-normal placeholder:text-[var(--brand-text-faint)] hover:border-[var(--brand-border-mid)] focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-lime)]/25"
                  >
                </div>
              </label>
            </div>
            <p class="mt-6 flex items-center gap-2 text-[13px] text-[var(--brand-text-quiet)]">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-lime-tint)] text-[11px]">💡</span>
              You can rename it anytime in settings.
            </p>
          </template>

          <!-- Step 2 — language + size -->
          <template v-else-if="step === 2">
            <h2 class="text-[22px] font-bold text-[var(--brand-text)]">Choose your language</h2>
            <p class="mt-1 text-[14px] text-[var(--brand-text-quiet)]">Set the default language for your Recruitera account.</p>
            <OnboardingPillGroup v-model="form.language" :options="LANGS" class="mt-6" />
            <p class="mt-4 text-[13.5px] text-[var(--brand-text-quiet)]">💡 You can change the app language in your settings later.</p>

            <h2 class="mt-10 text-[22px] font-bold text-[var(--brand-text)]">What is your company's industry?</h2>
            <p class="mt-1 text-[14px] text-[var(--brand-text-quiet)]">This helps us tailor your workspace.</p>
            <OnboardingSelect v-model="form.industry" :options="INDUSTRIES" placeholder="Select your industry" class="mt-6 block" />

            <h2 class="mt-10 text-[22px] font-bold text-[var(--brand-text)]">How big is your company?</h2>
            <p class="mt-1 text-[14px] text-[var(--brand-text-quiet)]">Select the number of employees.</p>
            <OnboardingPillGroup v-model="form.size" :options="SIZES" class="mt-6" />
          </template>

          <!-- Step 3 — role + recruitment + used app -->
          <template v-else-if="step === 3">
            <h2 class="text-[22px] font-bold text-[var(--brand-text)]">What's your role?</h2>
            <OnboardingPillGroup v-model="form.role" :options="ROLES" class="mt-4" />

            <h2 class="mt-8 text-[22px] font-bold text-[var(--brand-text)]">Who's responsible for recruitment?</h2>
            <OnboardingPillGroup v-model="form.recruitment" :options="RECRUIT" class="mt-4" />

            <h2 class="mt-8 text-[22px] font-bold text-[var(--brand-text)]">Have you used an HR app before?</h2>
            <OnboardingPillGroup v-model="form.usedApp" :options="['Yes', 'No']" class="mt-4" />
          </template>

          <!-- Step 4 — sample data -->
          <template v-else>
            <h2 class="text-[22px] font-bold text-[var(--brand-text)]">One last step…</h2>
            <p class="mt-1 text-[14px] text-[var(--brand-text-quiet)]">We suggest playing with sample data to get started.</p>
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[620px]">
              <button
                type="button"
                class="text-left rounded-2xl border p-6 outline-none cursor-pointer transition-colors"
                :class="form.startMode === 'sample' ? 'border-[1.5px] border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]' : 'border-[var(--brand-border)] hover:border-[var(--brand-border-mid)]'"
                @click="form.startMode = 'sample'"
              >
                <div class="flex items-center justify-between">
                  <Target class="w-6 h-6 text-[var(--brand-teal)]" stroke-width="1.9" />
                  <span class="text-[11px] font-bold tracking-[0.04em] text-[var(--brand-olive)] bg-[var(--brand-lime-active-bg)] rounded-full px-2.5 py-1">RECOMMENDED</span>
                </div>
                <div class="mt-4 text-[16px] font-bold text-[var(--brand-text)]">Use sample data</div>
                <p class="mt-1.5 text-[13.5px] leading-[1.5] text-[var(--brand-text-quiet)]">Try sample data and see how everything works in your account.</p>
              </button>
              <button
                type="button"
                class="text-left rounded-2xl border p-6 outline-none cursor-pointer transition-colors"
                :class="form.startMode === 'empty' ? 'border-[1.5px] border-[var(--brand-teal)] bg-[var(--brand-lime-tint)]' : 'border-[var(--brand-border)] hover:border-[var(--brand-border-mid)]'"
                @click="form.startMode = 'empty'"
              >
                <ClipboardList class="w-6 h-6 text-[var(--brand-teal)]" stroke-width="1.9" />
                <div class="mt-4 text-[16px] font-bold text-[var(--brand-text)]">Explore without data</div>
                <p class="mt-1.5 text-[13.5px] leading-[1.5] text-[var(--brand-text-quiet)]">Start with an empty account and add your own information.</p>
              </button>
            </div>
          </template>

          <!-- nav -->
          <div class="mt-12 flex items-center gap-4">
            <BrandButton variant="outline" size="lg" class="px-6" @click="back">Back</BrandButton>
            <BrandButton
              variant="primary-teal"
              size="lg"
              :disabled="!canContinue"
              class="min-w-[240px] justify-between px-6"
              @click="next"
            >
              <span>{{ step < TOTAL ? 'Continue' : 'Get started' }}</span>
              <ArrowRight class="w-4 h-4" stroke-width="2.2" />
            </BrandButton>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT — welcome / testimonial panel (floating, large-radius curve) -->
    <div class="hidden lg:flex w-[44%] max-w-[640px] shrink-0 p-4">
      <div class="relative w-full overflow-hidden rounded-[32px] bg-[var(--brand-teal)]">
        <!-- R pattern + glow texture -->
        <div
          class="pointer-events-none absolute inset-0"
          style="background-image: url('/Frame 427320920.svg');
            background-repeat: repeat; background-size: 520px auto; background-position: right top;
            opacity: 0.16; filter: blur(0.5px);"
        />
        <div
          class="pointer-events-none absolute inset-0"
          style="background: radial-gradient(70% 50% at 100% 0%, rgba(201,253,19,0.12), transparent 60%), radial-gradient(80% 60% at 0% 100%, rgba(18,114,149,0.28), transparent 65%);"
        />

        <div class="relative flex flex-col h-full w-full p-12">
          <h1 class="text-[30px] font-extrabold text-white tracking-[-0.01em]">👋 Welcome to Recruitera!</h1>

          <div class="mt-auto pt-16">
            <div class="relative rounded-2xl bg-white/[0.07] border border-white/10 p-8 overflow-hidden">
              <p class="text-[22px] leading-[1.45] font-medium text-white/95">{{ testimonial.quote }}</p>
              <div class="mt-6 flex items-center gap-4">
                <BrandAvatarInitials :initials="testimonial.initials" size="lg" />
                <div>
                  <div class="text-[15px] font-bold text-white">{{ testimonial.name }}</div>
                  <div class="text-[13px] text-white/70">{{ testimonial.title }}</div>
                </div>
              </div>
              <span class="pointer-events-none absolute -bottom-6 right-6 text-[150px] leading-none font-serif text-[var(--brand-lime)]/50 select-none">”</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
