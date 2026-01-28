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
          :default-sort="['pipelineId', 'asc']"
          :header-checkable="false"
          checkbox-position="left"
          style="width:90vw;"
        >
          <template #default="{ row }">
            <o-table-column
              field="pipeline_id"
              label="PipelineID"
              width="100"
              sortable
              numeric
            >
              {{ row.pipelineId }}
            </o-table-column>
            <o-table-column field="job_id" label="JobID" width="40" sortable numeric>
              {{ row.jobId }}
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
              field="artifacts_expire_at"
              label="Expires"
              width="150"
              centered
              sortable
            >
              {{ row.artifacts_expire_at }}
            </o-table-column>
            <o-table-column field="web_url" label="Job URL">
              <a :href="row.web_url">Link</a>
            </o-table-column>
            <o-table-column field="artifact" label="Diff output">
              <a :href="row.artifacts_link">{{ row.artifacts }}</a>
            </o-table-column>
          </template>
          <template #empty>
            <section class="section">
              <div class="content has-text-grey has-text-centered">
                <p>
                  <o-icon icon="emoticon-sad" size="large"></o-icon>
                </p>
                <p>No pipelines found.</p>
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
import { useMainStore } from '~/stores/main'
import { useJobsStore } from '~/stores/jobs'
import { formatDistanceToNow, differenceInSeconds } from 'date-fns'
import { useIntervalFn } from '@vueuse/core'

const mainStore = useMainStore()
const jobsStore = useJobsStore()

const { tdrTypes, apiStatus } = storeToRefs(mainStore)
const { pipelineStatus } = storeToRefs(jobsStore)

const loaded = computed(() => jobsStore.status)

const filtered = computed(() => {
  console.log('filtered status')
  const massagedPipelines: any[] = []
  
  for (const currentPipeline of pipelineStatus.value) {
    const jobDict: any = {}
    jobDict.pipelineId = currentPipeline.pipelineId
    jobDict.jobId = currentPipeline.jobStatus.id
    jobDict.status = currentPipeline.jobStatus.status
    
    switch (jobDict.status) {
      case 'pending':
        jobDict.status_style = 'tag is-warning'
        jobDict.duration = '-'
        jobDict.artifacts_expire_at = '-'
        jobDict.artifacts_link = ''
        jobDict.artifacts = ''
        break
      case 'running':
        jobDict.status_style = 'tag is-warning'
        jobDict.duration = Number.parseInt(currentPipeline.jobStatus.duration) + ' s'
        jobDict.artifacts_expire_at = '-'
        jobDict.artifacts_link = ''
        jobDict.artifacts = ''
        break
      case 'success':
        jobDict.status_style = 'tag is-success'
        jobDict.duration = Number.parseInt(currentPipeline.jobStatus.duration) + ' s'
        
        if (differenceInSeconds(
          new Date(),
          new Date(currentPipeline.jobStatus.artifacts_expire_at)
        ) > 0) {
          jobDict.artifacts_expire_at = 'expired'
          jobDict.artifacts_link = ''
          jobDict.artifacts = ''
        } else {
          jobDict.artifacts_expire_at =
            'in ' +
            formatDistanceToNow(new Date(currentPipeline.jobStatus.artifacts_expire_at))
          jobDict.artifacts_link =
            currentPipeline.jobStatus.web_url + '/artifacts/download'
          jobDict.artifacts = currentPipeline.jobStatus.artifacts[0].filename
        }
        break
      default:
        jobDict.status_style = 'tag is-danger'
        jobDict.duration = Number.parseInt(currentPipeline.jobStatus.duration) + ' s'
        jobDict.artifacts_expire_at = '-'
        jobDict.artifacts_link = ''
        jobDict.artifacts = ''
    }
    
    jobDict.created_at = formatDistanceToNow(
      new Date(currentPipeline.jobStatus.created_at)
    )
    jobDict.web_url = currentPipeline.jobStatus.web_url
    massagedPipelines.push(jobDict)
  }
  
  return massagedPipelines
})

const updatePipelines = async () => {
  await jobsStore.update()
}

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
