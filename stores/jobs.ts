import { defineStore } from 'pinia'

interface JobStatus {
  id: number
  status: string
  duration: number
  created_at: string
  artifacts_expire_at: string
  web_url: string
  artifacts: Array<{ filename: string }>
}

interface PipelineStatus {
  pipelineId: number
  jobStatus: JobStatus
}

export const useJobsStore = defineStore('jobs', {
  state: () => ({
    pipelineStatus: [] as PipelineStatus[],
    status: false
  }),

  getters: {},

  actions: {
    async load(pipelineId: number) {
      const index = this.pipelineStatus.findIndex((p) => p.pipelineId === pipelineId)
      if (index >= 0) {
        console.log('Pipeline already in store:', pipelineId)
        return
      }

      try {
        const response = await $fetch(`/api/status/pipeline/${pipelineId}`) as {
          job_status: JobStatus
        }
        this.pipelineStatus.push({
          pipelineId,
          jobStatus: response.job_status
        })
        this.status = true
      } catch (err) {
        console.error('Error loading pipeline status:', err)
        throw err
      }
    },

    async update() {
      if (this.pipelineStatus.length < 1) {
        console.log('No pipelines found')
        return
      }

      for (const pipeline of this.pipelineStatus) {
        const currentPipelineId = Number(pipeline.pipelineId)
        try {
          const response = await $fetch(`/api/status/pipeline/${currentPipelineId}`) as {
            job_status: JobStatus
          }
          const index = this.pipelineStatus.findIndex((p) => p.pipelineId === currentPipelineId)
          if (index >= 0) {
            this.pipelineStatus[index].jobStatus = response.job_status
          }
        } catch (err) {
          console.error('Error updating pipeline:', err)
        }
      }
    }
  }
})
