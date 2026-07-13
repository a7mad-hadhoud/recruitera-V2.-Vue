import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

// Standalone Vitest config (no @nuxt/test-utils) for unit-testing brand/
// components in isolation. Mirrors just enough of Nuxt's auto-imports
// (~/@ aliases -> app/, `computed`/`ref` from vue) for these components
// to mount without a full Nuxt runtime.
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ imports: ['vue'], dts: false }),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['app/**/*.test.ts'],
  },
})
