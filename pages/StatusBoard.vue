<template>
  <div>
    <section class="section">
      <h1 class="title is-3">Job status board</h1>
    </section>
    <ClientOnly>
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
            class="status-table"
          >
            <o-table-column
              field="jobId"
              label="Job ID"
              width="100"
              sortable
              v-slot="props"
            >
              {{ props?.row?.jobId || '' }}
            </o-table-column>
            <o-table-column field="project" label="Project" width="120" sortable v-slot="props">
              <template v-if="props?.row">
                {{ props.row.group }} / {{ props.row.project }}
              </template>
            </o-table-column>
            <o-table-column field="status" label="Status" width="40" sortable v-slot="props">
              <span v-if="props?.row" :class="props.row.status_style">{{ props.row.status }}</span>
            </o-table-column>
            <o-table-column
              field="created_at"
              label="Created"
              width="200"
              centered
              sortable
              v-slot="props"
            >
              <template v-if="props?.row">
                {{ props.row.created_at }} ago
              </template>
            </o-table-column>
            <o-table-column field="duration" label="Duration" width="150" centered v-slot="props">
              {{ props?.row?.duration || '' }}
            </o-table-column>
            <o-table-column
              field="expires_at"
              label="Expires"
              width="150"
              centered
              sortable
              v-slot="props"
            >
              {{ props?.row?.expires_at || '' }}
            </o-table-column>
            <o-table-column field="artifact" label="Diff output" v-slot="props">
              <a v-if="props?.row?.artifacts_link" :href="props.row.artifacts_link">{{ props.row.artifacts }}</a>
              <span v-else>{{ props?.row?.artifacts || '' }}</span>
            </o-table-column>
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
    </ClientOnly>
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

<style scoped>
.status-table {
  width: 90vw;
}

@media (max-width: 768px) {
  .status-table {
    width: 100%;
  }
}
</style>
