import { QueryClient } from '@tanstack/vue-query'

/**
 * Shared Vue Query config.
 * - staleTime 60s → back-navigation from another route re-uses cached rows.
 * - gcTime 5min  → data survives brief unmounts (modal close, tab switch).
 * - retry 1      → don't hammer a failing endpoint.
 * - refetchOnWindowFocus false → user tabbing back to the CRM shouldn't
 *   trigger a burst of network calls.
 */
export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}
