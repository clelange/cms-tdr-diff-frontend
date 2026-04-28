import { defineStore } from 'pinia'

export interface JobArtifact {
  filename: string
  url: string
  size?: number
  type?: string
}

export interface JobStatus {
  id: string
  job_name: string
  project: string
  group: string
  sha1?: string
  sha2?: string
  owner_id?: string
  owner_email?: string
  owner_username?: string
  status: string
  duration: number
  created_at: string
  started_at?: string
  finished_at?: string
  expires_at: string
  download_url?: string
  log_url?: string
  artifacts: JobArtifact[]
  failure_reason?: string
  failure_message?: string
}

export const useJobsStore = defineStore('jobs', {
  state: () => ({
    jobs: [] as JobStatus[],
    logs: {} as Record<string, string>,
    status: false,
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
        const response = (await $fetch(`/api/jobs/${jobId}`)) as {
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
        const response = (await $fetch('/api/jobs')) as { jobs: JobStatus[] }
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
          const response = (await $fetch(`/api/jobs/${job.id}`)) as {
            job_status: JobStatus
          }
          const index = this.jobs.findIndex(
            (storedJob) => storedJob.id === job.id,
          )
          if (index >= 0) {
            this.jobs[index] = response.job_status
          }
        } catch (err) {
          console.error('Error updating job:', err)
        }
      }
    },

    async loadLogs(jobId: string, force = false) {
      if (!force && Object.prototype.hasOwnProperty.call(this.logs, jobId)) {
        return this.logs[jobId]
      }

      const response = (await $fetch(`/api/jobs/${jobId}/logs`)) as {
        job_id: string
        logs: string
      }
      this.logs[jobId] = response.logs
      return response.logs
    },
  },
})
