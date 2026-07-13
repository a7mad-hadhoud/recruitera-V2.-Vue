<!--
  Traps errors from any child component so a single crash never white-screens
  the whole app. Uses onErrorCaptured — returning `false` stops propagation.
  Wrap any heavy or unfamiliar section: tables, detail panels, third-party embeds.
-->
<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err instanceof Error ? err : new Error(String(err))
  // TODO: forward to error tracking (Sentry / LogRocket) when the account exists.
  console.error('[ErrorBoundary]', err)
  return false
})

function reset() { error.value = null }
</script>

<template>
  <div v-if="error" class="flex flex-col items-center justify-center p-8 gap-3">
    <AlertTriangle class="w-8 h-8 text-[var(--brand-status-orange)]" />
    <p class="text-sm font-semibold text-[var(--brand-text)]">Something went wrong</p>
    <p class="text-xs text-[var(--brand-text-quiet)] max-w-md text-center">{{ error.message }}</p>
    <Button variant="outline" size="sm" class="border-[var(--brand-border)]" @click="reset">
      Try again
    </Button>
  </div>
  <slot v-else />
</template>
