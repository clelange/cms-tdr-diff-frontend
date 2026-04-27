import { defineStore } from 'pinia'

const STORAGE_KEY = 'preferences-storage'

interface PreferencesState {
  searchQuery: string
}

function readStoredPreferences(): PreferencesState {
  if (typeof localStorage === 'undefined') return { searchQuery: '' }

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved) as Partial<PreferencesState>
      return {
        searchQuery: typeof data.searchQuery === 'string' ? data.searchQuery : ''
      }
    } catch (e) {
      console.error('Failed to restore preferences:', e)
    }
  }

  return { searchQuery: '' }
}

export const usePreferencesStore = defineStore('preferences', {
  state: (): PreferencesState => readStoredPreferences(),

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
