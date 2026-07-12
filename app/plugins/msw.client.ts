// Nuxt runs *.client.ts plugins in the browser only.
// MSW is enabled in production too until a real backend exists — this app
// has no server API yet, so without it every page shows empty states.
export default defineNuxtPlugin(async () => {
  const { worker } = await import('~/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
})
