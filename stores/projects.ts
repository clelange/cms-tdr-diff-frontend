import { defineStore } from 'pinia'

interface Project {
  id: number
  name: string
  description: string
  last_activity_at: string
  web_url: string
}

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    myProjects: [] as Project[]
  }),

  getters: {},

  actions: {
    async load(categoryName: string) {
      try {
        const response = await $fetch(`/api/projects/${categoryName}`) as { data: Project[] }
        this.myProjects = response.data
      } catch (err) {
        console.error('Error loading projects:', err)
        throw err
      }
    }
  }
})
