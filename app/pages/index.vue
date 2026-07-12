<script setup lang="ts">
definePageMeta({ layout: false })

if (import.meta.client) {
  await navigateTo('/dashboard', { replace: true })
}
</script>

<template>
  <div />
</template>
