import { VueQueryPlugin } from '@tanstack/vue-query'
import { createAppQueryClient } from '~/lib/query-client'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient: createAppQueryClient() })
})
