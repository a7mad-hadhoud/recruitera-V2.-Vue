# Recruitera V2

Nuxt 4 + shadcn-vue rewrite of the Recruitera CRM.

## Stack
- Nuxt 4 (Vue 3, TypeScript)
- Tailwind CSS v4
- shadcn-vue components (in `app/components/ui`)
- Vue Query for server state
- Pinia for UI state
- MSW for mock API in dev
- VeeValidate + Zod for forms

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`.

## Design system

All colors, spacing and reusable primitives live in:
- **Tokens**: `app/assets/css/main.css` — every `--brand-*` value. Change one, propagates everywhere.
- **Primitives**: `app/components/brand/` — `BrandButton`, `BrandSearchBar`, `BrandDataTable`, etc.

See [`app/components/brand/README.md`](app/components/brand/README.md) for the full inventory and usage rules.

## Mock API

MSW intercepts every request under `/api/*` in dev. Real handlers live in `app/mocks/handlers/`; every unhandled route falls through to a `[]` stub so pages don't 404 while you build them.

## Deploy

Auto-detected as a Nuxt project by Vercel — connect the repo and it deploys on every push to `main`.
