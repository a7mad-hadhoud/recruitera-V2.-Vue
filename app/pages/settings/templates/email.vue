<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Bold, Italic, Underline, Link2, Search, Plus, Star } from 'lucide-vue-next'
import { useEmailTemplates, useEmailTemplate } from '~/composables/useTemplates'
import type { TemplateCategory } from '~/types'

definePageMeta({ layout: 'settings' })

const { data, isLoading } = useEmailTemplates()
const templates = computed(() => data.value?.data ?? [])
const selectedId = ref<string | null>(null)

// Auto-select the default (or first) template when data arrives
watch(templates, (arr) => {
  if (!selectedId.value && arr.length) {
    selectedId.value = arr.find(t => t.isDefault)?.id ?? arr[0]!.id
  }
}, { immediate: true })

const { data: selected } = useEmailTemplate(selectedId)

const categoryOrder: TemplateCategory[] = ['auto-confirmation', 'event-invitation', 'general']
const categoryLabels: Record<TemplateCategory, string> = {
  'auto-confirmation': 'Auto-confirmation',
  'event-invitation':  'Event invitation',
  'general':           'General',
}

const grouped = computed(() => {
  const map = new Map<TemplateCategory, typeof templates.value>()
  for (const cat of categoryOrder) map.set(cat, [])
  for (const t of templates.value) map.get(t.category)?.push(t)
  return categoryOrder.map(c => ({ category: c, items: map.get(c) ?? [] }))
})

const search = ref('')
const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return grouped.value
  return grouped.value
    .map(g => ({ ...g, items: g.items.filter(t => t.name.toLowerCase().includes(q)) }))
    .filter(g => g.items.length > 0)
})
</script>

<template>
  <div class="flex h-full">
    <!-- Template list column -->
    <div class="w-[280px] shrink-0 border-r border-[var(--brand-border)] flex flex-col bg-[var(--brand-canvas)]/40">
      <div class="p-4 border-b border-[var(--brand-border)] flex items-center gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--brand-text-quiet)]" />
          <Input v-model="search" placeholder="Search" class="pl-8 h-9 text-[13px]" />
        </div>
        <Button size="sm" variant="ghost" class="w-9 h-9 p-0">
          <Plus class="w-4 h-4" />
        </Button>
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <p v-if="isLoading" class="px-4 py-4 text-[13px] text-[var(--brand-text-muted)]">Loading…</p>
        <template v-else>
          <div v-for="g in filteredGroups" :key="g.category" class="mb-2">
            <div class="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-text-quiet)]">
              {{ categoryLabels[g.category] }}
            </div>
            <button
              v-for="t in g.items"
              :key="t.id"
              class="w-full flex items-center gap-2 px-4 py-2 text-left text-[13px] transition-colors border-l-[3px]"
              :class="selectedId === t.id
                ? 'bg-[var(--brand-lime-tint)] border-[var(--brand-olive)] text-[var(--brand-olive)] font-semibold'
                : 'border-transparent text-[var(--brand-text-secondary)] hover:bg-black/[.03]'"
              @click="selectedId = t.id"
            >
              <span class="flex-1">{{ t.name }}</span>
              <Star v-if="t.isDefault" class="w-3.5 h-3.5 fill-[var(--brand-lime)] text-[var(--brand-olive)]" />
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Editor -->
    <div class="flex-1 flex flex-col min-w-0 bg-white">
      <div v-if="!selected" class="flex-1 flex items-center justify-center text-[13px] text-[var(--brand-text-muted)]">
        Select a template
      </div>
      <template v-else>
        <div class="px-6 py-5 border-b border-[var(--brand-border)] flex items-center gap-3">
          <h2 class="text-[18px] font-bold text-[var(--brand-text)]">{{ selected.name }}</h2>
          <Badge v-if="selected.isDefault" class="bg-[var(--brand-lime-tint)] text-[var(--brand-olive)] border-0">Default</Badge>
          <div class="ml-auto flex gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm" class="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal)]/90">Save</Button>
          </div>
        </div>
        <div class="px-6 py-5 border-b border-[var(--brand-border)]">
          <label class="block text-[12px] font-bold uppercase tracking-wider text-[var(--brand-text-quiet)] mb-2">Subject</label>
          <Input :model-value="selected.subject" class="h-10 text-[14px]" />
        </div>
        <div class="px-6 py-3 border-b border-[var(--brand-border)] flex items-center gap-1 bg-[var(--brand-canvas)]/50">
          <button class="w-8 h-8 rounded inline-flex items-center justify-center text-[var(--brand-text-muted)] hover:bg-black/[.05]"><Bold class="w-3.5 h-3.5" /></button>
          <button class="w-8 h-8 rounded inline-flex items-center justify-center text-[var(--brand-text-muted)] hover:bg-black/[.05]"><Italic class="w-3.5 h-3.5" /></button>
          <button class="w-8 h-8 rounded inline-flex items-center justify-center text-[var(--brand-text-muted)] hover:bg-black/[.05]"><Underline class="w-3.5 h-3.5" /></button>
          <button class="w-8 h-8 rounded inline-flex items-center justify-center text-[var(--brand-text-muted)] hover:bg-black/[.05]"><Link2 class="w-3.5 h-3.5" /></button>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <Textarea :model-value="selected.body" rows="12" class="w-full text-[14px] leading-relaxed" />
        </div>
        <div class="px-6 py-3 border-t border-[var(--brand-border)] bg-[var(--brand-canvas)]/50">
          <div class="text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-text-quiet)] mb-1.5">Placeholders</div>
          <div class="flex flex-wrap gap-1.5">
            <Badge v-for="p in ['{{candidate_name}}', '{{job_title}}', '{{company_name}}', '{{event_title}}', '{{event_date}}', '{{referrer_name}}']" :key="p" variant="secondary" class="bg-white border border-[var(--brand-border)] text-[var(--brand-text-secondary)] font-mono text-[11px]">
              {{ p }}
            </Badge>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
