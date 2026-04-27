import { defineStore } from 'pinia'

interface CurrentUser {
  id: string
  email?: string
  username?: string
  authenticated: boolean
  identity_source?: string
  preferred_username?: string
}

export const useMainStore = defineStore('main', {
  state: () => ({
    tdrTypes: [] as string[],
    apiStatus: null as 'good' | 'bad' | null,
    backendVersion: 'undefined' as string,
    currentUser: null as CurrentUser | null
  }),

  getters: {
    currentUserLabel: (state) => {
      const user = state.currentUser
      if (!user?.authenticated) return ''
      return user.email || user.username || user.id
    }
  },

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
    },

    async getCurrentUser() {
      try {
        const response = await $fetch('/api/me') as { user: CurrentUser }
        this.currentUser = response.user
      } catch (err) {
        console.error(err)
        this.currentUser = null
      }
    }
  }
})
