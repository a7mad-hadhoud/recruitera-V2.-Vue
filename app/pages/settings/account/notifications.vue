<script setup lang="ts">
import { Switch } from '~/components/ui/switch'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'
import SettingsToggleCard from '~/components/settings/SettingsToggleCard.vue'

definePageMeta({ layout: 'settings' })

// Global switch
const allNotifications = ref(true)

// Delivery mode: 'realtime' | 'digest'
const deliveryMode = ref<'realtime' | 'digest'>('realtime')

// Notification catalog — mirrors ground truth exactly
interface NotifRow {
  id: string
  label: string
  description: string
  isKey?: boolean
  email: boolean
  inApp: boolean
}
interface NotifGroup { title: string; rows: NotifRow[] }

const groups = ref<NotifGroup[]>([
  {
    title: 'Jobs & Applications',
    rows: [
      { id: 'new-apps', label: 'New Candidate Applications', description: "Get notified by email each time someone applies to a job you're assigned to manage", isKey: true, email: true, inApp: true },
      { id: 'assigned-job', label: 'Assigned to New Job', description: 'When you are assigned as a recruiter to a new job posting', email: true, inApp: true },
    ],
  },
  {
    title: 'Task Assignments',
    rows: [
      { id: 'assigned-tasks', label: 'Assigned Tasks', description: 'When a task is assigned to you in the platform', email: true, inApp: true },
      { id: 'assigned-evals', label: 'Assigned Evaluations', description: 'When you are assigned an evaluation to complete for a candidate', email: true, inApp: true },
    ],
  },
  {
    title: 'Deadlines & Reminders',
    rows: [
      { id: 'task-reminder', label: 'Task Reminder', description: 'Reminder before a task deadline is due', email: true, inApp: true },
      { id: 'stage-limit', label: 'Stage Limit Duration', description: 'Alert when a candidate exceeds the allowed time in a pipeline stage', email: false, inApp: false },
      { id: 'eval-reminder', label: 'Evaluation Reminder', description: 'Reminder to complete an assigned evaluation before its deadline', email: true, inApp: true },
    ],
  },
  {
    title: 'Replies & Mentions',
    rows: [
      { id: 'candidate-replies', label: 'Candidate Replies', description: 'When a candidate replies to an email you sent from Recruitera', email: true, inApp: true },
      { id: 'mentions', label: 'Comment Mentions', description: 'When someone @mentions you in a candidate comment or note', email: true, inApp: true },
    ],
  },
])
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Notifications"
      subtitle="Control when and how you receive notifications."
    />

    <!-- Global toggle -->
    <div class="mb-5">
      <SettingsToggleCard
        v-model="allNotifications"
        title="All notifications"
        description="When off, no notification emails of any type will be sent"
      />
    </div>

    <!-- Email delivery mode -->
    <div class="border border-[var(--brand-border-light)] rounded-[14px] overflow-hidden mb-6">
      <div class="px-5 py-3.5 border-b border-[var(--brand-border-light)]">
        <div class="text-[14px] font-bold text-[var(--brand-text)]">Email delivery mode</div>
        <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">Choose how email notifications are delivered</div>
      </div>
      <div class="flex">
        <label
          class="flex-1 flex items-center gap-2.5 px-5 py-3.5 cursor-pointer border-r border-[var(--brand-border-light)] transition-colors"
          :class="deliveryMode === 'realtime' ? 'bg-[var(--brand-canvas)]' : 'bg-[var(--brand-surface-white)]'"
        >
          <input v-model="deliveryMode" type="radio" value="realtime" class="w-4 h-4 shrink-0" :style="{ accentColor: 'var(--brand-teal)' }">
          <div>
            <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">Real-time</div>
            <div class="text-[12px] text-[var(--brand-text-quiet)]">Sent immediately on each event</div>
          </div>
        </label>
        <label
          class="flex-1 flex items-center gap-2.5 px-5 py-3.5 cursor-pointer transition-colors"
          :class="deliveryMode === 'digest' ? 'bg-[var(--brand-canvas)]' : 'bg-[var(--brand-surface-white)]'"
        >
          <input v-model="deliveryMode" type="radio" value="digest" class="w-4 h-4 shrink-0" :style="{ accentColor: 'var(--brand-teal)' }">
          <div>
            <div class="text-[13.5px] font-semibold text-[var(--brand-text)]">Digest</div>
            <div class="text-[12px] text-[var(--brand-text-quiet)]">Batched summary: Daily 9:00 AM</div>
          </div>
        </label>
      </div>
    </div>

    <!-- Notification table -->
    <div class="border border-[var(--brand-border-light)] rounded-[14px] overflow-hidden">
      <div class="grid bg-[var(--brand-canvas)] border-b border-[var(--brand-border-light)] px-5 py-2.5" :style="{ gridTemplateColumns: '1fr 90px 90px' }">
        <div class="text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--brand-text-quiet)]">Notification type</div>
        <div class="text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--brand-text-quiet)] text-center">Email</div>
        <div class="text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--brand-text-quiet)] text-center">In-App</div>
      </div>

      <template v-for="(g, gi) in groups" :key="g.title">
        <div class="px-5 pt-2.5 pb-1 border-b border-[var(--brand-border-row)] bg-[var(--brand-surface-white)]">
          <div class="text-[11px] font-bold uppercase tracking-[0.07em] text-[var(--brand-text-quiet)]">{{ g.title }}</div>
        </div>
        <div
          v-for="(row, ri) in g.rows"
          :key="row.id"
          class="grid items-center px-5 py-3 bg-[var(--brand-surface-white)]"
          :class="(gi === groups.length - 1 && ri === g.rows.length - 1) ? '' : 'border-b border-[var(--brand-border-row)]'"
          :style="{ gridTemplateColumns: '1fr 90px 90px' }"
        >
          <div>
            <div class="text-[13.5px] font-semibold text-[var(--brand-text)] flex items-center gap-1.5">
              {{ row.label }}
              <span
                v-if="row.isKey"
                class="text-[10px] font-bold rounded-[4px] px-1.5 py-[2px]"
                :style="{ background: 'var(--brand-status-pending-bg)', color: 'var(--brand-status-pending-text)' }"
              >KEY</span>
            </div>
            <div class="text-[12px] text-[var(--brand-text-quiet)] mt-0.5">{{ row.description }}</div>
          </div>
          <div class="flex justify-center">
            <Switch v-model="row.email" class="data-[state=checked]:bg-[var(--brand-teal)] scale-90" />
          </div>
          <div class="flex justify-center">
            <Switch v-model="row.inApp" class="data-[state=checked]:bg-[var(--brand-teal)] scale-90" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
