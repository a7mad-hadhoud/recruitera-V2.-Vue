<!--
  Home / Overview dashboard shell (/dashboard, the Home nav target).
  Renders the curved full-height panel (rounded-tl join with sidebar/nav,
  matching Jobs/Candidates), the tab row, and switches between the six
  Home tabs — each its own component under ~/components/dashboard.
  Brand tokens only.
-->
<script setup lang="ts">
import DashboardOverview from '~/components/dashboard/DashboardOverview.vue'
import DashboardCalendar from '~/components/dashboard/DashboardCalendar.vue'
import DashboardEvaluations from '~/components/dashboard/DashboardEvaluations.vue'
import DashboardTasks from '~/components/dashboard/DashboardTasks.vue'
import DashboardRecentNotes from '~/components/dashboard/DashboardRecentNotes.vue'
import DashboardActivity from '~/components/dashboard/DashboardActivity.vue'

definePageMeta({ layout: 'default' })

const TABS = ['Overview', 'Calendar', 'Evaluations', 'Tasks', 'Recent notes', 'Activity'] as const
type Tab = typeof TABS[number]
const activeTab = ref<Tab>('Overview')

const tabComponent = {
  Overview: DashboardOverview,
  Calendar: DashboardCalendar,
  Evaluations: DashboardEvaluations,
  Tasks: DashboardTasks,
  'Recent notes': DashboardRecentNotes,
  Activity: DashboardActivity,
}
</script>

<template>
  <!-- Curved full-height panel flush against sidebar + top nav (rounded-tl),
       same join treatment as the Jobs / Candidates tabs. -->
  <div class="flex h-full overflow-hidden bg-[var(--brand-canvas)]">
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden rounded-tl-[22px] border-t border-l border-[var(--brand-border)] bg-[var(--brand-surface-white)]">
      <!-- Tabs -->
      <div class="flex items-center gap-6 px-6 pt-4 border-b border-[var(--brand-border-fade)] shrink-0">
        <button
          v-for="t in TABS"
          :key="t"
          type="button"
          class="pb-3 -mb-px border-b-2 text-[14px] transition"
          :class="activeTab === t
            ? 'border-[var(--brand-teal)] text-[var(--brand-text)] font-bold'
            : 'border-transparent text-[var(--brand-text-quiet)] hover:text-[var(--brand-text)] font-medium'"
          @click="activeTab = t"
        >{{ t }}</button>
      </div>

      <!-- Active tab -->
      <div class="flex-1 overflow-y-auto bg-[var(--brand-surface-white)]">
        <component :is="tabComponent[activeTab]" />
      </div>
    </div>
  </div>
</template>
