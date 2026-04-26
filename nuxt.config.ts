export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: [],

  runtimeConfig: {
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
    apiToken: process.env.API_TOKEN || '',
    public: {
      buildHash: process.env.BUILD_HASH || 'local'
    }
  },

  vite: {
    clearScreen: false,
    optimizeDeps: {
      include: [],
      exclude: []
    },
    build: {
      rollupOptions: {
        external: ['vue', '@vueuse/core', '@oruga-ui/oruga-next', 'pinia']
      }
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
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Permanent+Marker&display=swap&text=CMS%20PaperDiff'
        }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
