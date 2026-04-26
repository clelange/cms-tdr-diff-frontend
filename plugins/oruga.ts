import { createOruga, OrugaComponentPlugins } from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createOruga({
    ...bulmaConfig,
    iconPack: 'mdi'
  }, OrugaComponentPlugins))
})
