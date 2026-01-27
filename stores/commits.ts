import { defineStore } from 'pinia'

interface Commit {
  id: string
  short_id: string
  created_at: string
  title: string
  author_name: string
  author_email: string
  tag?: string
}

interface ProjectInfo {
  name: string
  description: string
  web_url: string
}

export const useCommitsStore = defineStore('commits', {
  state: () => ({
    commitList: [] as Commit[],
    projectInfo: null as ProjectInfo | null
  }),

  getters: {},

  actions: {
    async load(categoryName: string, analysisId: string) {
      try {
        const response = await $fetch(`/api/commits/${categoryName}/${analysisId}`) as {
          commits: Commit[]
          project_info: ProjectInfo
        }
        this.commitList = response.commits
        this.projectInfo = response.project_info
      } catch (err) {
        console.error('Error loading commits:', err)
        throw err
      }
    }
  }
})
