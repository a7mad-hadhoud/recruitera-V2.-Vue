<script setup lang="ts">
import { Play } from 'lucide-vue-next'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsToggleCard from '~/components/settings/SettingsToggleCard.vue'

definePageMeta({ layout: 'settings' })

const RULES = [
  {
    key: 'conflict',
    title: 'Open Conflict Management',
    description: 'When ON, recruiters can flag and resolve hiring conflicts between team members openly. Promotes transparency in decision-making.',
    videoTitle: 'How Open Conflict Management works',
    videoMeta: '2 min · Learn how conflicts are surfaced, assigned, and resolved',
  },
  {
    key: 'distribution',
    title: 'Smart Distribution',
    description: 'When ON, candidates are automatically distributed to the most suitable recruiter based on workload, department, and skills. Reduces manual assignment effort.',
    videoTitle: 'How Smart Distribution works',
    videoMeta: '3 min · See how candidates are matched and routed automatically',
  },
] as const

const state = reactive<Record<string, boolean>>({
  conflict: true,
  distribution: false,
})
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Hiring rules"
      subtitle="Control which hiring modules are active across all jobs in your organization."
    />

    <div class="flex flex-col gap-4">
      <SettingsToggleCard
        v-for="rule in RULES"
        :key="rule.key"
        v-model="state[rule.key]"
        :title="rule.title"
        :description="rule.description"
        :always-show-body="true"
      >
        <template #body>
          <div class="bg-[var(--brand-canvas)] -mx-5 -my-4 px-5 py-4 flex items-center gap-3.5">
            <div class="w-[120px] h-[68px] rounded-[10px] bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-olive)] flex items-center justify-center shrink-0">
              <div class="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                <Play class="w-3 h-3 text-[var(--brand-teal)] fill-[var(--brand-teal)]" />
              </div>
            </div>
            <div>
              <div class="text-[13px] font-semibold text-[var(--brand-text)] mb-[3px]">{{ rule.videoTitle }}</div>
              <div class="text-[12px] text-[var(--brand-text-quiet)] mb-2">{{ rule.videoMeta }}</div>
              <span class="text-[12px] font-semibold text-[var(--brand-teal)]">Watch video</span>
            </div>
          </div>
        </template>
      </SettingsToggleCard>
    </div>
  </div>
</template>
