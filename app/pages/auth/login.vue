<!--
  Log in — shares the auth canvas + reusable AuthTopbar / AuthField with signup,
  so the two screens stay visually identical. Mock-only for now: submit routes to
  the app; wire to the real login endpoint (and set the auth session) when it ships.
-->
<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import AuthTopbar from '~/components/auth/AuthTopbar.vue'
import AuthField from '~/components/auth/AuthField.vue'
import { BrandButton, BrandLimeCheckbox } from '~/components/brand'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign in · Recruitera' })

const email = ref('')
const password = ref('')
const remember = ref(true)
const submitting = ref(false)

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const canSubmit = computed(() => emailValid.value && password.value.length >= 1)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  // TODO: POST /api/auth/login once the endpoint exists (server sets the session
  // cookie). For now route into the app.
  await navigateTo('/')
}
</script>

<template>
  <AuthTopbar prompt="Don't have an account?" link-text="Sign up" link-to="/auth/signup" />

  <main class="flex-1 flex items-start justify-center px-4 pb-16 pt-4 sm:pt-8">
    <div class="w-full max-w-[520px] bg-[var(--brand-auth-card)] rounded-[24px] shadow-[0_30px_80px_-24px_rgba(0,20,18,0.6)] px-8 sm:px-14 py-11 sm:py-14">
      <div class="text-center mb-9">
        <h1 class="text-[32px] leading-[1.15] font-bold tracking-[-0.01em] text-[var(--brand-teal)]">Welcome back</h1>
        <p class="mt-3 text-[16px] leading-[1.5] text-[var(--brand-text-muted)]">
          Sign in to your Recruitera account.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <AuthField v-model="email" label="Work email" type="email" required placeholder="you@company.com" autocomplete="email" />

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-[15px] font-bold text-[var(--brand-text-secondary)]">
              <span class="text-[var(--brand-danger)]">*</span> Password
            </span>
            <NuxtLink to="/" class="text-[13px] font-semibold text-[var(--brand-teal-secondary)] underline underline-offset-2">Forgot password?</NuxtLink>
          </div>
          <AuthField v-model="password" type="password" label="" placeholder="Your password" autocomplete="current-password" class="[&_span]:hidden" />
        </div>

        <label class="flex items-center gap-2.5 pt-1 cursor-pointer">
          <BrandLimeCheckbox v-model="remember" class="shrink-0" />
          <span class="text-[14.5px] text-[var(--brand-text-muted)]">Keep me signed in</span>
        </label>

        <BrandButton
          variant="primary-teal"
          type="submit"
          :disabled="!canSubmit || submitting"
          class="w-full h-[54px] text-[16px] font-bold tracking-[0.4px] rounded-[10px] mt-1"
        >
          Sign in<ArrowRight class="w-4 h-4" stroke-width="2.2" />
        </BrandButton>

        <div class="flex items-center gap-3 pt-1">
          <span class="h-px flex-1 bg-[var(--brand-border-light)]" />
          <span class="text-[13px] font-semibold text-[var(--brand-text-quiet)]">Or continue with</span>
          <span class="h-px flex-1 bg-[var(--brand-border-light)]" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Google -->
          <button type="button" class="h-12 flex items-center justify-center gap-2.5 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] font-semibold text-[var(--brand-text)] outline-none cursor-pointer hover:bg-[var(--brand-lime-tint-hover)] hover:border-[var(--brand-border-mid)] transition-colors">
            <svg class="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Google
          </button>
          <!-- Outlook -->
          <button type="button" class="h-12 flex items-center justify-center gap-2.5 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface-white)] text-[14px] font-semibold text-[var(--brand-text)] outline-none cursor-pointer hover:bg-[var(--brand-lime-tint-hover)] hover:border-[var(--brand-border-mid)] transition-colors">
            <svg class="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#0A2767" d="M44 24.5c0-.6-.3-1.1-.8-1.4L28 14v9l15 8.4c.6-.3 1-.9 1-1.6z"/>
              <path fill="#0364B8" d="M28 14v9l-6 3.5L4 15v-2c0-.6.4-1 1-1h22c.6 0 1 .4 1 1v1z"/>
              <path fill="#28A8EA" d="M28 23v11c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1V15l18 11 6-3z"/>
              <rect width="19" height="19" x="4" y="14.5" fill="#0078D4" rx="2"/>
              <path fill="#fff" d="M13.5 19.5c-2.6 0-4.4 1.9-4.4 4.5s1.8 4.5 4.3 4.5 4.4-1.9 4.4-4.5-1.7-4.5-4.3-4.5zm-.1 7.1c-1.4 0-2.3-1.1-2.3-2.6s.9-2.6 2.3-2.6 2.3 1.1 2.3 2.6-.9 2.6-2.3 2.6z"/>
            </svg>
            Outlook
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
