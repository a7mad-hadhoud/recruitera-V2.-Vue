<!--
  Sign up — "Start your free trial". Dark teal auth canvas (auth layout) with a
  centered white card: name / work email / password, a marketing opt-in, and the
  primary CTA. Mock-only for now — submit seeds the mock auth store and routes to
  onboarding; wire to the real signup endpoint when it ships.
-->
<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import AuthTopbar from '~/components/auth/AuthTopbar.vue'
import AuthField from '~/components/auth/AuthField.vue'
import PhoneField from '~/components/auth/PhoneField.vue'
import { BrandButton, BrandLimeCheckbox } from '~/components/brand'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Start your free trial · Recruitera' })

const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const phoneCountry = ref('EG')
const email = ref('')
const password = ref('')
const optIn = ref(false)
const submitting = ref(false)
const SOCIAL = ['Google', 'Microsoft', 'LinkedIn'] as const

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const phoneValid = computed(() => phone.value.replace(/\D/g, '').length >= 6)
const canSubmit = computed(() =>
  !!firstName.value.trim()
  && !!lastName.value.trim()
  && phoneValid.value
  && emailValid.value
  && password.value.length >= 8,
)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  // TODO: POST /api/auth/signup once the endpoint exists. For now, route to the
  // account-activation screen (then onboarding) to continue the mock trial setup.
  await navigateTo({ path: '/auth/verify', query: { email: email.value.trim() } })
}
</script>

<template>
  <AuthTopbar prompt="Already have an account?" link-text="Sign in" link-to="/auth/login" />

  <main class="flex-1 flex items-start justify-center px-4 pb-16 pt-4 sm:pt-8">
    <div class="w-full max-w-[560px] bg-[var(--brand-auth-card)] rounded-[24px] shadow-[0_30px_80px_-24px_rgba(0,20,18,0.6)] px-8 sm:px-14 py-11 sm:py-14">
      <div class="text-center mb-9">
        <h1 class="text-[32px] leading-[1.15] font-bold tracking-[-0.01em] text-[var(--brand-teal)]">Start your free trial</h1>
        <p class="mt-3 text-[16px] leading-[1.5] text-[var(--brand-text-muted)]">
          Try our full hiring and HR platform for 15 days with no credit card required.
        </p>
      </div>

      <form class="space-y-7" @submit.prevent="submit">
        <AuthField v-model="firstName" label="First name" required autocomplete="given-name" />
        <AuthField v-model="lastName" label="Last name" required autocomplete="family-name" />
        <PhoneField v-model:number="phone" v-model:country="phoneCountry" />
        <AuthField v-model="email" label="Work email" type="email" required autocomplete="email" />
        <AuthField v-model="password" label="Password" type="password" required autocomplete="new-password" />

        <label class="flex items-start gap-3 pt-1 cursor-pointer">
          <BrandLimeCheckbox v-model="optIn" class="mt-0.5 shrink-0" />
          <span class="text-[14.5px] leading-[1.5] text-[var(--brand-text-muted)]">
            Yes, I'd like helpful resources like tutorials, templates and hiring advice. You can opt out any time — see our
            <NuxtLink to="/" class="font-semibold text-[var(--brand-teal-secondary)] underline underline-offset-2">Privacy Policy</NuxtLink>.
          </span>
        </label>

        <BrandButton
          variant="primary-teal"
          type="submit"
          :disabled="!canSubmit || submitting"
          class="w-full h-[54px] text-[16px] font-bold tracking-[0.4px] rounded-[10px] mt-1"
        >
          Start a free trial<ArrowRight class="w-4 h-4" stroke-width="2.2" />
        </BrandButton>

        <div class="flex items-center gap-3 pt-1">
          <span class="h-px flex-1 bg-[var(--brand-border-light)]" />
          <span class="text-[13px] font-semibold text-[var(--brand-text-quiet)]">Or start with</span>
          <span class="h-px flex-1 bg-[var(--brand-border-light)]" />
        </div>
        <div class="grid grid-cols-3 gap-2.5">
          <button v-for="p in SOCIAL" :key="p" type="button" class="h-12 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] font-semibold text-[var(--brand-text-secondary)] outline-none cursor-pointer hover:bg-[var(--brand-lime-tint-hover)] hover:border-[var(--brand-border-mid)] transition-colors">
            {{ p }}
          </button>
        </div>
      </form>

      <p class="mt-6 text-center text-[13px] leading-[1.5] text-[var(--brand-text-quiet)]">
        By starting a trial you agree to Recruitera's
        <NuxtLink to="/" class="text-[var(--brand-text-secondary)] underline underline-offset-2">Terms of Service</NuxtLink>.
      </p>
    </div>
  </main>
</template>
