import { defineStore } from 'pinia'

interface JobStatus {
  id: string
  job_name: string
  project: string
  group: string
  status: string
  duration: number
  created_at: string
  started_at?: string
  finished_at?: string
  expires_at: string
  download_url?: string
  artifacts: Array<{ filename: string; url: string }>
  failure_reason?: string
  failure_message?: string
}

export const useJobsStore = defineStore('jobs', {
  state: () => ({
    jobs: [] as JobStatus[],
    status: false
  }),

  getters: {},

  actions: {
    async load(jobId: string) {
      const index = this.jobs.findIndex((job) => job.id === jobId)
      if (index >= 0) {
        console.log('Job already in store:', jobId)
        return
      }

      try {
        const response = await $fetch(`/api/jobs/${jobId}`) as {
          job_status: JobStatus
        }
        this.jobs.push(response.job_status)
        this.status = true
      } catch (err) {
        console.error('Error loading job status:', err)
        throw err
      }
    },

    async loadAll() {
      try {
        const response = await $fetch('/api/jobs') as { jobs: JobStatus[] }
        this.jobs = response.jobs
        this.status = true
      } catch (err) {
        console.error('Error loading jobs:', err)
        throw err
      }
    },

    async update() {
      if (this.jobs.length < 1) {
        await this.loadAll()
        return
      }

      for (const job of this.jobs) {
        try {
          const response = await $fetch(`/api/jobs/${job.id}`) as {
            job_status: JobStatus
          }
          const index = this.jobs.findIndex((storedJob) => storedJob.id === job.id)
          if (index >= 0) {
            this.jobs[index] = response.job_status
          }
        } catch (err) {
          console.error('Error updating job:', err)
        }
      }
    }
  }
})
