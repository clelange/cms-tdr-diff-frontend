<template>
  <div>
    <div>
      <page-header />
    </div>
    <section class="section">
      <h1 class="title is-3">Job status board</h1>
    </section>
    <section class="section">
      <o-tabs>
        <o-table
          :data="filtered"
          :loading="!loaded"
          :hoverable="true"
          :striped="true"
          sort-icon="chevron-up"
          default-sort-direction="asc"
          :default-sort="['created_at_raw', 'desc']"
          :header-checkable="false"
          checkbox-position="left"
          style="width:90vw;"
        >
          <template #default="{ row }">
            <o-table-column
              field="jobId"
              label="Job ID"
              width="100"
              sortable
            >
              {{ row.jobId }}
            </o-table-column>
            <o-table-column field="project" label="Project" width="120" sortable>
              {{ row.group }} / {{ row.project }}
            </o-table-column>
            <o-table-column field="status" label="Status" width="40" sortable>
              <span :class="row.status_style">{{ row.status }}</span>
            </o-table-column>
            <o-table-column
              field="created_at"
              label="Created"
              width="200"
              centered
              sortable
            >
              {{ row.created_at }} ago
            </o-table-column>
            <o-table-column field="duration" label="Duration" width="150" centered>
              {{ row.duration }}
            </o-table-column>
            <o-table-column
              field="expires_at"
              label="Expires"
              width="150"
              centered
              sortable
            >
              {{ row.expires_at }}
            </o-table-column>
            <o-table-column field="artifact" label="Diff output">
              <a v-if="row.artifacts_link" :href="row.artifacts_link">{{ row.artifacts }}</a>
              <span v-else>{{ row.artifacts }}</span>
            </o-table-column>
          </template>
          <template #empty>
            <section class="section">
              <div class="content has-text-grey has-text-centered">
                <p>
                  <o-icon icon="emoticon-sad" size="large"></o-icon>
                </p>
                <p>No jobs found.</p>
              </div>
            </section>
          </template>
        </o-table>
      </o-tabs>
    </section>
    <div>
      <page-footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useJobsStore } from '~/stores/jobs'
import { formatDistanceToNow, differenceInSeconds } from 'date-fns'
import { useIntervalFn } from '@vueuse/core'

const jobsStore = useJobsStore()

const { jobs } = storeToRefs(jobsStore)

const loaded = computed(() => jobsStore.status)

const filtered = computed(() => {
  const massagedJobs: any[] = []
  
  for (const currentJob of jobs.value) {
    const jobDict: any = {}
    jobDict.jobId = currentJob.id
    jobDict.project = currentJob.project
    jobDict.group = currentJob.group
    jobDict.status = currentJob.status
    jobDict.created_at_raw = currentJob.created_at
    
    switch (jobDict.status) {
      case 'pending':
        jobDict.status_style = 'tag is-warning'
        jobDict.duration = '-'
        break
      case 'running':
        jobDict.status_style = 'tag is-warning'
        jobDict.duration = Number(currentJob.duration) + ' s'
        break
      case 'success':
        jobDict.status_style = 'tag is-success'
        jobDict.duration = Number(currentJob.duration) + ' s'
        break
      default:
        jobDict.status_style = 'tag is-danger'
        jobDict.duration = Number(currentJob.duration) + ' s'
    }

    if (jobDict.duration === undefined) {
      jobDict.duration = '-'
    }

    if (differenceInSeconds(new Date(), new Date(currentJob.expires_at)) > 0) {
      jobDict.expires_at = 'expired'
    } else {
      jobDict.expires_at = 'in ' + formatDistanceToNow(new Date(currentJob.expires_at))
    }

    if (currentJob.artifacts?.length) {
      jobDict.artifacts_link = '/api' + currentJob.artifacts[0].url
      jobDict.artifacts = currentJob.artifacts[0].filename
    } else {
      jobDict.artifacts_link = ''
      jobDict.artifacts = jobDict.status === 'success' ? 'not available' : ''
    }
    
    jobDict.created_at = formatDistanceToNow(
      new Date(currentJob.created_at)
    )
    massagedJobs.push(jobDict)
  }
  
  return massagedJobs
})

const updatePipelines = async () => {
  await jobsStore.update()
}

onMounted(async () => {
  await jobsStore.loadAll()
})

useIntervalFn(updatePipelines, 15000)
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
