import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    tdrTypes: [] as string[],
    apiStatus: null as 'good' | 'bad' | null,
    backendVersion: 'undefined' as string
  }),

  getters: {},

  actions: {
    async loadTdr() {
      if (this.tdrTypes.length > 0) return

      this.apiStatus = null

      try {
        const response = await $fetch('/api/types') as { names: string[] }
        this.apiStatus = 'good'
        this.tdrTypes = response.names
      } catch (err) {
        console.error(err)
        this.apiStatus = 'bad'
      }
    },

    async getBackendVersion() {
      try {
        const response = await $fetch('/api/version') as { SnapshotTag: string }
        this.backendVersion = response.SnapshotTag
      } catch (err) {
        console.error(err)
        this.backendVersion = 'undefined'
      }
    }
  }
})
