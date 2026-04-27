export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: [
    '@fontsource/source-sans-pro/latin-400.css',
    '@fontsource/quicksand/latin-300.css',
    '@fontsource/permanent-marker/latin-400.css',
    '@fontsource/cookie/latin-400.css',
    '@oruga-ui/theme-bulma/style.css',
    'katex/dist/katex.min.css'
  ],

  runtimeConfig: {
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
    apiToken: process.env.API_TOKEN || '',
    public: {
      buildHash: process.env.BUILD_HASH || 'local',
      buildDate: process.env.BUILD_DATE || ''
    }
  },

  vite: {
    clearScreen: false,
    optimizeDeps: {
      include: [],
      exclude: []
    }
  },

  app: {
    head: {
      title: 'CMS TDR Diff',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'CMS paper and notes diff' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
