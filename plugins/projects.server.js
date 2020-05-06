export default async ({ store }) => {
  await Promise.all([
    store.dispatch('getBackendVersion'),
    store.dispatch('loadTdr'),
  ])
}
