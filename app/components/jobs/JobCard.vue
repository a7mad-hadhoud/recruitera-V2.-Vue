<!--
  Card representation of a single Job. Shared by the /jobs card view
  and reusable anywhere a compact job summary is needed (dashboard
  "recent jobs", talent-pool widgets, etc.).

  Structure mirrors the design reference:
   • Title + monospace #id badge
   • Location · Work model · Collar tag row
   • Actions: Cross post / Edit / ⋯ (View / Duplicate / Archive)
   • Footer: Qualified candidates count · Following bookmark · Status menu
-->
<script setup lang="ts">
import { MapPin, Globe, Bookmark, MoreHorizontal, Pencil, Megaphone, ExternalLink, Copy, Archive } from 'lucide-vue-next'
import { BrandStatusBadge } from '~/components/brand'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import JobStatusMenu from '~/components/jobs/JobStatusMenu.vue'
import type { Job, JobStatus, CollarType } from '~/types'

const props = defineProps<{ job: Job }>()

const emit = defineEmits<{
  'update-status': [id: string, status: JobStatus]
  'cross-post':    [id: string]
  'edit':          [id: string]
  'view':          [id: string]
  'duplicate':     [id: string]
  'archive':       [id: string]
  'toggle-follow': [id: string]
}>()

const WORK_MODEL_LABEL: Record<Job['workModel'], string> = {
  'on-site': 'On-site',
  remote:    'Remote',
  hybrid:    'Hybrid',
}
const COLLAR_LABEL: Record<CollarType, string> = { white: 'White collar', blue: 'Blue collar' }
</script>

<template>
  <article
    class="rounded-[14px] border border-[var(--brand-border-light)] bg-white p-5 hover:shadow-[0_2px_8px_rgba(0,20,18,0.06)] transition-shadow"
  >
    <!-- Top row: title + id + action buttons -->
    <div class="flex items-start gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <NuxtLink
            :to="`/jobs/${props.job.id}`"
            class="text-[16px] font-bold text-[var(--brand-text)] hover:text-[var(--brand-teal)] hover:underline"
          >{{ props.job.title }}</NuxtLink>
          <span class="text-[11.5px] font-mono text-[var(--brand-text-quiet)] bg-[var(--brand-canvas)] px-1.5 py-0.5 rounded">#{{ props.job.id }}</span>
        </div>
        <div class="mt-1.5 flex items-center gap-3 flex-wrap text-[13px] text-[var(--brand-text-muted)]">
          <span v-if="props.job.location" class="inline-flex items-center gap-1">
            <MapPin class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
            {{ props.job.location }}
          </span>
          <span class="text-[var(--brand-text-faint)]">•</span>
          <span class="inline-flex items-center gap-1">
            <Globe class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
            {{ WORK_MODEL_LABEL[props.job.workModel] }}
          </span>
          <span class="text-[var(--brand-text-faint)]">•</span>
          <BrandStatusBadge
            variant="solid"
            :tone="props.job.collar === 'white' ? 'neutral' : 'pipeline-blue'"
            :label="COLLAR_LABEL[props.job.collar]"
          />
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          class="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)]/50 transition"
          @click="emit('cross-post', props.job.id)"
        >
          <Megaphone class="w-3.5 h-3.5" stroke-width="1.8" />
          Cross post
        </button>
        <button
          class="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:bg-[var(--brand-lime-tint)]/50 transition"
          @click="emit('edit', props.job.id)"
        >
          <Pencil class="w-3.5 h-3.5" stroke-width="1.8" />
          Edit
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint)]/50 transition"
              aria-label="More actions"
            >
              <MoreHorizontal class="w-4 h-4" stroke-width="1.8" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-[180px] p-1">
            <DropdownMenuItem class="flex items-center gap-2.5 px-2 py-2 text-[13.5px] cursor-pointer" @select="emit('view', props.job.id)">
              <ExternalLink class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem class="flex items-center gap-2.5 px-2 py-2 text-[13.5px] cursor-pointer" @select="emit('duplicate', props.job.id)">
              <Copy class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem class="flex items-center gap-2.5 px-2 py-2 text-[13.5px] cursor-pointer" @select="emit('archive', props.job.id)">
              <Archive class="w-3.5 h-3.5 text-[var(--brand-text-quiet)]" stroke-width="1.7" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Bottom row: candidates count + follow + status -->
    <div class="mt-4 pt-3 border-t border-[var(--brand-border-fade)] flex items-center gap-4 text-[13px]">
      <div class="flex-1 text-[var(--brand-text-secondary)]">
        <span class="text-[15px] font-bold text-[var(--brand-text)]">{{ props.job.candidateCount }}</span>
        <span class="ml-1">Qualified candidates</span>
      </div>
      <button
        class="inline-flex items-center gap-1.5 text-[var(--brand-status-approved-text)] font-semibold hover:opacity-80 transition"
        aria-label="Toggle following"
        @click="emit('toggle-follow', props.job.id)"
      >
        <Bookmark class="w-3.5 h-3.5 fill-current" stroke-width="1.7" />
        Following
      </button>
      <JobStatusMenu
        :model-value="props.job.status"
        align="end"
        @update:model-value="(s) => emit('update-status', props.job.id, s)"
      />
    </div>
  </article>
</template>
