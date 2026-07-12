// Nuxt runs *.client.ts plugins in the browser only.
export default defineNuxtPlugin(async () => {
  if (import.meta.env.DEV) {
    const { worker } = await import('~/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
  }
})
