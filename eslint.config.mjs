// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import noHexColors from './eslint-rules/no-hex-colors.js'
import noRawTailwindColor from './eslint-rules/no-raw-tailwind-color.js'

export default withNuxt(
  {
    files: ['app/**/*.vue'],
    // shadcn-vue primitives are generated/vendored, not hand-authored brand
    // components — they're allowed to use their own theme tokens directly.
    // design-system.vue is the token/component showcase itself — it displays
    // swatches and hex values as documentation, not app UI.
    ignores: ['app/components/ui/**', 'app/pages/design-system.vue'],
    plugins: {
      local: {
        rules: {
          'no-hex-colors': noHexColors,
          'no-raw-tailwind-color': noRawTailwindColor,
        },
      },
    },
    rules: {
      'local/no-hex-colors': 'error',
      'local/no-raw-tailwind-color': 'error',
    },
  },
)
