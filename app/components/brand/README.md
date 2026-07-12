# Recruitera Design System

Everything in this folder is a **shared primitive**. Every page in the product must build from these — never write raw hex colors, never re-implement a button/search/table shell inline.

## Rule 1 — no hex, only tokens

All colors live in [`app/assets/css/main.css`](../../assets/css/main.css) as `--brand-*` CSS custom properties. In `.vue` files use `bg-[var(--brand-lime)]`, never `bg-[#C9FD13]`. Change a token in `main.css` → the whole product updates.

If you need a color that isn't in the token list, **add it to `main.css` first**, then use it.

### Token categories

| Category | Tokens | Use for |
|---|---|---|
| Brand accent | `--brand-lime`, `--brand-lime-tint`, `--brand-lime-tint-hover`, `--brand-lime-active-bg`, `--brand-lime-active-bg-strong`, `--brand-olive` | Lime accents, active nav pills, checkbox fill |
| CTA | `--brand-teal`, `--brand-teal-secondary` | Primary buttons, deep-teal accents |
| Canvas / surface | `--brand-canvas`, `--brand-surface-white`, `--brand-surface-badge`, `--brand-surface-hover`, `--brand-surface-table-alt` | Page background, cards, zebra rows |
| Text | `--brand-text`, `-secondary`, `-muted`, `-subtle`, `-quiet`, `-disabled`, `-faint`, `-nav-text` | Every text color, ranked light→dark |
| Icons | `--brand-icon-default`, `--brand-icon-muted` | Icon-button strokes |
| Borders | `--brand-border`, `-light`, `-mid`, `-divider`, `-fade`, `-key` | Every 1px line, ranked strong→pale |
| Semantics | `--brand-danger`, `--brand-badge-new-bg`, `--brand-badge-new-text`, `--brand-topbar-pill-*`, `--brand-banner-*` | Destructive, badges, banners |

## Rule 2 — reuse primitives before writing markup

If any of these apply, use the primitive:
- The pattern appears in 2+ places (or is likely to)
- The design has a specific look shadcn defaults don't give you
- Removing the primitive would mean copy-pasting >10 lines of Tailwind

### Available primitives

| Component | What it is | Use when |
|---|---|---|
| **BrandButton** | shadcn button + brand variants: `primary-teal`, `primary-lime`, `outline`, `ghost`, `danger-ghost` | Every CTA. Do not write inline `bg-[var(--brand-teal)]` buttons anymore. |
| **BrandSearchBar** | Icon + pill input, optional ⌘K hint | Any search input on any page |
| **BrandPageTitle** | H1 + optional star favorite | Every page hero title |
| **BrandDataTable** | Outer chrome for tables (border, radius, shadow, horizontal scroll) | Every list-view table |
| **BrandEmptyState** | Icon + title + description + action slot | Every "no results" state |
| **BrandCountBadge** | Small gray rounded count pill ("14", "0") | Row counts, filter option counts |
| **BrandLimeCheckbox** | shadcn Checkbox + lime fill + olive tick | Every checkbox in the product |
| **BrandSectionTitle** | Uppercase bold section header | Panel section headers ("FAVORITES") |
| **BrandFilterGroup** | Filter group wrapper (title + × clear + slot) | Grouped filter sets |
| **BrandFilterOption** | Checkbox row inside a filter group | Filter row (checkbox + label + count) |
| **BrandFavoriteItem** | Favorite row with drag handle + count | Sidebar favorites lists |

## Rule 3 — layout shell is fixed

Every page renders inside the default layout ([`app/layouts/default.vue`](../../layouts/default.vue)):

```
TrialBanner
Header (52px, canvas bg, no border-b)
Body (flex row)
  AppSidebar (canvas bg, no border-r)
  <main> (flex-1, overflow-auto)
    <slot />   ← your page goes here
```

Your page's root should be `<div class="flex h-full overflow-hidden bg-[var(--brand-canvas)]">` if it has a filter sidebar, or `<div class="flex-1 border-t border-[var(--brand-border)]">` if it's a plain content page. The border on the content column is what makes the filter-panel curve merge cleanly with the top edge.

## Rule 4 — when to add a new primitive

Extract when either:
- The pattern is about to appear on a 2nd or 3rd page
- You'd otherwise duplicate >10 lines of Tailwind
- The design has a specific look (spacing, radius, hover) that shadcn defaults don't cover

Where to put it: `app/components/brand/BrandXxx.vue`, then export it from `index.ts` and add a row to the primitives table above.

## Example — using primitives on a new "Jobs" page

```vue
<script setup lang="ts">
import { BrandButton, BrandPageTitle, BrandSearchBar, BrandDataTable, BrandEmptyState } from '~/components/brand'
import { Plus, Briefcase } from 'lucide-vue-next'

const search = ref('')
const jobs = ref<Job[]>([])
</script>

<template>
  <div class="flex-1 flex flex-col min-w-0 overflow-hidden border-t border-[var(--brand-border)] bg-white">
    <div class="px-6 pt-6 pb-4 flex items-center gap-3">
      <BrandPageTitle label="Jobs" favoriteable />
      <div class="ml-auto"><BrandButton variant="primary-teal"><Plus class="w-4 h-4 mr-1" /> New job</BrandButton></div>
    </div>
    <div class="px-6 pb-4">
      <BrandSearchBar v-model="search" placeholder="Search jobs" hint="⌘ K" />
    </div>
    <div class="flex-1 overflow-auto px-6 pb-6">
      <BrandEmptyState v-if="!jobs.length" :icon="Briefcase" title="No jobs yet" description="Create your first job to start hiring.">
        <BrandButton variant="primary-teal"><Plus class="w-4 h-4 mr-1" /> New job</BrandButton>
      </BrandEmptyState>
      <BrandDataTable v-else>…</BrandDataTable>
    </div>
  </div>
</template>
```

Then if the design team wants darker table borders next month, you change one line in `main.css` (`--brand-border-light`) — every page updates.
</content>
