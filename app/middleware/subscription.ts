/**
 * Bounces users to /auth/contact-sales when the company account is expired
 * or frozen. Also transitions `trial` → `expired` client-side when the
 * trial end date has passed (server confirms authoritatively).
 *
 * Apply per page with `definePageMeta({ middleware: ['auth', 'subscription'] })`
 * once the real subscription state is available.
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return
  const auth = useAuthStore()
  auth.restore()
  const co = auth.company
  if (!auth.isAuthenticated || !co) return

  if (
    co.subscriptionState === 'trial'
    && co.trialEndsAt
    && Date.now() > new Date(co.trialEndsAt).getTime()
  ) {
    co.subscriptionState = 'expired'
  }

  if (co.subscriptionState === 'expired') return navigateTo('/auth/contact-sales?state=expired')
  if (co.subscriptionState === 'frozen')  return navigateTo('/auth/contact-sales?state=frozen')
})
