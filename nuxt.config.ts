import tailwindcss from '@tailwindcss/vite'

/**
 * Content Security Policy — controls what can load/run on the page.
 * Kept in `report-only` mode initially — flip to `Content-Security-Policy`
 * (see below) once the API host is confirmed and violations are audited.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",          // tighten after audit; MSW needs eval in dev
  "style-src 'self' 'unsafe-inline'",           // shadcn tokens injected inline
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api.recruitera.ai ws: wss:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },

  // Public → serialised into the client bundle. NEVER put secrets here.
  // Private → server-only, redacted from the client payload.
  runtimeConfig: {
    apiSecret: process.env.API_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3000',
      appEnv:  process.env.NUXT_PUBLIC_APP_ENV  ?? 'development',
    },
  },

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
  },

  experimental: {
    payloadExtraction: true,   // smaller JS on client
    inlineRouteRules: true,
  },

  app: {
    // pageTransition was { name: 'page', mode: 'out-in' }, which silently broke every
    // in-app route change: the URL updated but the page component never swapped, so
    // clicking a candidate, a job or a pool left you looking at the previous screen.
    // Reproduced on a clean dev server, and disabling it is what fixes it — supplying
    // the missing .page-enter/.page-leave styles does not. Re-enable only with a
    // verified working transition.
    pageTransition: false,
  },
})
