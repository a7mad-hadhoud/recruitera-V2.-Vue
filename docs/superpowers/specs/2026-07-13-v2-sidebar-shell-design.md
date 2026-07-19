# /v2 alternate sidebar shell

## Context

The user supplied two Figma screenshots (collapsed + expanded states) of a new
main-nav sidebar design: full-height, dark themed, logo + collapse toggle
built into the sidebar itself, with a different link set than the current
`AppSidebar.vue`. The ask is to build this as a fully separate, comparable
version of the app reachable at its own URL prefix, without touching the
current app at all. The current Settings module (light-themed, 5-group
accordion sidebar) is explicitly kept as-is — it is not being reskinned, only
made reachable under the new URL prefix.

## Goals

- Preserve the existing app (`/dashboard`, `/candidates`, `/jobs`, ...)
  completely unchanged — zero risk to what's already working.
- Stand up a second, fully clickable shell at `/v2/...` matching the new
  design, so it can be reviewed side by side with the current app.
- Reuse existing page logic wherever it already exists — no forked copies
  that can drift out of sync.

## Non-goals

- Replacing or deprecating the current sidebar/shell.
- Redesigning the Settings module's internal navigation or colors.
- Building out real content for Requisitions / Workforce Planning / Time
  Schedule / Help Center beyond a placeholder — these are nav-completeness
  stubs, not full features.

## Current state (relevant findings)

- `app/layouts/default.vue` renders `AppHeader` full-width above a row of
  `AppSidebar` + `<main>`. The sidebar has no logo (it lives in the header).
- `app/components/layout/AppSidebar.vue`: light `--brand-canvas` background,
  collapsible via `useSidebarStore`, items — Home, Candidates, Jobs, Talent
  pools, Calendar, Analytics, (spacer), Settings, Hide toggle.
- `app/pages/dashboard.vue`, `jobs/index.vue`, `talent-pools.vue`,
  `analytics.vue`, `requisitions.vue`, `workforce.vue` are all the *same*
  11-line "Coming soon" placeholder pattern (`definePageMeta({layout:
  "default"})` + centered dashed-border "Coming soon" card). Requisitions and
  Workforce Planning already exist in exactly the form needed for the new
  nav — no new work required for those two.
- `app/pages/candidates/index.vue` (132 lines) and `app/pages/candidates/
  [id].vue` (965 lines) hold real, working functionality and are the only
  pages that need their content extracted into standalone components so both
  the old and new shell can render the same logic.
- `app/components/layout/SettingsSidebar.vue`: light theme, 5 accordion
  groups (Company, Workflow, Templates, Team & Roles, My Account), 29 routes
  under `/settings/...`. Confirmed: stays exactly as-is, just becomes
  reachable at `/v2/settings/...` reusing the same `settings` layout.

## Design

### Routing

New pages under `app/pages/v2/` mirror the existing top-level routes:

| New route | Reuses |
|---|---|
| `/v2/dashboard` (Overview) | same placeholder pattern |
| `/v2/candidates`, `/v2/candidates/[id]` | extracted `CandidatesIndexPage` / `CandidateProfilePage` components |
| `/v2/talent-pools` | same placeholder pattern |
| `/v2/jobs` | same placeholder pattern |
| `/v2/requisitions` | same placeholder pattern |
| `/v2/workforce` | same placeholder pattern |
| `/v2/schedule` (Time Schedule) | **new** placeholder page |
| `/v2/analytics` | same placeholder pattern |
| `/v2/settings/**` (all 29 routes) | existing `settings` layout + `SettingsSidebar.vue`, unchanged |
| `/v2/help` (Help Center) | **new** placeholder page |

Each new `/v2/*` page file sets `definePageMeta({ layout: 'v2' })` (default
pages keep `layout: 'default'` — no change to existing files). Settings
pages reached via `/v2/settings/*` keep `definePageMeta({ layout: 'settings'
})` exactly as today.

### Component extraction (only 2 files need it)

- `app/pages/candidates/index.vue` → move body into
  `app/components/candidates/CandidatesIndexPage.vue`; both
  `app/pages/candidates/index.vue` and `app/pages/v2/candidates/index.vue`
  become thin wrappers that just render `<CandidatesIndexPage />` with their
  respective `definePageMeta`.
- `app/pages/candidates/[id].vue` → same pattern, extracted to
  `app/components/candidates/CandidateProfilePage.vue`.

No other page needs extraction — the "Coming soon" placeholder pages are
identical inline markup already; the `/v2` versions just copy the same
11-line pattern directly (duplicating 11 lines of static markup is simpler
and clearer than extracting a component for it).

### New layout: `app/layouts/v2.vue`

```
<div class="flex h-screen overflow-hidden">
  <AppSidebarV2 />               <!-- full height, own logo + toggle -->
  <div class="flex flex-col flex-1 min-w-0">
    <TrialBanner />               <!-- unchanged, reused as-is -->
    <header> <AppHeader /> </header>  <!-- unchanged, reused as-is, now only spans the content column -->
    <main class="flex-1 overflow-auto"><slot /></main>
  </div>
</div>
```

`AppHeader` and `TrialBanner` are reused unchanged (no new component) — only
their position in the DOM changes (scoped to the content column instead of
spanning full width above the sidebar too), since the exact top-right corner
of the header wasn't visible in the reference screenshots and no change was
requested there.

### New component: `app/components/layout/AppSidebarV2.vue`

Full-height dark sidebar. Structure:

- Top: logo mark + "recruitera" wordmark + collapse toggle button (in-sidebar,
  not a separate bottom "Hide" row like the current sidebar).
- Nav items (icon + label, collapses to icon-only via the same
  `useSidebarStore` state the current sidebar already uses):
  1. Overview — `LayoutGrid` — `/v2/dashboard`
  2. Candidates — `Users` — `/v2/candidates`
  3. Talent Pools — `Users2` — `/v2/talent-pools`
  4. Jobs — `Briefcase` — `/v2/jobs`
  5. Requisitions — `ClipboardList` — `/v2/requisitions`
  6. Workforce Planning — `BarChart3` — `/v2/workforce`
  7. Time Schedule — `Calendar` — `/v2/schedule`
  8. Analytics — `LineChart` — `/v2/analytics`
- Spacer
- Settings — `Settings` — `/v2/settings`
- Help Center — `FileText` — `/v2/help`

Active-item styling: solid lime pill background (matches the reference
screenshot), same active/inactive logic pattern as the current
`AppSidebar.vue` (`route.path === to || route.path.startsWith(to + '/')`).

### New CSS tokens

Added to `app/assets/css/main.css` alongside the existing token set (no
hardcoded hex in the component, consistent with the existing lint rule):

- `--brand-v2-sidebar-bg` — near-black, sampled from the reference screenshot
- `--brand-v2-nav-text` — light gray/white, inactive item text
- `--brand-v2-active-bg` — lime green, active item pill (can likely reuse
  the existing `--brand-lime-active-bg-strong` value — confirm visually
  against the reference during implementation)
- `--brand-v2-active-text` — dark text on the active lime pill

### New placeholder pages

- `app/pages/v2/schedule.vue` — Time Schedule, same "Coming soon" pattern as
  `requisitions.vue`.
- `app/pages/v2/help.vue` — Help Center, same pattern.

## Testing / verification

- `node --check` equivalent: `npx nuxi typecheck` (or just boot the dev
  server) after adding routes — confirms no page/layout wiring errors.
- Manual browser walk: visit every `/v2/*` route, confirm the dark sidebar
  renders, collapse/expand works and persists, active-state highlighting is
  correct per route, and `/v2/candidates` + `/v2/candidates/[id]` behave
  identically to their `/` counterparts (same data, same interactions).
- Confirm `/candidates`, `/dashboard`, `/jobs`, `/talent-pools`,
  `/analytics`, `/settings/*` are completely unchanged (no visual or
  behavioral diff) — this is the main regression risk given the
  `candidates/index.vue` and `candidates/[id].vue` extraction.
- Confirm `/v2/settings/*` renders identically to `/settings/*` (same light
  theme, same accordion sidebar).
