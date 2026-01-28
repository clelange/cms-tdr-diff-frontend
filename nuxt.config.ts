export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: [],

  runtimeConfig: {
    public: {
      buildHash: process.env.BUILD_HASH || 'local'
    }
  },

  routeRules: {
    '/api/**': {
      proxy: (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/?$/, '/') + 'api/**'
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
  },

  loading: {
    color: '#35495e',
    height: '3px',
    duration: 5000,
    throttle: 200,
    continuous: true
  }
})
