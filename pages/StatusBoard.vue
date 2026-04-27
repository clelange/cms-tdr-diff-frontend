<template>
  <div>
    <section class="section">
      <h1 class="title is-3">My diff jobs</h1>
      <p v-if="currentUserLabel" class="subtitle is-6">
        {{ currentUserLabel }}
      </p>
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
              <div v-if="props?.row?.artifacts?.length" class="artifact-links">
                <a
                  v-for="artifact in props.row.artifacts"
                  :key="artifact.href"
                  :href="artifact.href"
                  class="button is-small is-light"
                >
                  {{ artifact.label }}
                </a>
              </div>
              <span v-else>{{ props?.row?.artifacts_text || '' }}</span>
            </o-table-column>
            <o-table-column field="logs" label="Logs" v-slot="props">
              <template v-if="props?.row">
                <button
                  class="button is-small"
                  type="button"
                  :disabled="loadingLogs[props.row.jobId]"
                  @click="toggleLogs(props.row.jobId)"
                >
                  {{ visibleLogs[props.row.jobId] ? 'Hide' : 'Show' }}
                </button>
                <div v-if="visibleLogs[props.row.jobId]" class="log-panel">
                  <pre v-if="logs[props.row.jobId]" class="log-output">{{ logs[props.row.jobId] }}</pre>
                  <span v-else-if="loadingLogs[props.row.jobId]">Loading...</span>
                  <span v-else class="has-text-danger">{{ logErrors[props.row.jobId] || 'Logs are not available.' }}</span>
                </div>
              </template>
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
import { useMainStore } from '~/stores/main'
import { formatDistanceToNow, differenceInSeconds } from 'date-fns'
import { useIntervalFn } from '@vueuse/core'

const jobsStore = useJobsStore()
const mainStore = useMainStore()

const { jobs, logs } = storeToRefs(jobsStore)
const { currentUserLabel } = storeToRefs(mainStore)

const loaded = computed(() => jobsStore.status)
const visibleLogs = ref<Record<string, boolean>>({})
const loadingLogs = ref<Record<string, boolean>>({})
const logErrors = ref<Record<string, string>>({})

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
      jobDict.artifacts = currentJob.artifacts.map((artifact) => ({
        href: '/api' + artifact.url,
        label: artifact.filename === 'output.zip'
          ? 'output.zip'
          : `${artifact.filename}${artifact.size ? ` (${formatBytes(artifact.size)})` : ''}`
      }))
    } else {
      jobDict.artifacts = []
      jobDict.artifacts_text = jobDict.status === 'success' ? 'not available' : ''
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

const toggleLogs = async (jobId: string) => {
  visibleLogs.value[jobId] = !visibleLogs.value[jobId]
  if (!visibleLogs.value[jobId] || logs.value[jobId]) return

  loadingLogs.value[jobId] = true
  logErrors.value[jobId] = ''
  try {
    await jobsStore.loadLogs(jobId)
  } catch (error: any) {
    logErrors.value[jobId] = error?.data?.error?.message || 'Could not load logs.'
  } finally {
    loadingLogs.value[jobId] = false
  }
}

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

onMounted(async () => {
  await mainStore.getCurrentUser()
  await jobsStore.loadAll()
})

useIntervalFn(updatePipelines, 15000)
</script>

<style scoped>
.status-table {
  width: 90vw;
}

.artifact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.artifact-links .button {
  max-width: 20rem;
  overflow: hidden;
  text-overflow: ellipsis;
  justify-content: flex-start;
}

.log-panel {
  margin-top: 0.5rem;
  max-width: min(48rem, 80vw);
}

.log-output {
  max-height: 22rem;
  overflow: auto;
  padding: 0.75rem;
  background: #1f2933;
  color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}

@media (max-width: 768px) {
  .status-table {
    width: 100%;
  }

  .artifact-links .button,
  .log-panel {
    max-width: 100%;
  }
}
</style>
