# /v2 Alternate Sidebar Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a second, fully clickable version of the app's main navigation shell — reachable only under `/v2/...` — matching a new dark-themed sidebar design pulled from Figma, while leaving every existing route (`/dashboard`, `/candidates`, `/settings/*`, etc.) completely unchanged.

**Architecture:** Two new Nuxt layouts (`v2.vue` for the main shell, `v2-settings.vue` for Settings nested inside it) plus one new component (`AppSidebarV2.vue`). Existing page logic is reused, not duplicated: the two real pages (`candidates/index.vue`, `candidates/[id].vue`) get their bodies extracted into standalone components rendered by both the old and new page files; the 32 Settings pages are reused unmodified via a Nuxt `pages:extend` build hook that clones each `/settings/**` route to `/v2/settings/**` pointing at the same file with a different layout.

**Tech Stack:** Nuxt 4 (Vue 3 `<script setup>`, file-based routing), Pinia (`useSidebarStore`), Tailwind v4 with CSS custom properties for all colors, lucide-vue-next icons.

## Global Constraints

- No hex codes in `.vue` files — every color is a `var(--brand-*)` CSS custom property defined in `app/assets/css/main.css` (enforced by an existing ESLint rule in this repo).
- Import icons from `lucide-vue-next` by name only.
- `/settings/*`, `/dashboard`, `/candidates`, `/jobs`, `/talent-pools`, `/analytics`, `/requisitions`, `/workforce` must render **identically** to their current behavior after this plan — verified per-task, not just at the end.
- New `/v2/*` routes reuse existing page logic; no forked copies of business logic.

---

## Task 1: Add v2 dark-sidebar CSS tokens

**Files:**
- Modify: `app/assets/css/main.css:44` (insert after the `--brand-olive` line, inside the existing "Brand accent" token block)

**Interfaces:**
- Produces: `--brand-v2-sidebar-bg`, `--brand-v2-nav-text` — consumed by `AppSidebarV2.vue` (Task 5). The active-pill state reuses the *existing* `--brand-lime` (background) and `--brand-olive` (text) tokens — no new tokens needed for that.

- [ ] **Step 1: Add the two new tokens**

In `app/assets/css/main.css`, find this exact block (currently lines 38-44):

```css
  /* Brand accent */
  --brand-lime: #C9FD13;
  --brand-lime-tint: #f4f7ec;                     /* subtle hover / active bg */
  --brand-lime-tint-hover: #f4f7ef;               /* slightly warmer hover */
  --brand-lime-active-bg: rgba(201, 253, 19, 0.28);
  --brand-lime-active-bg-strong: rgba(201, 253, 19, 0.38);
  --brand-olive: #3f5600;                         /* text on lime */
```

Replace it with:

```css
  /* Brand accent */
  --brand-lime: #C9FD13;
  --brand-lime-tint: #f4f7ec;                     /* subtle hover / active bg */
  --brand-lime-tint-hover: #f4f7ef;               /* slightly warmer hover */
  --brand-lime-active-bg: rgba(201, 253, 19, 0.28);
  --brand-lime-active-bg-strong: rgba(201, 253, 19, 0.38);
  --brand-olive: #3f5600;                         /* text on lime */

  /* /v2 dark sidebar (sampled from the Figma reference, node 465:14328) */
  --brand-v2-sidebar-bg: #2b2a26;                 /* near-black olive, full-height dark nav */
  --brand-v2-nav-text: #f2f4ef;                   /* inactive + active nav label text (near-white) */
```

- [ ] **Step 2: Verify no build errors**

Run: `npm run dev` (or, if already running, just save the file) from `recruitera-v2/`.
Expected: No terminal errors. Tailwind/Nuxt hot-reloads without complaint about the new CSS custom properties (they're plain `:root`-scoped vars, not Tailwind config, so no restart is required).

- [ ] **Step 3: Commit**

```bash
git add app/assets/css/main.css
git commit -m "feat(v2-sidebar): add dark sidebar CSS tokens"
```

---

## Task 2: Add `hideLogo` prop to `AppHeader.vue`

**Context:** The new `v2.vue` layout (Task 6) puts the logo inside `AppSidebarV2` instead of the header, so `AppHeader`'s left-side logo/wordmark/trial-pill group needs to be hideable. `SettingsHeader.vue` already has no logo section, so it needs no change.

**Files:**
- Modify: `app/components/layout/AppHeader.vue`

**Interfaces:**
- Produces: `AppHeader` prop `hideLogo?: boolean` (default `false`) — consumed by `v2.vue` layout (Task 6), passing `true`. `default.vue` layout keeps calling `<AppHeader />` with no props, so `/dashboard`, `/candidates`, etc. are unaffected.

- [ ] **Step 1: Add the prop and wrap the logo group**

Replace the full contents of `app/components/layout/AppHeader.vue` with:

```vue
<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { BrandSearchBar, BrandTopbarActions } from '~/components/brand'

withDefaults(defineProps<{
  /** Hide the logo/wordmark/trial-pill group — used by the v2 shell, where the logo lives in the sidebar instead. */
  hideLogo?: boolean
}>(), {
  hideLogo: false,
})
</script>

<template>
  <div class="flex flex-1 items-center gap-4">
    <!-- Left group: logo + Recruitera + Your trial pill -->
    <div v-if="!hideLogo" class="flex items-center gap-3 shrink-0">
      <div class="w-[30px] h-[30px] bg-[var(--brand-teal)] rounded-lg flex items-center justify-center font-bold text-[15px] text-[var(--brand-lime)]">R</div>
      <span class="font-bold text-[17px] tracking-tight text-[var(--brand-text)] whitespace-nowrap">Recruitera</span>
      <button class="inline-flex items-center gap-2 h-9 rounded-lg bg-[var(--brand-topbar-pill-bg)] border border-[var(--brand-topbar-pill-border)] px-3 text-[13px] font-semibold text-[var(--brand-text)] hover:brightness-95 transition whitespace-nowrap">
        Your trial
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Middle: search (centered, max 560px) -->
    <div class="flex-1 flex justify-center">
      <div class="w-full max-w-[560px]">
        <BrandSearchBar placeholder="Search, jump to, and more" hint="⌘ K" />
      </div>
    </div>

    <!-- Right: icon buttons + avatar -->
    <BrandTopbarActions />
  </div>
</template>
```

- [ ] **Step 2: Verify `/dashboard` is unchanged**

Run the dev server, open `http://localhost:3100/dashboard` (or whatever port is configured) in the browser, confirm the header still shows the "R" logo, "Recruitera" wordmark, and "Your trial" pill exactly as before.

- [ ] **Step 3: Commit**

```bash
git add app/components/layout/AppHeader.vue
git commit -m "feat(v2-sidebar): add hideLogo prop to AppHeader"
```

---

## Task 3: Extract `CandidatesIndexPage` and wire `/candidates` + `/v2/candidates`

**Files:**
- Create: `app/components/candidates/CandidatesIndexPage.vue`
- Modify: `app/pages/candidates/index.vue` (becomes a thin wrapper)
- Create: `app/pages/v2/candidates/index.vue`

**Interfaces:**
- Produces: `CandidatesIndexPage` component (no props) — a direct, unmodified move of the current `candidates/index.vue` body. Consumed by both page wrapper files below.

- [ ] **Step 1: Create the extracted component**

Create `app/components/candidates/CandidatesIndexPage.vue` with this exact content (the current `candidates/index.vue` body, with `definePageMeta` removed — layout selection now happens in the two thin page wrappers, not in this component):

```vue
<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { BrandPageTitle, BrandSearchBar } from '~/components/brand'
import ErrorBoundary from '~/components/ErrorBoundary.vue'
import CandidatesFilters from '~/components/candidates/CandidatesFilters.vue'
import CandidatesTable from '~/components/candidates/CandidatesTable.vue'
import CandidatesToolbar from '~/components/candidates/CandidatesToolbar.vue'
import CandidatesTableSkeleton from '~/components/candidates/CandidatesTableSkeleton.vue'
import CandidatesEmptyState from '~/components/candidates/CandidatesEmptyState.vue'
import CandidatesPerPage from '~/components/candidates/CandidatesPerPage.vue'
import SampleDataBanner from '~/components/candidates/SampleDataBanner.vue'
import { useCandidates } from '~/composables/useCandidates'
import { useCandidateFilters } from '~/composables/useCandidateFilters'
import { useCandidatesStore } from '~/stores/candidates.store'
// Heavy / infrequently opened: lazy-loaded so JS ships only when the star is clicked.
const SaveSearchPopover = defineAsyncComponent(() => import('~/components/candidates/SaveSearchPopover.vue'))

const store = useCandidatesStore()
const { filters, setFilter, clearFilters, hasActiveFilters } = useCandidateFilters()

// 500ms debounce — search hits the API, dataset can be 100k rows
const searchInput = ref(filters.value.search)
const debouncedSearch = refDebounced(searchInput, 500)
watch(debouncedSearch, (v) => {
  if (v !== filters.value.search) setFilter('search', v)
})
// Reflect URL → input (back/forward)
watch(() => filters.value.search, (v) => {
  if (v !== searchInput.value) searchInput.value = v
})

// Vue Query keeps prior rows visible while the new page/filter loads
const { data, isFetching } = useCandidates(computed(() => ({ ...filters.value })))
const candidates = computed(() => data.value?.data ?? [])
const total      = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 1)
const pageIds    = computed(() => candidates.value.map(c => c.id))

// Skeleton condition — matches the Recruitee/Tellent reference (skeleton on
// every fetch, not the placeholderData "dim previous data" pattern).
//
// Vue Query's `isLoading` alone is unreliable here: `placeholderData:
// keepPreviousData` collapses `isLoading` to false as soon as any placeholder
// exists, and Nuxt's payload extraction can seed the query cache before the
// component mounts. Using `isFetching` guarantees the skeleton renders while
// the API call is in flight, which is the loading state the design actually
// wants to communicate.
const showSkeleton = computed(() => isFetching.value)

// Clear selection on any filter change — bulk-action on wrong candidates is a real bug
watch(filters, () => store.clearSelection(), { deep: true })

function onPageChange(p: number) {
  setFilter('page', p)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function onPerPageChange(n: number) {
  setFilter('perPage', n)
  setFilter('page', 1)
}
</script>

<template>
  <div class="flex h-full overflow-hidden bg-[var(--brand-canvas)]">
    <ErrorBoundary>
      <CandidatesFilters />
    </ErrorBoundary>

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--brand-surface-white)] border-t border-[var(--brand-border)]">
      <!-- Page header -->
      <div class="flex items-center gap-2 px-6 pt-6 pb-4">
        <BrandPageTitle label="Candidates" />
        <SaveSearchPopover @save="(p) => console.log('Saved search', p)" />
      </div>

      <!-- Search -->
      <div class="px-6 pb-3">
        <BrandSearchBar
          v-model="searchInput"
          size="lg"
          placeholder="Search candidates by anything or use keywords e.g. John AND manager"
        />
      </div>

      <!-- Toolbar (transforms on selection) -->
      <div class="px-6 pb-2">
        <CandidatesToolbar
          :page-ids="pageIds"
          :total="total"
          :current-page="filters.page"
          :total-pages="totalPages"
          :per-page="filters.perPage"
          @page-change="onPageChange"
        />
      </div>

      <!-- Sample data info banner -->
      <div class="px-6 pb-3">
        <SampleDataBanner @remove="console.log('TODO: wipe sample data')" />
      </div>

      <!-- Table area -->
      <div class="flex-1 overflow-auto px-6 pb-3">
        <ErrorBoundary>
          <CandidatesTableSkeleton v-if="showSkeleton" />
          <CandidatesEmptyState
            v-else-if="candidates.length === 0"
            :has-filters="hasActiveFilters"
            @clear="clearFilters()"
          />
          <div
            v-else
            :class="isFetching ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'"
          >
            <CandidatesTable :candidates="candidates" :is-fetching="isFetching" />

            <!-- Per-page selector + prev/next, scrolls with the table -->
            <CandidatesPerPage
              :per-page="filters.perPage"
              :current-page="filters.page"
              :total-pages="totalPages"
              @change="onPerPageChange"
              @page-change="onPageChange"
            />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Replace `app/pages/candidates/index.vue` with a thin wrapper**

```vue
<script setup lang="ts">
import CandidatesIndexPage from '~/components/candidates/CandidatesIndexPage.vue'

definePageMeta({ layout: 'default' })
</script>

<template>
  <CandidatesIndexPage />
</template>
```

- [ ] **Step 3: Create `app/pages/v2/candidates/index.vue`**

```vue
<script setup lang="ts">
import CandidatesIndexPage from '~/components/candidates/CandidatesIndexPage.vue'

definePageMeta({ layout: 'v2' })
</script>

<template>
  <CandidatesIndexPage />
</template>
```

(`layout: 'v2'` references the layout built in Task 6 — this page will render with the current `default.vue`-equivalent fallback until Task 6 lands; that's fine, this task is about the extraction being correct, not the final visual.)

- [ ] **Step 4: Verify `/candidates` is pixel-identical to before**

Run the dev server, open `http://localhost:3100/candidates`. Confirm: table loads with data, search box works, filters sidebar opens, pagination works, no console errors. Compare against `git stash` (stash this change, reload, compare, then `git stash pop`) if any doubt remains.

- [ ] **Step 5: Commit**

```bash
git add app/components/candidates/CandidatesIndexPage.vue app/pages/candidates/index.vue app/pages/v2/candidates/index.vue
git commit -m "refactor(candidates): extract CandidatesIndexPage, wire /v2/candidates"
```

---

## Task 4: Extract `CandidateProfilePage` and wire `/candidates/[id]` + `/v2/candidates/[id]`

**Context:** `app/pages/candidates/[id].vue` has two hardcoded `/candidates` path references (`close()` and `goToCandidate()`) that must become route-aware so the extracted component works correctly under both `/candidates/:id` and `/v2/candidates/:id`.

**Files:**
- Create: `app/components/candidates/CandidateProfilePage.vue`
- Modify: `app/pages/candidates/[id].vue` (becomes a thin wrapper)
- Create: `app/pages/v2/candidates/[id].vue`

**Interfaces:**
- Consumes: nothing new — same composables/components as the current file.
- Produces: `CandidateProfilePage` component (no props) — consumed by both page wrapper files below.

- [ ] **Step 1: Create the extracted component**

Create `app/components/candidates/CandidateProfilePage.vue`. Copy the **entire current contents** of `app/pages/candidates/[id].vue` into it, then apply these two exact changes:

Remove the `definePageMeta` line (layout selection now happens in the page wrappers):

```ts
// DELETE this line:
definePageMeta({ layout: 'default' })
```

Add a `basePath` computed right after `const id = computed(...)` so both routes work, and use it in `close()` and `goToCandidate()`:

```ts
// BEFORE:
const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))

const { data: profile, isLoading } = useCandidateProfile(id)

function close() {
  router.push('/candidates')
}

// AFTER:
const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))
// This component renders at both /candidates/:id and /v2/candidates/:id —
// derive the list route from whichever prefix is currently active so
// close/prev/next never jump the user out of the shell they're in.
const basePath = computed(() => route.path.startsWith('/v2/') ? '/v2/candidates' : '/candidates')

const { data: profile, isLoading } = useCandidateProfile(id)

function close() {
  router.push(basePath.value)
}
```

And:

```ts
// BEFORE:
function goToCandidate(targetId: string | null) {
  if (!targetId) return
  router.push(`/candidates/${targetId}`)
}

// AFTER:
function goToCandidate(targetId: string | null) {
  if (!targetId) return
  router.push(`${basePath.value}/${targetId}`)
}
```

Every other line (the full 900+ line template and the rest of the script block covering tags, contact editing, tasks, notes, AI criteria, the resize handle, etc.) is copied over **verbatim, unchanged**.

- [ ] **Step 2: Replace `app/pages/candidates/[id].vue` with a thin wrapper**

```vue
<script setup lang="ts">
import CandidateProfilePage from '~/components/candidates/CandidateProfilePage.vue'

definePageMeta({ layout: 'default' })
</script>

<template>
  <CandidateProfilePage />
</template>
```

- [ ] **Step 3: Create `app/pages/v2/candidates/[id].vue`**

```vue
<script setup lang="ts">
import CandidateProfilePage from '~/components/candidates/CandidateProfilePage.vue'

definePageMeta({ layout: 'v2' })
</script>

<template>
  <CandidateProfilePage />
</template>
```

- [ ] **Step 4: Verify `/candidates/:id` is unchanged, and the two hardcoded-path fixes are correct**

Run the dev server:
1. Open `http://localhost:3100/candidates`, click any row → confirm it opens `/candidates/<id>` with the full profile (tabs, resize handle, notes, tasks all work as before).
2. Click the close (X) button → confirm it navigates back to `/candidates` (not `/v2/candidates`).
3. Click the prev/next candidate chevrons → confirm the URL stays under `/candidates/...`.
4. Once Task 3 and Task 6 have landed, repeat all three checks at `/v2/candidates` / `/v2/candidates/:id` and confirm close/prev/next stay under `/v2/candidates/...`.

- [ ] **Step 5: Commit**

```bash
git add app/components/candidates/CandidateProfilePage.vue app/pages/candidates/\[id\].vue app/pages/v2/candidates/\[id\].vue
git commit -m "refactor(candidates): extract CandidateProfilePage, wire /v2/candidates/[id]"
```

---

## Task 5: Build `AppSidebarV2.vue`

**Files:**
- Create: `app/components/layout/AppSidebarV2.vue`

**Interfaces:**
- Consumes: `useSidebarStore` (`app/stores/sidebar.store.ts` — already exists, exposes `isOpen`, `isMobile`, `toggle`), `useMediaQuery` from `@vueuse/core` (same pattern as `AppSidebar.vue`).
- Produces: `AppSidebarV2` component (no props) — consumed by `v2.vue` (Task 6) and `v2-settings.vue` (Task 9).

- [ ] **Step 1: Create the component**

```vue
<!--
  Dark full-height sidebar for the /v2 shell. Ported from the Figma
  reference (New-Dashboard, node 465:14328) — full-height dark nav with the
  logo + collapse toggle built into the sidebar itself (unlike AppSidebar.vue,
  where the logo lives in AppHeader), a different nav item set, and a
  user-identity chip pinned to the bottom.
-->
<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import {
  LayoutGrid, Users, Users2, Briefcase, ClipboardList, BarChart3, Calendar,
  LineChart, Settings, FileText, ChevronsLeft, ChevronsRight,
} from 'lucide-vue-next'
import { BrandAvatarInitials } from '~/components/brand'
import { useSidebarStore } from '~/stores/sidebar.store'

const route = useRoute()
const sidebar = useSidebarStore()

// Same collapse-on-narrow-viewport behavior as AppSidebar.vue.
const isNarrowViewport = useMediaQuery('(max-width: 900px)')
watchEffect(() => { sidebar.isMobile = isNarrowViewport.value })
const effectiveOpen = computed(() => !sidebar.isMobile && sidebar.isOpen)

const navItems = [
  { label: 'Overview',           to: '/v2/dashboard',    icon: LayoutGrid },
  { label: 'Candidates',         to: '/v2/candidates',   icon: Users },
  { label: 'Talent Pools',       to: '/v2/talent-pools', icon: Users2 },
  { label: 'Jobs',                to: '/v2/jobs',         icon: Briefcase },
  { label: 'Requisitions',       to: '/v2/requisitions', icon: ClipboardList },
  { label: 'Workforce Planning', to: '/v2/workforce',    icon: BarChart3 },
  { label: 'Time Schedule',      to: '/v2/schedule',     icon: Calendar },
  { label: 'Analytics',          to: '/v2/analytics',    icon: LineChart },
]
const bottomItems = [
  { label: 'Settings',     to: '/v2/settings', icon: Settings },
  { label: 'Help Center',  to: '/v2/help',     icon: FileText },
]

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <nav
    class="shrink-0 flex flex-col h-full bg-[var(--brand-v2-sidebar-bg)] transition-[width] duration-200 ease-out px-2.5 py-2.5 gap-0.5"
    :class="effectiveOpen ? 'w-[212px]' : 'w-[64px]'"
  >
    <!-- Logo + collapse toggle -->
    <div class="flex items-center justify-between h-9 px-1 mb-2">
      <div class="flex items-center gap-2 min-w-0">
        <span class="w-[26px] h-[26px] shrink-0 rounded-md bg-[var(--brand-lime)] text-[var(--brand-teal)] font-bold text-[13px] inline-flex items-center justify-center">R</span>
        <span v-if="effectiveOpen" class="font-bold text-[15px] text-[var(--brand-v2-nav-text)] whitespace-nowrap truncate">recruitera</span>
      </div>
      <button
        class="w-6 h-6 shrink-0 inline-flex items-center justify-center rounded text-[var(--brand-v2-nav-text)]/70 hover:text-[var(--brand-v2-nav-text)] hover:bg-white/[.08] transition-colors"
        :title="effectiveOpen ? 'Hide sidebar' : 'Show sidebar'"
        @click="sidebar.toggle"
      >
        <component :is="effectiveOpen ? ChevronsLeft : ChevronsRight" class="w-4 h-4" stroke-width="1.8" />
      </button>
    </div>

    <!-- Primary nav -->
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      :title="!effectiveOpen ? item.label : undefined"
      class="flex items-center gap-3 h-9 px-2.5 rounded-lg text-[13.5px] transition-colors whitespace-nowrap overflow-hidden"
      :class="isActive(item.to)
        ? 'bg-[var(--brand-lime)] text-[var(--brand-olive)] font-bold'
        : 'text-[var(--brand-v2-nav-text)] font-semibold hover:bg-white/[.08]'"
    >
      <component :is="item.icon" class="w-[19px] h-[19px] shrink-0" :stroke-width="isActive(item.to) ? 1.9 : 1.7" />
      <span v-if="effectiveOpen">{{ item.label }}</span>
    </NuxtLink>

    <!-- Spacer pushes Settings/Help/user chip to the bottom -->
    <div class="flex-1" />

    <NuxtLink
      v-for="item in bottomItems"
      :key="item.to"
      :to="item.to"
      :title="!effectiveOpen ? item.label : undefined"
      class="flex items-center gap-3 h-9 px-2.5 rounded-lg text-[13.5px] transition-colors whitespace-nowrap overflow-hidden"
      :class="isActive(item.to)
        ? 'bg-[var(--brand-lime)] text-[var(--brand-olive)] font-bold'
        : 'text-[var(--brand-v2-nav-text)] font-semibold hover:bg-white/[.08]'"
    >
      <component :is="item.icon" class="w-[19px] h-[19px] shrink-0" :stroke-width="isActive(item.to) ? 1.9 : 1.7" />
      <span v-if="effectiveOpen">{{ item.label }}</span>
    </NuxtLink>

    <!-- User identity chip -->
    <div class="flex items-center gap-2.5 h-9 px-2.5 mt-1 border-t border-white/10 pt-3 whitespace-nowrap overflow-hidden">
      <BrandAvatarInitials initials="MA" size="xs" bg="rgba(255,255,255,0.12)" color="var(--brand-v2-nav-text)" />
      <span v-if="effectiveOpen" class="text-[13px] font-semibold text-[var(--brand-v2-nav-text)] truncate">Mahmoud Ash</span>
    </div>
  </nav>
</template>
```

- [ ] **Step 2: Verify it renders in isolation**

This component isn't wired into any layout yet — full visual verification happens in Task 6's step. For now, run `npx nuxi typecheck` (or just let the dev server's Vue compiler check it on save) and confirm there are no template/type errors reported in the terminal.

- [ ] **Step 3: Commit**

```bash
git add app/components/layout/AppSidebarV2.vue
git commit -m "feat(v2-sidebar): add AppSidebarV2 component"
```

---

## Task 6: Build the `v2.vue` layout and wire it up

**Files:**
- Create: `app/layouts/v2.vue`

**Interfaces:**
- Consumes: `AppSidebarV2` (Task 5), `AppHeader` with `hideLogo` (Task 2), `TrialBanner` (existing, unchanged).

- [ ] **Step 1: Create the layout**

```vue
<script setup lang="ts">
import AppSidebarV2 from '~/components/layout/AppSidebarV2.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import TrialBanner from '~/components/layout/TrialBanner.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[var(--brand-canvas)]">
    <AppSidebarV2 />
    <div class="flex flex-col flex-1 min-w-0">
      <TrialBanner />
      <header class="flex items-center h-[52px] bg-[var(--brand-canvas)] px-4 gap-4 flex-none border-b border-[var(--brand-border-light)]">
        <AppHeader hide-logo />
      </header>
      <main class="flex-1 overflow-auto min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify `/v2/candidates` renders the new shell**

Run the dev server, open `http://localhost:3100/v2/candidates`. Confirm:
- Dark sidebar renders on the left with the "R" logo + "recruitera" wordmark, collapse toggle, 8 nav items, Settings/Help Center + user chip at the bottom.
- "Candidates" is highlighted active (lime pill).
- Header shows only the search bar + right-side icon cluster (no duplicate logo).
- The candidates table, filters, and search all work exactly as they do at `/candidates`.
- Click the collapse toggle — sidebar shrinks to icon-only width and the labels disappear; toggle again to confirm it re-expands.
- Open a candidate profile from `/v2/candidates` (click a row) — confirm it opens at `/v2/candidates/:id` with the dark sidebar still visible behind the profile overlay, and the close button returns to `/v2/candidates` (not `/candidates`).

- [ ] **Step 3: Commit**

```bash
git add app/layouts/v2.vue
git commit -m "feat(v2-sidebar): add v2 layout"
```

---

## Task 7: Add the remaining `/v2` placeholder pages

**Files:**
- Create: `app/pages/v2/dashboard.vue`
- Create: `app/pages/v2/talent-pools.vue`
- Create: `app/pages/v2/jobs/index.vue`
- Create: `app/pages/v2/requisitions.vue`
- Create: `app/pages/v2/workforce.vue`
- Create: `app/pages/v2/analytics.vue`
- Create: `app/pages/v2/schedule.vue`
- Create: `app/pages/v2/help.vue`

**Interfaces:** none — these are static, self-contained pages using the layout from Task 6.

- [ ] **Step 1: Create the six pages that mirror existing placeholder routes**

Each of these five files gets **identical** content (only the file path differs), matching the existing `app/pages/dashboard.vue` / `talent-pools.vue` / `jobs/index.vue` / `requisitions.vue` / `workforce.vue` / `analytics.vue` pattern but with `layout: 'v2'`:

`app/pages/v2/dashboard.vue`, `app/pages/v2/talent-pools.vue`, `app/pages/v2/jobs/index.vue`, `app/pages/v2/requisitions.vue`, `app/pages/v2/workforce.vue`, `app/pages/v2/analytics.vue`:

```vue
<script setup lang="ts">
definePageMeta({ layout: "v2" })
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-center h-64 rounded-lg border border-dashed border-[var(--brand-border)]">
      <p class="text-sm text-[var(--brand-text-quiet)]">Coming soon</p>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create the two genuinely new pages**

`app/pages/v2/schedule.vue` (Time Schedule — no equivalent exists under `/settings` today):

```vue
<script setup lang="ts">
definePageMeta({ layout: "v2" })
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-center h-64 rounded-lg border border-dashed border-[var(--brand-border)]">
      <p class="text-sm text-[var(--brand-text-quiet)]">Coming soon</p>
    </div>
  </div>
</template>
```

`app/pages/v2/help.vue` (Help Center):

```vue
<script setup lang="ts">
definePageMeta({ layout: "v2" })
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-center h-64 rounded-lg border border-dashed border-[var(--brand-border)]">
      <p class="text-sm text-[var(--brand-text-quiet)]">Coming soon</p>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Verify every nav item in `AppSidebarV2` resolves**

Run the dev server, open `http://localhost:3100/v2/dashboard` and click through every item in the dark sidebar (Overview, Candidates, Talent Pools, Jobs, Requisitions, Workforce Planning, Time Schedule, Analytics, Help Center). Confirm each one loads without a 404 and shows the "Coming soon" placeholder (except Candidates, which shows the real table) with the correct nav item highlighted active. Don't click Settings yet — that's wired in Task 9.

- [ ] **Step 4: Commit**

```bash
git add app/pages/v2/dashboard.vue app/pages/v2/talent-pools.vue app/pages/v2/jobs/index.vue app/pages/v2/requisitions.vue app/pages/v2/workforce.vue app/pages/v2/analytics.vue app/pages/v2/schedule.vue app/pages/v2/help.vue
git commit -m "feat(v2-sidebar): add remaining /v2 placeholder pages"
```

---

## Task 8: Add `groups` and `showBackLink` props to `SettingsSidebar.vue`

**Context:** `/settings/*` (existing app) must keep showing today's 5-group nav with the "Back to app" link, unchanged. `/v2/settings/*` needs a different group structure and no "Back to app" link (the dark sidebar is always visible instead). Making both props with the current behavior as the default means `/settings/*` requires zero behavior change.

**Files:**
- Modify: `app/components/layout/SettingsSidebar.vue`

**Interfaces:**
- Produces: `SettingsSidebar` props `groups?: Group[]` (default: today's hardcoded 5-group array) and `showBackLink?: boolean` (default `true`). The `Group`/`Child` types are exported from this file so Task 9 can import them.
- Consumed by: `settings.vue` layout (existing, calls `<SettingsSidebar />` with no props — unaffected) and `v2-settings.vue` layout (Task 9, passes both props).

- [ ] **Step 1: Convert the hardcoded `groups` const into a prop with that same array as its default**

Replace the full contents of `app/components/layout/SettingsSidebar.vue` with:

```vue
<!--
  Full Settings nav — 5 groups / 29 routes, ported from settings.html's
  accordion structure. Open/closed accordion state persists via
  useLocalStorage; the group containing the current route auto-opens.

  `groups` and `showBackLink` are props (not hardcoded) so the /v2 shell can
  render a different group structure without a "Back to app" link, while
  `/settings/*` (which calls this with no props) keeps today's exact
  behavior via the defaults below.
-->
<script setup lang="ts">
import { ChevronDown, Building2, Workflow, LayoutTemplate, Users2, User, ArrowLeft } from 'lucide-vue-next'
import { useLocalStorage } from '@vueuse/core'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'

const route = useRoute()

export type Child = { label: string; to: string }
export type Group = { key: string; label: string; icon: typeof Building2; children: Child[] }

const DEFAULT_GROUPS: Group[] = [
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

const props = withDefaults(defineProps<{
  groups?: Group[]
  showBackLink?: boolean
}>(), {
  groups: () => DEFAULT_GROUPS,
  showBackLink: true,
})

const openKeys = useLocalStorage<string[]>('settings-sidebar-open', [props.groups[0]?.key ?? 'company'])

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
  const g = props.groups.find(g => g.children.some(c => route.path === c.to || route.path.startsWith(c.to + '/')))
  if (g && !openKeys.value.includes(g.key)) {
    openKeys.value = [...openKeys.value, g.key]
  }
})

const isChildActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <aside class="w-[232px] shrink-0 flex flex-col bg-[var(--brand-canvas)] overflow-y-auto px-2.5 py-4">
    <NuxtLink
      v-if="showBackLink"
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
```

(The only behavioral change vs. today: `openKeys`'s localStorage seed now reads `props.groups[0]?.key` instead of the string literal `'company'`. Since the default `groups` prop's first entry is still `{ key: 'company', ... }`, this is a no-op for `/settings/*`.)

- [ ] **Step 2: Verify `/settings/*` is completely unchanged**

Run the dev server, open `http://localhost:3100/settings/company`. Confirm: "Back to app" link is present and works, all 5 groups (Company, Workflow, Templates, Team & Roles, My Account) render with the same 29 routes as before, the Company group auto-opens, clicking other groups still expands/collapses correctly, and the active route is still highlighted.

- [ ] **Step 3: Commit**

```bash
git add app/components/layout/SettingsSidebar.vue
git commit -m "refactor(settings): add groups/showBackLink props to SettingsSidebar"
```

---

## Task 9: Build `v2-settings.vue` layout, v2 settings groups data, and 3 new placeholder settings pages

**Files:**
- Create: `app/pages/v2/settings/bonus-programs.vue`
- Create: `app/pages/v2/settings/workflow/conflict-management.vue`
- Create: `app/pages/v2/settings/workflow/smart-distribution.vue`
- Create: `app/layouts/v2-settings.vue`

**Interfaces:**
- Consumes: `SettingsSidebar`'s exported `Group`/`Child` types (Task 8), `AppSidebarV2` (Task 5), `SettingsHeader` (existing, unchanged — it has no logo section so needs no `hideLogo`-style prop).

- [ ] **Step 1: Create the 3 new placeholder settings pages**

`app/pages/v2/settings/bonus-programs.vue`:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'v2-settings' })
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-center h-64 rounded-lg border border-dashed border-[var(--brand-border)]">
      <p class="text-sm text-[var(--brand-text-quiet)]">Coming soon</p>
    </div>
  </div>
</template>
```

`app/pages/v2/settings/workflow/conflict-management.vue`:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'v2-settings' })
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-center h-64 rounded-lg border border-dashed border-[var(--brand-border)]">
      <p class="text-sm text-[var(--brand-text-quiet)]">Coming soon</p>
    </div>
  </div>
</template>
```

`app/pages/v2/settings/workflow/smart-distribution.vue`:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'v2-settings' })
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-center h-64 rounded-lg border border-dashed border-[var(--brand-border)]">
      <p class="text-sm text-[var(--brand-text-quiet)]">Coming soon</p>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create the `v2-settings.vue` layout with its own groups data**

```vue
<script setup lang="ts">
import { Building2, Workflow, LayoutTemplate, Users2 } from 'lucide-vue-next'
import AppSidebarV2 from '~/components/layout/AppSidebarV2.vue'
import SettingsSidebar, { type Group } from '~/components/layout/SettingsSidebar.vue'
import SettingsHeader from '~/components/layout/SettingsHeader.vue'
import TrialBanner from '~/components/layout/TrialBanner.vue'

// Per the Figma reference (node 465:14328): same Company/Workflow/Templates
// routes as /settings, plus Bonus Programs (Company) and Conflict
// Management / Smart Distribution (Workflow); "Requisition approvals" is
// relabeled "Requisitions" and "Hiring rules" is dropped from this nav
// (its /v2/settings/workflow/hiring-rules route still exists via the
// pages:extend clone, just unlinked here); Team & Roles + My Account are
// nested under one "Manage" group instead of being separate top-level ones.
const V2_SETTINGS_GROUPS: Group[] = [
  { key: 'company', label: 'Company', icon: Building2, children: [
    { label: 'Company information', to: '/v2/settings/company' },
    { label: 'Locations', to: '/v2/settings/locations' },
    { label: 'Departments', to: '/v2/settings/departments' },
    { label: 'Job Titles', to: '/v2/settings/job-titles' },
    { label: 'Candidate Blocklist', to: '/v2/settings/blocklist' },
    { label: 'Career Site', to: '/v2/settings/career-site' },
    { label: 'Bonus Programs', to: '/v2/settings/bonus-programs' },
    { label: 'Integrations', to: '/v2/settings/integrations' },
    { label: 'My Plan', to: '/v2/settings/my-plan' },
  ]},
  { key: 'workflow', label: 'Workflow', icon: Workflow, children: [
    { label: 'Tags & sources', to: '/v2/settings/workflow/tags-sources' },
    { label: 'Disqualify reasons', to: '/v2/settings/workflow/disqualify' },
    { label: 'Public links', to: '/v2/settings/workflow/public-links' },
    { label: 'Stage types', to: '/v2/settings/workflow/stage-types' },
    { label: 'Conflict Management', to: '/v2/settings/workflow/conflict-management' },
    { label: 'Smart Distribution', to: '/v2/settings/workflow/smart-distribution' },
    { label: 'Requisitions', to: '/v2/settings/workflow/approvals' },
  ]},
  { key: 'templates', label: 'Templates', icon: LayoutTemplate, children: [
    { label: 'Email', to: '/v2/settings/templates/email' },
    { label: 'Application Forms', to: '/v2/settings/templates/application-forms' },
    { label: 'Evaluation Forms', to: '/v2/settings/templates/evaluation-forms' },
    { label: 'Questionnaire Forms', to: '/v2/settings/templates/questionnaires' },
    { label: 'Benefits', to: '/v2/settings/templates/benefits' },
    { label: 'Pipeline', to: '/v2/settings/templates/pipeline' },
    { label: 'WhatsApp', to: '/v2/settings/templates/whatsapp' },
    { label: 'Job Templates', to: '/v2/settings/templates/job-templates' },
    { label: 'Referral', to: '/v2/settings/templates/referral' },
    { label: 'Offer', to: '/v2/settings/templates/offer' },
  ]},
  { key: 'manage', label: 'Manage', icon: Users2, children: [
    { label: 'Team & Roles', to: '/v2/settings/team/members' },
    { label: 'My Account', to: '/v2/settings/account/profile' },
  ]},
]
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-[var(--brand-canvas)]">
    <TrialBanner />
    <div class="flex flex-1 min-h-0 bg-[var(--brand-canvas)]">
      <AppSidebarV2 />
      <SettingsSidebar :groups="V2_SETTINGS_GROUPS" :show-back-link="false" />
      <div class="flex-1 flex flex-col min-w-0">
        <header class="flex items-center h-[52px] bg-[var(--brand-canvas)] flex-none">
          <SettingsHeader />
        </header>
        <main class="flex-1 min-w-0 overflow-y-auto bg-white border-t border-l border-[var(--brand-border-light)] rounded-tl-2xl px-10 py-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Verify (partial — full verification happens after Task 10 adds the cloned routes)**

Run the dev server, open `http://localhost:3100/v2/settings/bonus-programs` directly. Confirm: dark `AppSidebarV2` renders on the far left with "Settings" highlighted active, the light settings panel renders next to it with the new 4-group structure (Company/Workflow/Templates/Manage) and no "Back to app" link, "Bonus Programs" is visible under Company and shows the "Coming soon" placeholder. The other 29 existing settings routes will still 404 under `/v2/settings/...` until Task 10's hook runs — that's expected at this point.

- [ ] **Step 4: Commit**

```bash
git add app/pages/v2/settings/bonus-programs.vue app/pages/v2/settings/workflow/conflict-management.vue app/pages/v2/settings/workflow/smart-distribution.vue app/layouts/v2-settings.vue
git commit -m "feat(v2-sidebar): add v2-settings layout, v2 groups data, 3 new placeholder pages"
```

---

## Task 10: Clone `/settings/**` routes to `/v2/settings/**` via a `pages:extend` hook

**Context:** The 29 existing Settings page files (11,600 total lines, each with real inline logic) must render at both `/settings/...` and `/v2/settings/...` without being duplicated or extracted. Nuxt's `pages:extend` build hook lets you push additional route entries that point at the same source file with different route `meta` (here: `layout: 'v2-settings'` instead of `layout: 'settings'`) — this is the standard supported way to do this in Nuxt without file duplication.

**Files:**
- Modify: `nuxt.config.ts`

**Interfaces:** none — this is a build-time route-table transform, no runtime code depends on it directly.

- [ ] **Step 1: Add the hook and a matching SSR route rule**

In `nuxt.config.ts`, add a `hooks` block. Insert it right after the `routeRules` block (after its closing `},` and before `experimental: {`):

```ts
  routeRules: {
    // ── Security headers on every response ──
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        'Content-Security-Policy-Report-Only': CSP,
        // TODO: enable once we confirm HTTPS-only hosting (irreversible for 1yr):
        // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
    },

    // ── SSR strategy ──
    // Auth pages benefit from SSR (fast TTFB on the login screen).
    // Everything else is behind auth — no SEO benefit, so ship them as SPA
    // for smaller server payloads and quicker interactivity.
    '/auth/**':        { ssr: true },
    '/dashboard':      { ssr: false },
    '/candidates/**':  { ssr: false },
    '/jobs/**':        { ssr: false },
    '/settings/**':    { ssr: false },
    '/interviews':     { ssr: false },
    '/offers':         { ssr: false },
    '/talent-pools':   { ssr: false },
    '/analytics':      { ssr: false },
    '/whatsapp':       { ssr: false },
    '/career-site':    { ssr: false },
    // ── /v2 alternate shell — same SPA strategy as its non-/v2 counterparts ──
    '/v2/**':          { ssr: false },
  },

  hooks: {
    // Clone every /settings/** page route to /v2/settings/** pointing at the
    // SAME source file, with layout swapped to 'v2-settings'. This reuses
    // all 29 existing Settings pages unmodified under the new shell instead
    // of duplicating ~11,600 lines of page logic. Route *names* must be
    // unique (Vue Router rejects duplicates), so each clone gets a `v2-`
    // prefix on its name; the *path* is what actually matters for routing.
    'pages:extend'(pages) {
      const settingsPages = pages.filter(p => p.path?.startsWith('/settings'))
      for (const p of settingsPages) {
        pages.push({
          ...p,
          path: p.path!.replace(/^\/settings/, '/v2/settings'),
          name: `v2-${p.name}`,
          meta: { ...p.meta, layout: 'v2-settings' },
        })
      }
    },
  },

  experimental: {
    payloadExtraction: true,   // smaller JS on client
    inlineRouteRules: true,
  },
```

- [ ] **Step 2: Restart the dev server (route table changes require a restart, unlike hot-reloadable page content)**

```bash
# stop the running dev server (Ctrl-C), then:
npm run dev
```

- [ ] **Step 3: Verify the full settings module works identically under both prefixes**

With the dev server running:
1. Open `http://localhost:3100/v2/settings/company` — confirm it loads the real Company Information page (not a 404), with the dark sidebar + new light settings panel from Task 9.
2. Open `http://localhost:3100/v2/settings/workflow/approvals` — confirm it loads (this is the page the v2 sidebar labels "Requisitions").
3. Open `http://localhost:3100/v2/settings/workflow/hiring-rules` directly by URL — confirm the page still loads correctly even though it's no longer linked from the v2 sidebar (per the spec: unlinked, not deleted).
4. Open `http://localhost:3100/v2/settings/team/members` and `/v2/settings/account/profile` — confirm both load, and that the v2 sidebar's "Manage" group correctly links to them.
5. Re-verify `http://localhost:3100/settings/company` one more time — confirm the original route is completely unaffected (still shows the original 5-group sidebar with "Back to app").
6. In the browser console on any `/v2/settings/*` page, run `useRoute().path` — wait, use the Vue devtools or just check the URL bar — confirm the path shows `/v2/settings/...`, not `/settings/...`.

- [ ] **Step 4: Commit**

```bash
git add nuxt.config.ts
git commit -m "feat(v2-sidebar): clone /settings routes to /v2/settings via pages:extend hook"
```

---

## Task 11: Full manual verification pass

**Files:** none — this task is pure verification, no code changes expected. If it surfaces a bug, fix it in the relevant file from an earlier task and note which task's step it belongs to.

- [ ] **Step 1: Confirm the existing app is 100% unchanged**

Walk through every one of these with the dev server running, comparing against your memory of pre-plan behavior (or `git log` to a pre-plan commit in a second terminal if any doubt remains):
- `/dashboard`, `/candidates`, `/candidates/:id` (open a real profile, check all 7 tabs, resize handle, notes/tasks)
- `/jobs`, `/talent-pools`, `/analytics`, `/requisitions`, `/workforce`
- `/settings/company`, `/settings/workflow/approvals`, `/settings/team/members`, `/settings/account/profile` (spot-check 4 of the 29 settings routes across different groups)

Expected: every one of these looks and behaves exactly as it did before this plan started — same sidebar, same "Back to app" link on settings pages, no new nav items, no color changes.

- [ ] **Step 2: Confirm every `/v2` route works end-to-end**

- `/v2/dashboard` → dark sidebar, "Overview" active, "Coming soon"
- `/v2/candidates` → dark sidebar, "Candidates" active, real table with working search/filters/pagination
- `/v2/candidates/:id` → real profile, dark sidebar visible around the overlay, close button returns to `/v2/candidates`, prev/next chevrons stay under `/v2/candidates/...`
- `/v2/talent-pools`, `/v2/jobs`, `/v2/requisitions`, `/v2/workforce`, `/v2/analytics`, `/v2/schedule`, `/v2/help` → each shows "Coming soon" with the correct sidebar item active
- `/v2/settings/company` → dark sidebar (Settings active) + light settings panel (Company/Workflow/Templates/Manage), real Company Information page content, no "Back to app" link
- Click through all 4 settings groups in the `/v2/settings` panel — confirm Bonus Programs, Conflict Management, and Smart Distribution all show "Coming soon", and every other item loads its real existing page

- [ ] **Step 3: Confirm sidebar collapse state is independently sane**

The `v2` and `default` layouts share the same `useSidebarStore` (Pinia store, not per-layout state) — collapsing the sidebar on `/v2/dashboard` will also show it collapsed on `/dashboard` if you navigate there next, since it's the same global `isOpen` flag. Confirm this is the actual behavior (it's expected, not a bug — both sidebars are driven by the same "sidebar open/closed" user preference) and note it to the user if it seems surprising.

- [ ] **Step 4: Final commit (only if Step 1-3 surfaced fixes)**

```bash
git add -A
git commit -m "fix(v2-sidebar): address issues found in manual verification pass"
```

If no fixes were needed, skip this step — there's nothing to commit.
