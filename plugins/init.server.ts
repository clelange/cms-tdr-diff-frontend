import { useMainStore } from '~/stores/main'

export default defineNuxtPlugin(async (nuxtApp) => {
    const mainStore = useMainStore(nuxtApp.$pinia)
    await Promise.all([
        mainStore.getBackendVersion(),
        mainStore.loadTdr()
    ])
})
