<script setup lang="ts">
import { Users, Search as SearchIcon, Star } from 'lucide-vue-next'
import {
  BrandAvatarInitials,
  BrandButton,
  BrandCard,
  BrandCountBadge,
  BrandEmptyState,
  BrandFavoriteItem,
  BrandFilterGroup,
  BrandFilterOption,
  BrandLimeCheckbox,
  BrandPageTitle,
  BrandSearchBar,
  BrandSectionTitle,
} from '~/components/brand'

definePageMeta({ layout: false })

type Token = { name: string; value: string }
type TokenGroup = { title: string; tokens: Token[] }

const tokenGroups: TokenGroup[] = [
  {
    title: 'Brand accent',
    tokens: [
      { name: '--brand-lime', value: '#C9FD13' },
      { name: '--brand-lime-tint', value: '#f4f7ec' },
      { name: '--brand-lime-tint-hover', value: '#f4f7ef' },
      { name: '--brand-lime-active-bg', value: 'rgba(201, 253, 19, 0.28)' },
      { name: '--brand-lime-active-bg-strong', value: 'rgba(201, 253, 19, 0.38)' },
      { name: '--brand-olive', value: '#3f5600' },
    ],
  },
  {
    title: 'CTA / deep teal',
    tokens: [
      { name: '--brand-teal', value: '#002427' },
      { name: '--brand-teal-secondary', value: '#127295' },
    ],
  },
  {
    title: 'Canvas + surfaces',
    tokens: [
      { name: '--brand-canvas', value: '#f7f8f9' },
      { name: '--brand-surface-white', value: '#ffffff' },
      { name: '--brand-surface-badge', value: '#f0f2ed' },
      { name: '--brand-surface-hover', value: '#f2f4ee' },
      { name: '--brand-surface-table-alt', value: '#f7f8f4' },
    ],
  },
  {
    title: 'Text scale',
    tokens: [
      { name: '--brand-text', value: '#1a2b28' },
      { name: '--brand-text-secondary', value: '#3a4742' },
      { name: '--brand-text-muted', value: '#5b6b5f' },
      { name: '--brand-text-subtle', value: '#6b7a74' },
      { name: '--brand-text-quiet', value: '#8a978f' },
      { name: '--brand-text-disabled', value: '#b5bdb2' },
      { name: '--brand-text-faint', value: '#c3cabf' },
      { name: '--brand-nav-text', value: '#4a5750' },
    ],
  },
  {
    title: 'Icons',
    tokens: [
      { name: '--brand-icon-default', value: '#6b7a74' },
      { name: '--brand-icon-muted', value: '#aab3a8' },
    ],
  },
  {
    title: 'Borders',
    tokens: [
      { name: '--brand-border', value: '#dfe3db' },
      { name: '--brand-border-light', value: '#e6e9e1' },
      { name: '--brand-border-mid', value: '#c8cfc6' },
      { name: '--brand-border-divider', value: '#dde1d7' },
      { name: '--brand-border-fade', value: '#e2e6dc' },
      { name: '--brand-border-key', value: '#cfd6cd' },
      { name: '--brand-border-hairline', value: '#eef1ea' },
      { name: '--brand-border-row', value: '#f1f3ec' },
    ],
  },
  {
    title: 'Semantics',
    tokens: [
      { name: '--brand-danger', value: '#e01919' },
      { name: '--brand-badge-new-bg', value: 'var(--brand-teal-secondary)' },
      { name: '--brand-badge-new-text', value: '#ffffff' },
      { name: '--brand-badge-settings-bg', value: '#eef1ea' },
      { name: '--brand-badge-settings-text', value: '#3a5c2e' },
    ],
  },
  {
    title: 'Settings module (modal / dropdown / toast)',
    tokens: [
      { name: '--brand-settings-danger', value: '#c0392b' },
      { name: '--brand-settings-danger-hover-bg', value: '#fff0ee' },
      { name: '--brand-settings-modal-bg', value: '#f4f6f3' },
      { name: '--brand-settings-modal-overlay', value: 'rgba(0, 20, 18, 0.4)' },
      { name: '--brand-settings-dropdown-shadow', value: '0 8px 28px rgba(0, 20, 18, 0.14)' },
      { name: '--brand-settings-modal-shadow', value: '0 32px 80px rgba(0, 20, 18, 0.18)' },
      { name: '--brand-settings-toast-bg', value: '#b91c1c' },
      { name: '--brand-settings-pill-bg', value: '#dde8da' },
      { name: '--brand-settings-status-active', value: '#2ecc71' },
      { name: '--brand-settings-status-neutral', value: '#c3cabf' },
      { name: '--brand-dynamic-role-bg', value: '#f0f4ff' },
      { name: '--brand-dynamic-role-border', value: '#d0d9f5' },
      { name: '--brand-dynamic-role-text', value: '#4a6cf7' },
      { name: '--brand-dynamic-role-icon-bg', value: '#e8f0fe' },
      { name: '--brand-email-highlight-bg', value: '#eef3f0' },
      { name: '--brand-email-highlight-border', value: '#c5d9ce' },
      { name: '--brand-status-teal-green', value: '#3a9b7a' },
      { name: '--brand-status-orange', value: '#e67e22' },
      { name: '--brand-status-gray', value: '#95a5a6' },
      { name: '--brand-pipeline-blue', value: '#3498db' },
      { name: '--brand-pipeline-purple', value: '#9b59b6' },
      { name: '--brand-status-approved-bg', value: '#eef9f0' },
      { name: '--brand-status-approved-text', value: '#1a6e40' },
      { name: '--brand-status-pending-bg', value: '#fef9e8' },
      { name: '--brand-status-pending-text', value: '#b45309' },
    ],
  },
  {
    title: 'Top bar',
    tokens: [
      { name: '--brand-topbar-pill-bg', value: '#eef1ea' },
      { name: '--brand-topbar-pill-border', value: '#e0e4dc' },
    ],
  },
  {
    title: 'Sample-data banner',
    tokens: [
      { name: '--brand-banner-bg', value: '#FBF5D5' },
      { name: '--brand-banner-text', value: '#4b4636' },
      { name: '--brand-banner-link', value: '#33301f' },
      { name: '--brand-banner-icon', value: '#8f8b76' },
    ],
  },
  {
    title: 'Avatar palette',
    tokens: [
      { name: '--brand-avatar-1', value: '#1F2937' },
      { name: '--brand-avatar-2', value: '#374151' },
      { name: '--brand-avatar-3', value: '#4B5563' },
      { name: '--brand-avatar-4', value: '#6b4fa0' },
      { name: '--brand-avatar-5', value: '#0e7a5f' },
      { name: '--brand-avatar-6', value: '#b4700c' },
      { name: '--brand-avatar-text', value: '#ffffff' },
    ],
  },
  {
    title: 'Theme preview swatches',
    tokens: [
      { name: '--brand-theme-light-bg', value: '#f4f7ec' },
      { name: '--brand-theme-light-dot', value: '#002427' },
      { name: '--brand-theme-dark-bg', value: '#1a2b28' },
      { name: '--brand-theme-dark-dot', value: '#aaaaaa' },
      { name: '--brand-theme-system-dot', value: '#8a978f' },
    ],
  },
  {
    title: 'Career-site preview mockup',
    tokens: [
      { name: '--brand-preview-chrome-bg', value: '#f3f4f6' },
      { name: '--brand-preview-dot-red', value: '#ff5f57' },
      { name: '--brand-preview-dot-yellow', value: '#febc2e' },
      { name: '--brand-preview-dot-green', value: '#28c840' },
      { name: '--brand-preview-text-heading', value: '#0f172a' },
      { name: '--brand-preview-text-muted', value: '#94a3b8' },
      { name: '--brand-preview-text-secondary', value: '#64748b' },
      { name: '--brand-preview-text-label', value: '#475569' },
      { name: '--brand-preview-text-body', value: '#334155' },
      { name: '--brand-preview-border', value: '#e2e8f0' },
      { name: '--brand-preview-border-card', value: '#eef2f7' },
      { name: '--brand-preview-surface-alt', value: '#f1f5f9' },
      { name: '--brand-preview-surface-section', value: '#f8fafc' },
      { name: '--brand-preview-card-shadow', value: 'rgba(15, 23, 42, 0.06)' },
    ],
  },
]

function isSwatchable(value: string) {
  return value.startsWith('#') || value.startsWith('rgba') || value.startsWith('rgb')
}

// Usage counts below are grep results across the WHOLE app/ tree (pages, layouts,
// components — not just settings/), excluding this file and the component's own definition.
const components = [
  { name: 'BrandAvatarInitials', desc: 'Round initials avatar. Rotates through the avatar palette per instance.', usedIn: ['pages/settings/account/profile.vue', 'pages/settings/team/members.vue', 'pages/settings/workflow/approvals.vue'] },
  { name: 'BrandButton', desc: 'shadcn Button + brand variants: primary-teal / primary-lime / outline / ghost / danger-ghost / danger. Sizes: sm / md / lg / icon.', usedIn: ['components/settings/SettingsConfirmDialog.vue', 'pages/settings/blocklist.vue', 'pages/settings/departments.vue', 'pages/settings/job-titles.vue', 'pages/settings/locations.vue', 'pages/settings/team/members.vue', 'pages/settings/templates/job-templates.vue', 'pages/settings/templates/whatsapp.vue', 'pages/settings/workflow/public-links.vue', 'pages/settings/workflow/stage-types.vue', 'pages/settings/workflow/tags-sources.vue'] },
  { name: 'BrandCard', desc: 'Standard content card — brand border + surface + shadow on top of shadcn Card.', usedIn: [] },
  { name: 'BrandCountBadge', desc: 'Small tabular count pill; zero-state renders in a lighter tone automatically.', usedIn: ['components/brand/BrandFavoriteItem.vue'] },
  { name: 'BrandDataTable', desc: 'Outer chrome (border, radius, shadow, horizontal scroll) for every list-view table.', usedIn: ['components/settings/SettingsTable.vue'] },
  { name: 'BrandEmptyState', desc: 'Icon + title + description + CTA slot for "no results" states.', usedIn: [] },
  { name: 'BrandFavoriteItem', desc: 'Favorite row with drag handle + count badge, for sidebar favorites lists.', usedIn: ['components/candidates/CandidatesFilters.vue'] },
  { name: 'BrandFilterGroup', desc: 'Filter group wrapper: bold title + × clear + option-row slot.', usedIn: ['components/candidates/filters/CheckboxMultiFilter.vue', 'components/candidates/filters/NumberRangeFilter.vue', 'components/candidates/filters/TextContainsFilter.vue', 'components/candidates/filters/DateRangeFilter.vue', 'components/candidates/filters/RadioFilter.vue', 'components/candidates/filters/HasTagFilter.vue', 'components/candidates/filters/EventScheduledFilter.vue'] },
  { name: 'BrandFilterOption', desc: 'Checkbox row inside a filter group — lime checkbox + label + count.', usedIn: ['components/brand/BrandFilterGroup.vue', 'components/candidates/filters/CheckboxMultiFilter.vue', 'components/candidates/filters/EventScheduledFilter.vue'] },
  { name: 'BrandLimeCheckbox', desc: 'shadcn Checkbox wrapped with lime-fill + olive-tick brand accent.', usedIn: ['components/brand/BrandFilterOption.vue', 'components/candidates/AddCandidatesModal.vue', 'components/candidates/CandidatesColumnToggle.vue', 'components/candidates/CandidatesTable.vue', 'components/candidates/CandidatesToolbar.vue', 'components/candidates/SaveSearchPopover.vue'] },
  { name: 'BrandPageTitle', desc: 'H1 + optional favorite star — every page hero.', usedIn: [] },
  { name: 'BrandSearchBar', desc: 'Icon + pill input, optional ⌘K hint — every search input. Sizes: sm / md / lg.', usedIn: ['pages/settings/team/roles.vue', 'pages/settings/templates/application-forms.vue', 'pages/settings/templates/benefits.vue', 'pages/settings/templates/email.vue', 'pages/settings/templates/evaluation-forms.vue', 'pages/settings/templates/offer.vue', 'pages/settings/templates/questionnaires.vue', 'pages/settings/templates/referral.vue'] },
  { name: 'BrandSectionTitle', desc: 'Uppercase bold section header ("FAVORITES", "FILTERS").', usedIn: ['components/candidates/CandidatesFilters.vue'] },
  { name: 'BrandTopbarActions', desc: 'Top bar action icon cluster (help / notifications / settings / account).', usedIn: ['components/layout/AppHeader.vue', 'components/layout/SettingsHeader.vue'] },
]

// Per-token file-usage counts, same grep scope as above (project-wide, all .vue files).
const tokenUsage: Record<string, number> = {
  'brand-lime': 56, 'brand-lime-tint': 41, 'brand-lime-tint-hover': 28, 'brand-lime-active-bg': 4,
  'brand-lime-active-bg-strong': 3, 'brand-olive': 11, 'brand-teal': 48, 'brand-teal-secondary': 4,
  'brand-canvas': 33, 'brand-surface-white': 40, 'brand-surface-badge': 6, 'brand-surface-hover': 22,
  'brand-surface-table-alt': 16, 'brand-text': 108, 'brand-text-secondary': 31, 'brand-text-muted': 32,
  'brand-text-subtle': 12, 'brand-text-quiet': 90, 'brand-text-disabled': 2, 'brand-text-faint': 21,
  'brand-nav-text': 28, 'brand-icon-default': 4, 'brand-icon-muted': 13, 'brand-border': 99,
  'brand-border-light': 54, 'brand-border-mid': 25, 'brand-border-divider': 3, 'brand-border-fade': 26,
  'brand-border-key': 3, 'brand-border-hairline': 9, 'brand-border-row': 10, 'brand-danger': 9,
  'brand-badge-new-bg': 3, 'brand-badge-new-text': 3, 'brand-badge-settings-bg': 17, 'brand-badge-settings-text': 15,
  'brand-settings-danger': 27, 'brand-settings-danger-hover-bg': 17, 'brand-settings-modal-bg': 6,
  'brand-settings-modal-overlay': 1, 'brand-settings-dropdown-shadow': 3, 'brand-settings-modal-shadow': 3,
  'brand-settings-toast-bg': 2, 'brand-settings-pill-bg': 2, 'brand-settings-status-active': 5,
  'brand-settings-status-neutral': 2, 'brand-dynamic-role-bg': 2, 'brand-dynamic-role-border': 2,
  'brand-dynamic-role-text': 3, 'brand-dynamic-role-icon-bg': 2, 'brand-email-highlight-bg': 10,
  'brand-email-highlight-border': 4, 'brand-status-teal-green': 2, 'brand-status-orange': 2,
  'brand-status-gray': 4, 'brand-pipeline-blue': 2, 'brand-pipeline-purple': 2, 'brand-status-approved-bg': 5,
  'brand-status-approved-text': 8, 'brand-status-pending-bg': 4, 'brand-status-pending-text': 5,
  'brand-topbar-pill-bg': 5, 'brand-topbar-pill-border': 4, 'brand-banner-bg': 2, 'brand-banner-text': 2,
  'brand-banner-link': 2, 'brand-banner-icon': 2, 'brand-avatar-1': 2, 'brand-avatar-2': 2, 'brand-avatar-3': 2,
  'brand-avatar-4': 3, 'brand-avatar-5': 2, 'brand-avatar-6': 2, 'brand-avatar-text': 4,
  'brand-theme-light-bg': 2, 'brand-theme-light-dot': 2, 'brand-theme-dark-bg': 2, 'brand-theme-dark-dot': 2,
  'brand-theme-system-dot': 2, 'brand-preview-chrome-bg': 2, 'brand-preview-dot-red': 2, 'brand-preview-dot-yellow': 2,
  'brand-preview-dot-green': 2, 'brand-preview-text-heading': 2, 'brand-preview-text-muted': 2,
  'brand-preview-text-secondary': 2, 'brand-preview-text-label': 2, 'brand-preview-text-body': 2,
  'brand-preview-border': 2, 'brand-preview-border-card': 2, 'brand-preview-surface-alt': 2,
  'brand-preview-surface-section': 2, 'brand-preview-card-shadow': 2, 'brand-scrollbar-thumb': 1,
}
function usageFor(tokenName: string) {
  return tokenUsage[tokenName.replace(/^--/, '')] ?? 0
}

const hexExceptions = [
  { file: 'pages/settings/account/profile.vue', reason: 'Google / Microsoft SSO button logos — official multi-color brand marks, not app chrome.' },
  { file: 'pages/settings/career-site.vue', reason: 'User-editable career-site theme color pickers — the hex values ARE the data the user is setting, not UI styling.' },
  { file: 'pages/settings/integrations.vue', reason: 'Syntax-highlighting colors in a read-only embed-code snippet, plus LinkedIn / Google / WhatsApp brand mark colors.' },
]

const demoChecked = ref(true)
const demoFilterA = ref(true)
const demoFilterB = ref(false)
const demoSearch = ref('')
</script>

<template>
  <div class="min-h-screen bg-[var(--brand-canvas)] text-[var(--brand-text)] py-10 px-6 md:px-12">
    <div class="max-w-[1100px] mx-auto">
      <BrandPageTitle label="Design system" />
      <p class="text-[14px] text-[var(--brand-text-secondary)] mt-1 mb-10">
        Every color token in <code class="text-[12.5px] bg-[var(--brand-surface-badge)] px-1.5 py-0.5 rounded">app/assets/css/main.css</code>
        and every reusable component in <code class="text-[12.5px] bg-[var(--brand-surface-badge)] px-1.5 py-0.5 rounded">app/components/brand/</code>,
        with real "used in" file paths grepped across the <strong>whole app/ tree</strong> — pages, layouts, and components, not just Settings.
        No hex codes live in any <code class="text-[12.5px] bg-[var(--brand-surface-badge)] px-1.5 py-0.5 rounded">.vue</code> file outside 3 documented exceptions below — every other color traces back to one of the swatches on this page.
      </p>

      <!-- ─────────────── Components ─────────────── -->
      <BrandSectionTitle label="Brand components" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <BrandCard v-for="c in components" :key="c.name" padded class="p-5">
          <div class="flex items-center justify-between gap-2 mb-1">
            <div class="text-[14px] font-bold">{{ c.name }}</div>
            <span
              class="shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full"
              :class="c.usedIn.length ? 'bg-[var(--brand-lime-active-bg)] text-[var(--brand-olive)]' : 'bg-[var(--brand-surface-badge)] text-[var(--brand-text-quiet)]'"
            >
              {{ c.usedIn.length ? `${c.usedIn.length} usage${c.usedIn.length > 1 ? 's' : ''}` : 'unused' }}
            </span>
          </div>
          <div class="text-[12.5px] text-[var(--brand-text-quiet)] mb-3 leading-relaxed">{{ c.desc }}</div>
          <div v-if="c.usedIn.length" class="flex flex-wrap gap-1.5">
            <code
              v-for="f in c.usedIn"
              :key="f"
              class="text-[10.5px] font-mono bg-[var(--brand-surface-badge)] text-[var(--brand-text-secondary)] px-1.5 py-0.5 rounded truncate max-w-full"
            >{{ f }}</code>
          </div>
          <div v-else class="text-[11.5px] italic text-[var(--brand-text-faint)]">Not yet used elsewhere — available for reuse.</div>
        </BrandCard>
      </div>

      <!-- Live examples -->
      <BrandSectionTitle label="Live examples" />
      <BrandCard padded class="p-6 mb-12 flex flex-col gap-8">
        <div>
          <div class="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--brand-text-quiet)] mb-3">BrandButton — variants</div>
          <div class="flex flex-wrap items-center gap-3">
            <BrandButton variant="primary-teal">Primary teal</BrandButton>
            <BrandButton variant="primary-lime">Primary lime</BrandButton>
            <BrandButton variant="outline">Outline</BrandButton>
            <BrandButton variant="ghost">Ghost</BrandButton>
            <BrandButton variant="danger-ghost">Danger ghost</BrandButton>
            <BrandButton variant="danger">Danger</BrandButton>
          </div>
          <div class="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--brand-text-quiet)] mb-3 mt-6">BrandButton — sizes</div>
          <div class="flex flex-wrap items-center gap-3">
            <BrandButton variant="primary-teal" size="sm">Small</BrandButton>
            <BrandButton variant="primary-teal" size="md">Medium</BrandButton>
            <BrandButton variant="primary-teal" size="lg">Large</BrandButton>
            <BrandButton variant="primary-teal" size="icon" aria-label="Icon size">
              <SearchIcon class="w-4 h-4" />
            </BrandButton>
          </div>
        </div>

        <div>
          <div class="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--brand-text-quiet)] mb-3">BrandSearchBar — sizes</div>
          <div class="max-w-sm flex flex-col gap-3">
            <BrandSearchBar v-model="demoSearch" size="sm" placeholder="Small" />
            <BrandSearchBar v-model="demoSearch" size="md" placeholder="Medium (default)" />
            <BrandSearchBar v-model="demoSearch" size="lg" placeholder="Large" hint="⌘K" />
          </div>
        </div>

        <div>
          <div class="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--brand-text-quiet)] mb-3">BrandAvatarInitials + BrandCountBadge</div>
          <div class="flex items-center gap-4">
            <BrandAvatarInitials initials="AH" size="sm" />
            <BrandAvatarInitials initials="MS" size="md" />
            <BrandAvatarInitials initials="RT" size="lg" />
            <BrandCountBadge :count="14" />
            <BrandCountBadge :count="0" />
          </div>
        </div>

        <div>
          <div class="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--brand-text-quiet)] mb-3">BrandLimeCheckbox</div>
          <div class="flex items-center gap-4">
            <BrandLimeCheckbox v-model="demoChecked" />
            <BrandLimeCheckbox :model-value="false" />
            <BrandLimeCheckbox :model-value="true" disabled />
          </div>
        </div>

        <div>
          <div class="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--brand-text-quiet)] mb-3">BrandFilterGroup + BrandFilterOption</div>
          <div class="max-w-xs">
            <BrandFilterGroup title="Department" active>
              <BrandFilterOption label="Engineering" :count="12" v-model="demoFilterA" />
              <BrandFilterOption label="Design" :count="3" v-model="demoFilterB" />
              <BrandFilterOption label="Sales" :count="0" :model-value="false" />
            </BrandFilterGroup>
          </div>
        </div>

        <div>
          <div class="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--brand-text-quiet)] mb-3">BrandFavoriteItem</div>
          <div class="max-w-xs border border-[var(--brand-border-light)] rounded-lg overflow-hidden">
            <BrandFavoriteItem label="Senior engineers" :count="8" :icon="Star" active />
            <BrandFavoriteItem label="Recent applicants" :count="23" :icon="Users" />
          </div>
        </div>

        <div>
          <div class="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--brand-text-quiet)] mb-3">BrandEmptyState</div>
          <div class="border border-dashed border-[var(--brand-border)] rounded-lg">
            <BrandEmptyState :icon="SearchIcon" title="No results" description="Try adjusting your filters or search term." />
          </div>
        </div>
      </BrandCard>

      <!-- ─────────────── Color tokens ─────────────── -->
      <BrandSectionTitle label="Color tokens" />
      <div class="flex flex-col gap-8">
        <div v-for="group in tokenGroups" :key="group.title">
          <div class="text-[13px] font-bold text-[var(--brand-text-secondary)] mb-3">{{ group.title }}</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <div
              v-for="t in group.tokens"
              :key="t.name"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-white)]"
            >
              <span
                class="w-7 h-7 rounded-md border border-[var(--brand-border-mid)] shrink-0"
                :style="isSwatchable(t.value) ? { background: t.value } : { background: `var(${t.name})` }"
              />
              <div class="min-w-0 flex-1">
                <div class="text-[12.5px] font-semibold font-mono truncate">{{ t.name }}</div>
                <div class="text-[11.5px] text-[var(--brand-text-quiet)] font-mono truncate">{{ t.value }}</div>
              </div>
              <span
                class="shrink-0 text-[10.5px] font-bold font-mono px-1.5 py-0.5 rounded"
                :class="usageFor(t.name) ? 'bg-[var(--brand-surface-badge)] text-[var(--brand-text-secondary)]' : 'bg-[var(--brand-surface-badge)] text-[var(--brand-text-faint)]'"
              >{{ usageFor(t.name) }}×</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─────────────── Hardcoded-hex exceptions ─────────────── -->
      <BrandSectionTitle label="Hardcoded-color exceptions" />
      <p class="text-[12.5px] text-[var(--brand-text-quiet)] mt-2 mb-4 leading-relaxed max-w-[720px]">
        A project-wide grep for hex/rgb literals across every <code class="font-mono">.vue</code> file (outside <code class="font-mono">main.css</code> and this page) found exactly 3 files. Each is a legitimate exception, not a token-system violation:
      </p>
      <div class="grid grid-cols-1 gap-2.5 mb-4">
        <div
          v-for="e in hexExceptions"
          :key="e.file"
          class="flex items-start gap-3 px-3.5 py-3 rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-white)]"
        >
          <code class="text-[12px] font-mono font-semibold text-[var(--brand-text-secondary)] shrink-0">{{ e.file }}</code>
          <span class="text-[12px] text-[var(--brand-text-quiet)] leading-relaxed">{{ e.reason }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
