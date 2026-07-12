/**
 * Redirect unauthenticated users to /auth/login.
 *
 * Runs on the CLIENT ONLY — server-side auth check happens in the API layer
 * (via cookie) once the real backend is connected. Doing it client-side here
 * would be pointless: SSR routes for auth pages don't have the cookie yet.
 *
 * MOCK mode: reads from sessionStorage via useAuthStore.restore(). Once real
 * API is connected, replace with a call to `GET /api/me` — the cookie sent
 * with the request is what actually authenticates.
 *
 * NOTE: not registered globally yet — apply per page with
 *   definePageMeta({ middleware: 'auth' })
 * once the login flow exists. Registering globally now would loop-redirect
 * every route to /auth/login before any auth page exists.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  auth.restore()
  const isPublic = to.path.startsWith('/auth') || to.path === '/'
  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
