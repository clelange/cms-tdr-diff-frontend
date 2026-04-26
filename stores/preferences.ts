import { defineStore } from 'pinia'

const STORAGE_KEY = 'preferences-storage'

let initialized = false

function restoreFromStorage(store: any) {
  if (typeof localStorage === 'undefined') return
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      store.searchQuery = data.searchQuery || ''
    } catch (e) {
      console.error('Failed to restore preferences:', e)
    }
  }
}

export const usePreferencesStore = defineStore('preferences', {
  state: () => {
    if (typeof localStorage === 'undefined') {
      return { searchQuery: '' }
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        return { searchQuery: data.searchQuery || '' }
      } catch (e) {
        return { searchQuery: '' }
      }
    }
    return { searchQuery: '' }
  },

  getters: {
    search_query: (state) => state.searchQuery
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
      if (typeof localStorage === 'undefined') return
      const data = { searchQuery: this.searchQuery }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }
})
