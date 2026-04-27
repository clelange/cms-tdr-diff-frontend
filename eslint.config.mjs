import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt(
  {
    features: {
      stylistic: false
    }
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off'
    }
  }
)
