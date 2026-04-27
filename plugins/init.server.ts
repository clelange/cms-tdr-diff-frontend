import { useMainStore } from '~/stores/main'

export default defineNuxtPlugin(async () => {
    const mainStore = useMainStore()
    await Promise.all([
        mainStore.getBackendVersion(),
        mainStore.loadTdr(),
        mainStore.getCurrentUser()
    ])
})
