<!--
  Jobs left-hand card: PREDEFINED views (All / Followed / … / Closed) +
  MY VIEWS list with an "Add view" affordance. Same rounded-tl white-card
  shell as CandidatesFilters (see that file for the collapse-rail pattern
  we'll add later).
-->
<script setup lang="ts">
import { Briefcase, Star, User, Zap, Archive, FileEdit, XCircle, Plus, ChevronRight } from 'lucide-vue-next'
import { BrandSectionTitle, BrandCountBadge } from '~/components/brand'

type ViewKey = 'all' | 'followed' | 'involved' | 'active' | 'archived' | 'draft' | 'closed'
type SavedView = { id: string; title: string }

const props = defineProps<{
  active: ViewKey
  counts: Record<ViewKey, number>
  savedViews?: SavedView[]
  selectedSavedViewId?: string | null
}>()

const emit = defineEmits<{
  'update:active': [key: ViewKey]
  'new-view': []
  'select-view': [id: string]
}>()

type Item = { key: ViewKey; label: string; icon: unknown }
const items: Item[] = [
  { key: 'all',      label: 'All',              icon: Briefcase },
  { key: 'followed', label: 'Followed',         icon: Star },
  { key: 'involved', label: "I'm involved in",  icon: User },
  { key: 'active',   label: 'Active',           icon: Zap },
  { key: 'archived', label: 'Archived',         icon: Archive },
  { key: 'draft',    label: 'Draft',            icon: FileEdit },
  { key: 'closed',   label: 'Closed',           icon: XCircle },
]

function isActive(k: ViewKey) { return props.active === k }
</script>

<template>
  <aside
    class="w-[264px] shrink-0 h-full flex flex-col rounded-tl-[22px] bg-white border-t border-l border-r border-[var(--brand-border)] overflow-hidden"
  >
    <div class="flex-1 overflow-y-auto px-2.5">
      <BrandSectionTitle label="Predefined" />
      <nav class="flex flex-col gap-px">
        <button
          v-for="item in items"
          :key="item.key"
          class="flex items-center px-2 py-1.5 rounded-lg text-[13.5px] transition-colors w-full text-left"
          :class="isActive(item.key)
            ? 'bg-[var(--brand-lime-tint)] text-[var(--brand-olive)] font-semibold'
            : 'text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)]'"
          @click="emit('update:active', item.key)"
        >
          <span class="w-[22px] mr-2.5 shrink-0 flex items-center justify-center">
            <component :is="item.icon" class="w-[17px] h-[17px] text-[var(--brand-text-quiet)]" stroke-width="1.6" />
          </span>
          <span class="flex-1 whitespace-nowrap">{{ item.label }}</span>
          <BrandCountBadge :count="counts[item.key] ?? 0" />
        </button>
      </nav>

      <div class="h-px bg-[var(--brand-border-fade)] mx-1 my-3" />

      <BrandSectionTitle label="My views" />

      <button
        v-for="v in (props.savedViews ?? [])"
        :key="v.id"
        class="mt-0.5 flex items-center px-2 py-1.5 rounded-lg text-[13.5px] transition-colors w-full text-left"
        :class="props.selectedSavedViewId === v.id
          ? 'bg-[var(--brand-lime-tint)] text-[var(--brand-olive)] font-semibold'
          : 'text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)]'"
        @click="emit('select-view', v.id)"
      >
        <span class="w-[22px] mr-2.5 shrink-0" />
        <span class="flex-1 whitespace-nowrap truncate">{{ v.title }}</span>
      </button>

      <button
        class="mt-1 mb-3 flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)] transition-colors w-full text-left"
        @click="emit('new-view')"
      >
        <span class="w-6 h-6 rounded-md bg-[var(--brand-teal)] text-white flex items-center justify-center">
          <Plus class="w-3.5 h-3.5" stroke-width="2.5" />
        </span>
        New view
      </button>
    </div>

    <!-- Collapse rail placeholder (matches CandidatesFilters footer chrome) -->
    <div class="flex-none border-t border-[var(--brand-border-fade)] h-11 flex items-center px-2 bg-white">
      <button
        class="flex-1 h-9 rounded-lg flex items-center gap-2 px-2 text-[13px] font-medium text-[var(--brand-text-subtle)] hover:bg-[var(--brand-surface-hover)] transition-colors"
      >
        <ChevronRight class="w-3.5 h-3.5 rotate-180" stroke-width="2" />
        Collapse
      </button>
    </div>
  </aside>
</template>
