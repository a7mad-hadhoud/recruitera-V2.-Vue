# CLAUDE.md — Recruitera V2

Guidance for Claude Code when working in this repository. Read this before writing any code.

## What this project is

Recruitera V2 is the **frontend rewrite** of the Recruitera ATS, migrating off a Bubble no-code
build. Nuxt 4 + shadcn-vue. Currently at **clickable-prototype / MVP** stage.

**Critical context: there is no backend.** No server API, no database, no real auth.

- Every `/api/*` request is intercepted by **MSW** (Mock Service Worker) — see `app/mocks/`.
- MSW runs in **production too** (`app/plugins/msw.client.ts`), because without it every page is empty.
- Auth is faked in `sessionStorage` (`app/stores/auth.store.ts`). Nothing persists across a browser close.

Do not add a `server/api/` directory, a database client, or an ORM unless explicitly asked. New data
goes in an MSW handler.

## Commands

```bash
npm install              # first-time setup
npm run dev              # dev server → http://localhost:3000
npm run lint             # ESLint, including the custom color rules — MUST pass
npm run lint:fix         # auto-fix
npm run test             # Vitest (unit tests for app/components/brand/ only)
npm run lint:components  # heuristic duplicate-component detector
npm run build            # production build
```

Run `npm run lint` and `npm run test` after every change. The lint step enforces design-system rules
that are not optional (see below).

## Stack

| Concern | Tool | Notes |
|---|---|---|
| Framework | Nuxt 4 (`future.compatibilityVersion: 4`), Vue 3 `<script setup>`, TypeScript strict | file-based routing from `app/pages/` |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) | no `tailwind.config` — tokens live in CSS |
| UI primitives | shadcn-vue (`new-york` style) in `app/components/ui/` | generated/vendored — **do not hand-edit** |
| Design system | `app/components/brand/` | 15 `Brand*` primitives, the real API for building pages |
| Server state | `@tanstack/vue-query` | wrapped in composables |
| UI state | Pinia (`app/stores/`) | sidebar, app, auth, candidates |
| Forms | VeeValidate + Zod | |
| Icons | `lucide-vue-next` | import by name only |
| Mock API | MSW | `app/mocks/handlers/` |
| Tests | Vitest + happy-dom | standalone config, no `@nuxt/test-utils` |

## Directory map

```
app/
  pages/          62 file-based routes (19 are "Coming soon" stubs)
  layouts/        default.vue · settings.vue · auth.vue  — only three, don't add more
  components/
    brand/        THE design system — start here on every new page
    ui/           shadcn-vue, vendored, do not edit
    layout/       AppSidebar, AppHeader, TrialBanner
    settings/     11 shared Settings primitives (SettingsTable, SettingsFormModal, ...)
    candidates/ jobs/ dashboard/ interviews/ onboarding/   feature components
  composables/    25 data + UI-logic composables (useCandidates, useJobs, ...)
  stores/         Pinia: app · auth · candidates · sidebar
  types/          one *.types.ts per domain, re-exported from types/index.ts
  mocks/          MSW worker + 22 handler files
  lib/            query-client.ts, utils.ts (cn helper)
  middleware/     auth.ts, subscription.ts
  assets/css/     main.css — 121 --brand-* tokens
docs/superpowers/ design specs and implementation plans
eslint-rules/     custom rules: no-hex-colors, no-raw-tailwind-color
```

## Hard rules

### 1. No hex colors, no raw Tailwind color classes

Enforced by ESLint (`local/no-hex-colors`, `local/no-raw-tailwind-color`) — violations fail `npm run lint`.

```vue
<!-- WRONG -->
<div class="bg-[#C9FD13] text-gray-500 border-slate-200">

<!-- RIGHT -->
<div class="bg-[var(--brand-lime)] text-[var(--brand-text-muted)] border-[var(--brand-border)]">
```

All 121 tokens live in `app/assets/css/main.css`. If you need a color that doesn't exist, **add the
token to `main.css` first**, then reference it. Never inline a value.

Token families: `--brand-lime*` / `--brand-olive` (accent), `--brand-teal*` (CTA),
`--brand-canvas` / `--brand-surface-*` (backgrounds), `--brand-text-*` (text, light→dark),
`--brand-border-*` (1px lines, strong→pale), `--brand-icon-*`, `--brand-danger`,
`--brand-badge-*`, `--brand-avatar-*`.

Exempt paths (already ignored in `eslint.config.mjs`): `app/components/ui/**`, `app/pages/design-system.vue`.

### 2. Reuse primitives — never re-implement a button, search bar, table shell, or empty state

Import from the barrel file:

```ts
import { BrandButton, BrandPageTitle, BrandSearchBar, BrandDataTable, BrandEmptyState } from '~/components/brand'
```

Available: `BrandAvatarInitials`, `BrandButton`, `BrandCard`, `BrandCountBadge`, `BrandDataTable`,
`BrandEmptyState`, `BrandFavoriteItem`, `BrandFilterGroup`, `BrandFilterOption`, `BrandLimeCheckbox`,
`BrandPageTitle`, `BrandSearchBar`, `BrandSectionTitle`, `BrandStatusBadge`, `BrandTopbarActions`.

For Settings pages, also reuse `app/components/settings/`: `SettingsPageHeader`, `SettingsTable`,
`SettingsTableSkeleton`, `SettingsFormModal`, `SettingsRenameModal`, `SettingsConfirmDialog`,
`SettingsRowMenu`, `SettingsRowMenuItem`, `SettingsToast`, `SettingsToggleCard`,
`SettingsDuplicatePickerModal`.

Extract a new primitive only when the pattern is about to appear on a 2nd or 3rd page, or you'd
duplicate >10 lines of Tailwind. New primitives go in `app/components/brand/BrandXxx.vue`, get
exported from `index.ts`, and get a row added to `app/components/brand/README.md`.

Before creating any component, check whether an equivalent already exists — `npm run lint:components`
catches near-duplicate names. This repo has already shipped one duplicate pair by accident.

### 3. The layout shell is fixed

Every page renders inside `app/layouts/default.vue`:

```
TrialBanner
header (52px, --brand-canvas bg, no border-b)
flex row
  AppSidebar (canvas bg, no border-r)
  <main class="flex-1 overflow-auto">  ← your page
```

Page root element:
- has a filter sidebar → `<div class="flex h-full overflow-hidden bg-[var(--brand-canvas)]">`
- plain content page → `<div class="flex-1 border-t border-[var(--brand-border)]">`

Settings pages use `definePageMeta({ layout: 'settings' })`. Auth pages use `'auth'`.
Do not add new layouts.

### 4. Follow the existing pattern in the nearest complete page

Before building anything, open the closest finished equivalent and mirror its structure exactly.
Reference implementations:

| Building | Copy the pattern from |
|---|---|
| Settings CRUD page | `app/pages/settings/locations.vue` (254 lines — cleanest example) |
| Settings template editor | `app/pages/settings/templates/pipeline.vue` |
| List view + filters + table | `app/pages/candidates/index.vue` + `app/pages/jobs/index.vue` |
| Detail page with tabs | `app/pages/candidates/[id].vue` · `app/pages/jobs/[id]/index.vue` |
| Multi-step form | `app/pages/jobs/new.vue` |
| Auth flow | `app/pages/auth/login.vue` |

Consistency with the existing code matters more than any improvement you could invent.

## Data layer

Server state goes through a composable in `app/composables/`, one per domain, returning Vue Query:

```ts
import { useQuery } from '@tanstack/vue-query'
import type { LocationsResponse } from '~/types'

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await fetch('/api/locations')
      if (!res.ok) throw new Error('Failed to fetch locations')
      return res.json() as Promise<LocationsResponse>
    },
  })
}
```

**Known inconsistency:** `app/composables/useApi.ts` documents itself as the central fetch wrapper
("Do not `fetch` directly for mutations — go through here"), but only 3 composables use it while ~10
call `fetch` directly. **For new code, use `useApi()`** — it sets `credentials: 'include'` and the
CSRF header the real API will need. Don't refactor the existing ones unless asked.

Mutations use `useMutation` + `queryClient.invalidateQueries`. See `app/composables/useJobs.ts`,
`useJobNotes.ts`, `useJobPipeline.ts`, `useJobReferrals.ts`.

Note: several pages (e.g. `settings/locations.vue`) seed a local `ref` copy from the query result so
add/edit/delete can mutate what's rendered without a real API. Keep that pattern until the backend lands.

## Adding a mock endpoint

1. Create `app/mocks/handlers/<domain>.handlers.ts` exporting `<domain>Handlers`.
2. Import it and spread it into the array in `app/mocks/handlers/index.ts` — **above `...stubHandlers`**,
   or the `[]` catch-all wins.
3. Use `await delay(350)` so loading skeletons stay visible in dev (see `candidates.handlers.ts`).
4. Response shape must mirror a plausible real API: `{ data: [...], total: n }`.
5. Add matching types in `app/types/<domain>.types.ts` and re-export from `app/types/index.ts`.

`app/mocks/handlers/stub.handlers.ts` returns `{ data: [], total: 0 }` for 18 not-yet-built routes.
When you implement a real handler for one of them, remove that route from the stub list.

## Types

One file per domain in `app/types/`, named `<domain>.types.ts`, re-exported from `index.ts`.
Import as `import type { Candidate, Job } from '~/types'`. TypeScript is strict — no `any`.

## Tests

Vitest with a standalone config (`vitest.config.ts`, happy-dom, `app/**/*.test.ts`). Only the brand
primitives are covered so far (5 test files). When you add or change a `Brand*` component, add or
update its `.test.ts` alongside it. Page-level tests aren't set up — don't scaffold them unprompted.

## Current state

Substantially built: `candidates/index` + `candidates/[id]`, `jobs/index` + `jobs/new` + `jobs/[id]`,
auth flow, `design-system`, and most of `settings/**`.

Still empty 11-line "Coming soon" stubs — 19 pages:
`analytics` · `approvals` · `requisitions` · `workforce` · `talent-pools` · `offers` · `evaluations` ·
`questionnaires` · `referrals` · `distribution` · `conflicts` · `whatsapp` · `career-site` ·
`jobs/[id]/pipeline` · `index` · `settings/index` · `settings/workflow/benefits` ·
`settings/workflow/pipeline` · `settings/workflow/whatsapp`

Notably `jobs/[id]/pipeline` — the Kanban/pipeline view, the core of an ATS — is unbuilt, though a
full design spec exists at `docs/superpowers/specs/2026-07-21-pipeline-screening-view-design.md`.

## Known issues — flag, don't silently fix

- `app/pages/settings/company.vue` and `settings/company-2.vue` are **byte-identical duplicates**.
  One should be deleted; ask which before removing either.
- `docs/superpowers/plans/2026-07-13-v2-sidebar-shell-plan.md` describes a `/v2/*` dark-themed sidebar
  shell. **None of it exists** in the codebase (no `v2` layouts, no `AppSidebarV2.vue`). Treat the
  plan as abandoned unless told otherwise.
- CSP is in `Content-Security-Policy-Report-Only` mode and HSTS is commented out in `nuxt.config.ts`,
  pending confirmation of the API host. Don't flip either without being asked.
- Auth middleware guards routes against a fake session. Real auth (HttpOnly cookie + `GET /api/me`)
  is a documented TODO in `auth.store.ts`.

## Git — ask before anything leaves this machine

The person you're working with reviews visually in the browser before anything ships. Iterate with
them until they say they're satisfied. Nothing reaches GitHub without an explicit instruction.

**Do freely, no permission needed** — these are local and reversible:

- `git status`, `git diff`, `git log`, `git branch`
- `git checkout -b <name>` — create a branch at the start of any task
- `git add` / `git commit` — commit working increments as you go, so there are undo points

**Never do without being asked in that turn:**

- `git push` — this is the line. Everything before it is private; this makes it public and triggers
  a Vercel deployment.
- `gh pr create`, or any other `gh` command that writes
- `git merge` into `main`, or committing directly on `main`
- `git push --force`, `git reset --hard`, `git rebase`, `git branch -D` — destructive; explain what
  the command does and get a yes first

"Looks good" / "that works" is approval of the *code*, not permission to push. Wait for an explicit
"push it" or "open a PR".

After a push, tell them: Vercel builds a preview for the branch automatically, and the link appears
as a comment on the PR within a minute or two.

## Working style

- Follow the repo's own workflow: design spec → task-by-task plan → implement. Prior examples in
  `docs/superpowers/specs/` and `docs/superpowers/plans/`.
- Prefer editing existing files over creating new ones. Don't create README or docs files unless asked.
- Don't add dependencies without asking — the stack is deliberately small.
- No hex codes, no new layouts, no `server/api/`, no database. Reuse before you write.

## Definition of done

0. The person has looked at it in the browser and said they're satisfied.
1. `npm run lint` passes (colors, Nuxt/Vue rules).
2. `npm run test` passes.
3. Page renders inside the correct layout with no console errors.
4. Loading, empty, and error states all exist — use `BrandEmptyState` and the skeleton components.
5. Colors are tokens. Repeated markup is a primitive. Data goes through a composable.
6. Any new `/api/*` call has a matching MSW handler registered in `handlers/index.ts`.
