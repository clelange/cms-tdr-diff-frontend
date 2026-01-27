export default defineNuxtPlugin((nuxtApp) => {
  const oruga = nuxtApp.vueApp.config.globalProperties.$oruga

  oruga.config.setOptions({
    iconPack: 'mdi',
    iconComponent: 'o-icon'
  })
})
