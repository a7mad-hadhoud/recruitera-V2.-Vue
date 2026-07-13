<!--
  Two distinct empty states:
    - hasFilters: results filtered to zero → suggest clearing
    - !hasFilters: no candidates in the account → CTA to add first one
  Loading is a separate concern (CandidatesTableSkeleton), never rendered here.
-->
<script setup lang="ts">
import { SearchX, Users, Plus } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { BrandEmptyState } from '~/components/brand'

defineProps<{ hasFilters: boolean }>()
defineEmits<{ clear: []; add: [] }>()
</script>

<template>
  <BrandEmptyState
    v-if="hasFilters"
    :icon="SearchX"
    title="No candidates match your filters"
    description="Try adjusting or clearing your filters"
  >
    <Button
      variant="outline"
      size="sm"
      class="border-[var(--brand-border)]"
      @click="$emit('clear')"
    >Clear filters</Button>
  </BrandEmptyState>

  <BrandEmptyState
    v-else
    :icon="Users"
    title="No candidates yet"
    description="Add your first candidate to get started"
  >
    <Button
      size="sm"
      class="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90"
      @click="$emit('add')"
    >
      <Plus class="w-4 h-4 mr-1.5" />
      Add candidate
    </Button>
  </BrandEmptyState>
</template>
