<!--
  Top bar shared by the auth screens: Recruitera logo mark + wordmark on the
  left, and a "prompt + link" on the right that points to the other auth page
  (signup ↔ login). Sits over the dark teal auth canvas, so text is light.
-->
<script setup lang="ts">
defineProps<{
  prompt: string
  linkText: string
  linkTo: string
}>()
</script>

<template>
  <header class="flex items-center justify-between px-6 sm:px-10 py-6">
    <NuxtLink to="/auth/login" class="flex items-center gap-2.5 outline-none">
      <img src="/logo.svg" alt="Recruitera" class="w-[38px] h-[38px] rounded-[11px]">
      <span class="font-bold text-[19px] tracking-tight text-white">Recruitera</span>
    </NuxtLink>

    <p class="text-[14.5px] text-white/75">
      {{ prompt }}
      <NuxtLink :to="linkTo" class="font-bold text-white underline underline-offset-2 hover:text-[var(--brand-lime)] transition-colors">{{ linkText }}</NuxtLink>
    </p>
  </header>
</template>
