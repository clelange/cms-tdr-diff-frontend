import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore(
  'preferences',
  {
    state: () => ({
      searchQuery: '' as string
    }),

    getters: {
      search_query: (state) => state.searchQuery
    },

    actions: {
      setSearchQuery(query: string) {
        this.searchQuery = query
      }
    }
  },
  {
    persist: {
      storage: localStorage,
      key: 'preferences',
      paths: ['searchQuery']
    }
  }
)
