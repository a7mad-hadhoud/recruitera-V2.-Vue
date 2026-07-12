<script setup lang="ts">
definePageMeta({ layout: false })

if (import.meta.client) {
  await navigateTo('/settings/company', { replace: true })
}
</script>

<template>
  <div />
</template>
