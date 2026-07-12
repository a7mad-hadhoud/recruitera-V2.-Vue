<script setup lang="ts">
import { ChevronDown, Building2, Workflow, FileText, Users2, User, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()

type Child = { label: string; to: string }
type Group = { key: string; label: string; icon: typeof Building2; children: Child[] }

const groups: Group[] = [
  { key: 'company',  label: 'Company',      icon: Building2, children: [
    { label: 'Company information',  to: '/settings/company' },
    { label: 'Locations',             to: '/settings/locations' },
    { label: 'Departments',           to: '/settings/departments' },
    { label: 'Job Titles',            to: '/settings/job-titles' },
    { label: 'Candidate Blocklist',   to: '/settings/blocklist' },
  ]},
  { key: 'workflow', label: 'Workflow',     icon: Workflow, children: [
    { label: 'Pipeline',              to: '/settings/workflow/pipeline' },
    { label: 'WhatsApp',              to: '/settings/workflow/whatsapp' },
    { label: 'Benefits',              to: '/settings/workflow/benefits' },
  ]},
  { key: 'templates', label: 'Templates',   icon: FileText, children: [
    { label: 'Email',                 to: '/settings/templates/email' },
  ]},
  { key: 'team',     label: 'Team & Roles', icon: Users2, children: [
    { label: 'Team members',          to: '/settings/team/members' },
    { label: 'Hiring roles',          to: '/settings/team/roles' },
  ]},
  { key: 'account',  label: 'My Account',   icon: User, children: [] },
]

const openKey = ref<string | null>(null)

// Auto-open the group containing the current route
watchEffect(() => {
  const g = groups.find(g => g.children.some(c => route.path === c.to || route.path.startsWith(c.to + '/')))
  if (g) openKey.value = g.key
  else if (openKey.value === null) openKey.value = 'company'
})

function toggle(key: string) {
  openKey.value = openKey.value === key ? null : key
}

const isChildActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <aside class="w-[232px] shrink-0 flex flex-col bg-[var(--brand-canvas)] border-r border-[var(--brand-border)]">
    <div class="px-3 py-3 border-b border-[var(--brand-border)]">
      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-2 px-2 h-9 rounded-md text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-black/[.04] transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        Back to app
      </NuxtLink>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
      <template v-for="g in groups" :key="g.key">
        <button
          class="flex items-center gap-2 px-2 h-9 rounded-md text-[13.5px] font-semibold text-[var(--brand-text-secondary)] hover:bg-black/[.04] transition-colors w-full text-left"
          @click="toggle(g.key)"
        >
          <component :is="g.icon" class="w-4 h-4 shrink-0" />
          <span class="flex-1">{{ g.label }}</span>
          <ChevronDown
            class="w-3.5 h-3.5 transition-transform"
            :class="openKey === g.key ? 'rotate-180' : ''"
          />
        </button>
        <div
          class="overflow-hidden transition-[max-height] duration-200 ease-out"
          :style="{ maxHeight: openKey === g.key ? `${g.children.length * 32}px` : '0px' }"
        >
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
              class="w-[2px] h-3.5 rounded-sm"
              :class="isChildActive(c.to) ? 'bg-[var(--brand-olive)]' : 'bg-[var(--brand-border-mid)]'"
            />
            {{ c.label }}
          </NuxtLink>
        </div>
      </template>
    </nav>
  </aside>
</template>
