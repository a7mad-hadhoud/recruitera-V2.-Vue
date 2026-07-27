<!--
  Activate account — shown right after signup, before onboarding. Left: "check
  your email" message + resend + a Continue action (mock: no real email is sent,
  so Continue proceeds to onboarding). Right: a branded floating-curve panel
  introducing the Recruitera platform modules. Language selector top-right.
-->
<script setup lang="ts">
import { ArrowRight, Check, ChevronDown, Users, HeartHandshake } from 'lucide-vue-next'
import { BrandButton } from '~/components/brand'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

definePageMeta({ layout: false })
useHead({ title: 'Activate your account · Recruitera' })

const route = useRoute()
const email = computed(() => (route.query.email as string) || 'your email')

const resent = ref(false)
function resend() { resent.value = true }

const LANGS = ['English', 'Arabic', 'French', 'German'] as const
const lang = ref<(typeof LANGS)[number]>('English')
const langOpen = ref(false)

const MODULES = [
  {
    icon: Users,
    title: 'Recruitment (ATS)',
    body: 'Post jobs, source candidates, and move every applicant through a clear pipeline — with collaborative hiring and structured evaluations.',
  },
  {
    icon: HeartHandshake,
    title: 'HR (HRIS)',
    body: 'Onboard people, track time off, and run reviews from one place. Employee records, org charts, and workflows — all connected.',
  },
]
</script>

<template>
  <div class="min-h-screen flex bg-[var(--brand-surface-white)]">
    <!-- LEFT — activation message -->
    <div class="flex-1 flex flex-col overflow-y-auto px-6 sm:px-12 lg:px-16 py-8">
      <!-- header: logo + language -->
      <header class="flex items-center justify-between gap-4 shrink-0">
        <NuxtLink to="/" class="flex items-center gap-2.5 outline-none">
          <img src="/logo.svg" alt="Recruitera" class="w-9 h-9 rounded-[10px]">
          <span class="font-bold text-[19px] tracking-tight text-[var(--brand-teal)]">Recruitera</span>
        </NuxtLink>
        <Popover v-model:open="langOpen">
          <PopoverTrigger as-child>
            <button type="button" class="flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--brand-border)] text-[14px] font-semibold text-[var(--brand-text)] outline-none cursor-pointer hover:bg-[var(--brand-surface-hover)] transition-colors">
              {{ lang }}<ChevronDown class="w-4 h-4 text-[var(--brand-text-quiet)] transition-transform" :class="{ 'rotate-180': langOpen }" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" class="w-[180px] p-1.5 rounded-xl">
            <button
              v-for="l in LANGS"
              :key="l"
              type="button"
              class="w-full flex items-center justify-between px-3 h-10 rounded-lg text-[14px] text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
              @click="lang = l; langOpen = false"
            >
              {{ l }}<Check v-if="l === lang" class="w-4 h-4 text-[var(--brand-teal)]" stroke-width="2.4" />
            </button>
          </PopoverContent>
        </Popover>
      </header>

      <!-- content -->
      <div class="flex-1 flex flex-col justify-center py-12">
        <div class="w-full max-w-[520px]">
          <div class="w-16 h-16 rounded-2xl bg-[var(--brand-lime-tint)] inline-flex items-center justify-center mb-6">
            <span class="text-[30px] leading-none">📩</span>
          </div>
          <h1 class="text-[28px] font-bold tracking-[-0.01em] text-[var(--brand-text)]">Activate your Recruitera account</h1>
          <p class="mt-4 text-[15px] leading-[1.6] text-[var(--brand-text-muted)]">
            Please check your email (<span class="font-semibold text-[var(--brand-text)]">{{ email }}</span>) and click the verification link to activate your account.
          </p>

          <div class="mt-8">
            <BrandButton variant="primary-teal" size="lg" class="min-w-[240px] justify-between px-6" @click="navigateTo('/auth/onboarding')">
              <span>Continue</span><ArrowRight class="w-4 h-4" stroke-width="2.2" />
            </BrandButton>
          </div>

          <p class="mt-6 text-[14px] text-[var(--brand-text-secondary)]">
            <template v-if="!resent">
              Didn't receive the email?
              <button type="button" class="font-semibold text-[var(--brand-teal-secondary)] underline underline-offset-2 cursor-pointer" @click="resend">Resend email</button>
            </template>
            <span v-else class="inline-flex items-center gap-1.5 font-semibold text-[var(--brand-olive)]">
              <Check class="w-4 h-4" stroke-width="2.4" />Verification email sent.
            </span>
          </p>

          <div class="mt-8 border-t border-[var(--brand-border-hairline)]" />
        </div>
      </div>

      <!-- footer -->
      <footer class="shrink-0 max-w-[520px] text-[13px] leading-[1.6] text-[var(--brand-text-quiet)]">
        <p>Need help? <NuxtLink to="/" class="text-[var(--brand-text-secondary)] underline underline-offset-2">Contact us</NuxtLink></p>
        <p class="mt-1">
          Our <NuxtLink to="/" class="text-[var(--brand-text-secondary)] underline underline-offset-2">Privacy Policy</NuxtLink> is available here.
          Your cookie settings can be managed <NuxtLink to="/" class="text-[var(--brand-text-secondary)] underline underline-offset-2">here</NuxtLink>.
        </p>
      </footer>
    </div>

    <!-- RIGHT — platform panel (floating, large-radius curve) -->
    <div class="hidden lg:flex w-[44%] max-w-[640px] shrink-0 p-4">
      <div class="relative w-full overflow-hidden rounded-[32px] bg-[var(--brand-teal)]">
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
          <h2 class="text-[26px] font-extrabold text-white tracking-[-0.01em]">One platform for hiring &amp; HR</h2>

          <div class="mt-8 space-y-4">
            <div
              v-for="m in MODULES"
              :key="m.title"
              class="flex items-start gap-4 rounded-2xl bg-white/[0.07] border border-white/10 p-6"
            >
              <span class="w-12 h-12 shrink-0 rounded-xl bg-[var(--brand-lime)] inline-flex items-center justify-center">
                <component :is="m.icon" class="w-6 h-6 text-[var(--brand-teal)]" stroke-width="2" />
              </span>
              <div>
                <div class="text-[18px] font-bold text-white">{{ m.title }}</div>
                <p class="mt-1.5 text-[14px] leading-[1.55] text-white/75">{{ m.body }}</p>
              </div>
            </div>
          </div>

          <div class="mt-auto pt-12 flex flex-col items-center gap-2">
            <span class="text-[12px] font-semibold tracking-[0.08em] uppercase text-white/50">Powered by</span>
            <div class="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Recruitera" class="w-8 h-8 rounded-lg">
              <span class="font-bold text-[20px] tracking-tight text-white">Recruitera</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
