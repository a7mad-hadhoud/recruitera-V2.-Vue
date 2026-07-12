<!--
  Full Settings nav — 5 groups / 29 routes, ported from settings.html's
  accordion structure. Open/closed accordion state persists via
  useLocalStorage; the group containing the current route auto-opens.
-->
<script setup lang="ts">
import { ChevronDown, Building2, Workflow, LayoutTemplate, Users2, User, ArrowLeft } from 'lucide-vue-next'
import { useLocalStorage } from '@vueuse/core'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'

const route = useRoute()

type Child = { label: string; to: string }
type Group = { key: string; label: string; icon: typeof Building2; children: Child[] }

const groups: Group[] = [
  { key: 'company', label: 'Company', icon: Building2, children: [
    { label: 'Company information', to: '/settings/company' },
    { label: 'Locations', to: '/settings/locations' },
    { label: 'Departments', to: '/settings/departments' },
    { label: 'Job Titles', to: '/settings/job-titles' },
    { label: 'Candidate Blocklist', to: '/settings/blocklist' },
    { label: 'Career Site', to: '/settings/career-site' },
    { label: 'Integrations', to: '/settings/integrations' },
    { label: 'My Plan', to: '/settings/my-plan' },
  ]},
  { key: 'workflow', label: 'Workflow', icon: Workflow, children: [
    { label: 'Requisition approvals', to: '/settings/workflow/approvals' },
    { label: 'Hiring rules', to: '/settings/workflow/hiring-rules' },
    { label: 'Disqualify reasons', to: '/settings/workflow/disqualify' },
    { label: 'Tags & sources', to: '/settings/workflow/tags-sources' },
    { label: 'Public links', to: '/settings/workflow/public-links' },
    { label: 'Stage types', to: '/settings/workflow/stage-types' },
  ]},
  { key: 'templates', label: 'Templates', icon: LayoutTemplate, children: [
    { label: 'Email', to: '/settings/templates/email' },
    { label: 'Application Forms', to: '/settings/templates/application-forms' },
    { label: 'Evaluation Forms', to: '/settings/templates/evaluation-forms' },
    { label: 'Questionnaire Forms', to: '/settings/templates/questionnaires' },
    { label: 'Benefits', to: '/settings/templates/benefits' },
    { label: 'Pipeline', to: '/settings/templates/pipeline' },
    { label: 'WhatsApp', to: '/settings/templates/whatsapp' },
    { label: 'Job Templates', to: '/settings/templates/job-templates' },
    { label: 'Referral questions', to: '/settings/templates/referral' },
    { label: 'Offer Management', to: '/settings/templates/offer' },
  ]},
  { key: 'team', label: 'Team & Roles', icon: Users2, children: [
    { label: 'Team members', to: '/settings/team/members' },
    { label: 'Hiring roles', to: '/settings/team/roles' },
  ]},
  { key: 'account', label: 'My Account', icon: User, children: [
    { label: 'Profile', to: '/settings/account/profile' },
    { label: 'Notifications', to: '/settings/account/notifications' },
    { label: 'Security', to: '/settings/account/security' },
  ]},
]

const openKeys = useLocalStorage<string[]>('settings-sidebar-open', ['company'])

function isOpen(key: string) {
  return openKeys.value.includes(key)
}

function toggle(key: string) {
  openKeys.value = isOpen(key)
    ? openKeys.value.filter(k => k !== key)
    : [...openKeys.value, key]
}

// Auto-open the group containing the current route.
watchEffect(() => {
  const g = groups.find(g => g.children.some(c => route.path === c.to || route.path.startsWith(c.to + '/')))
  if (g && !openKeys.value.includes(g.key)) {
    openKeys.value = [...openKeys.value, g.key]
  }
})

const isChildActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <aside class="w-[232px] shrink-0 flex flex-col bg-[var(--brand-canvas)] overflow-y-auto px-2.5 py-4">
    <NuxtLink
      to="/candidates"
      class="flex items-center gap-2.5 px-3 h-9 rounded-[10px] text-[13.5px] font-semibold text-[var(--brand-text-secondary)] bg-[var(--brand-topbar-pill-bg)] hover:brightness-95 transition-colors mb-3"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to app
    </NuxtLink>

    <nav class="flex flex-col gap-0.5">
      <Collapsible
        v-for="g in groups"
        :key="g.key"
        :open="isOpen(g.key)"
        @update:open="toggle(g.key)"
      >
        <CollapsibleTrigger class="flex items-center gap-2 px-2 h-9 rounded-md text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-black/[.04] transition-colors w-full text-left mt-0.5">
          <component :is="g.icon" class="w-[17px] h-[17px] shrink-0" :stroke-width="1.6" />
          <span class="flex-1">{{ g.label }}</span>
          <ChevronDown
            class="w-3.5 h-3.5 transition-transform"
            :class="isOpen(g.key) ? 'rotate-180' : ''"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <NuxtLink
            v-for="c in g.children"
            :key="c.to"
            :to="c.to"
            class="flex items-center gap-2 pl-8 pr-2 h-7 rounded-md text-[13px] transition-colors"
            :class="isChildActive(c.to)
              ? 'bg-[var(--brand-lime-active-bg)] text-[var(--brand-olive)] font-semibold'
              : 'text-[var(--brand-text-muted)] hover:bg-[var(--brand-lime-tint)]'"
          >
            <span
              class="w-[2px] h-3.5 rounded-sm shrink-0"
              :class="isChildActive(c.to) ? 'bg-[var(--brand-olive)]' : 'bg-[var(--brand-border-mid)]'"
            />
            {{ c.label }}
          </NuxtLink>
        </CollapsibleContent>
      </Collapsible>
    </nav>
  </aside>
</template>
