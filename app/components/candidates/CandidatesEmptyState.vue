<!--
  Two distinct empty states:
    - hasFilters: results filtered to zero → suggest clearing
    - !hasFilters: no candidates in the account → CTA to add first one
  Loading is a separate concern (CandidatesTableSkeleton), never rendered here.
-->
<script setup lang="ts">
import { SearchX, Users, Plus } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

defineProps<{ hasFilters: boolean }>()
defineEmits<{ clear: []; add: [] }>()
</script>

<template>
  <div v-if="hasFilters" class="flex flex-col items-center justify-center py-24 gap-3">
    <SearchX class="w-10 h-10 text-[var(--brand-text-faint)]" stroke-width="1.5" />
    <p class="text-sm font-semibold text-[var(--brand-text)]">No candidates match your filters</p>
    <p class="text-sm text-[var(--brand-text-quiet)]">Try adjusting or clearing your filters</p>
    <Button
      variant="outline"
      size="sm"
      class="mt-1 border-[var(--brand-border)]"
      @click="$emit('clear')"
    >Clear filters</Button>
  </div>

  <div v-else class="flex flex-col items-center justify-center py-24 gap-3">
    <Users class="w-10 h-10 text-[var(--brand-text-faint)]" stroke-width="1.5" />
    <p class="text-sm font-semibold text-[var(--brand-text)]">No candidates yet</p>
    <p class="text-sm text-[var(--brand-text-quiet)]">Add your first candidate to get started</p>
    <Button
      size="sm"
      class="mt-1 bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90"
      @click="$emit('add')"
    >
      <Plus class="w-4 h-4 mr-1.5" />
      Add candidate
    </Button>
  </div>
</template>
