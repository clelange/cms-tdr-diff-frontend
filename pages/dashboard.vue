<template>
  <div>
    <section class="section">
      <h1 class="title is-3">Dashboard</h1>
      <p v-if="currentUserLabel" class="subtitle is-6">
        My diff jobs for {{ currentUserLabel }}
      </p>
      <o-notification
        v-if="dashboardNotice"
        class="dashboard-notice"
        :variant="dashboardNotice.variant"
        closeable
        aria-close-label="Close notification"
        @close="dismissNotice"
      >
        <strong>{{ dashboardNotice.title }}</strong>
        <span>{{ dashboardNotice.message }}</span>
      </o-notification>
    </section>
    <ClientOnly>
      <section class="section dashboard-section">
        <div class="dashboard-table-wrap">
          <o-table
            :data="filtered"
            :loading="!loaded"
            :hoverable="true"
            :striped="true"
            :scrollable="true"
            :mobile-cards="true"
            mobile-breakpoint="768px"
            detailed
            row-key="jobId"
            :show-detail-icon="false"
            v-model:detailed-rows="detailedRows"
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
              width="120"
              sortable
              v-slot="props"
            >
              <span :id="`job-${props?.row?.jobId || ''}`" class="job-id">
                {{ props?.row?.jobId || '' }}
              </span>
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
            <o-table-column field="logs" label="Logs" width="100" centered v-slot="props">
              <template v-if="props?.row">
                <button
                  class="button is-small"
                  type="button"
                  :disabled="loadingLogs[props.row.jobId]"
                  @click="toggleLogs(props.row)"
                >
                  {{ isDetailed(props.row) ? 'Hide' : 'Show' }}
                </button>
              </template>
            </o-table-column>
            <template #detail="{ row }">
              <div class="job-detail">
                <div class="job-detail-header">
                  <strong>Job {{ row.jobId }}</strong>
                  <span :class="row.status_style">{{ row.status }}</span>
                </div>
                <dl class="job-meta">
                  <div>
                    <dt>Project</dt>
                    <dd>{{ row.group }} / {{ row.project }}</dd>
                  </div>
                  <div>
                    <dt>Commits</dt>
                    <dd>{{ row.sha1_short }} -> {{ row.sha2_short }}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{{ row.created_at }} ago</dd>
                  </div>
                  <div>
                    <dt>Expires</dt>
                    <dd>{{ row.expires_at }}</dd>
                  </div>
                </dl>
                <div v-if="row.failure_message" class="notification is-danger is-light">
                  {{ row.failure_message }}
                </div>
                <div class="log-panel">
                  <div class="log-panel-title">Build log</div>
                  <pre v-if="logs[row.jobId]" class="log-output">{{ logs[row.jobId] }}</pre>
                  <span v-else-if="loadingLogs[row.jobId]">Loading logs...</span>
                  <span v-else class="has-text-danger">{{ logErrors[row.jobId] || 'Logs are not available yet.' }}</span>
                </div>
              </div>
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
        </div>
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
const route = useRoute()
const router = useRouter()

const { jobs, logs } = storeToRefs(jobsStore)
const { currentUserLabel } = storeToRefs(mainStore)

const loaded = computed(() => jobsStore.status)
const loadingLogs = ref<Record<string, boolean>>({})
const logErrors = ref<Record<string, string>>({})
const detailedRows = ref<any[]>([])
const noticeDismissed = ref(false)
const requestedJobOpened = ref(false)

const requestedJobId = computed(() => {
  const value = route.query.job
  return typeof value === 'string' ? value : ''
})

const dashboardNotice = computed(() => {
  if (noticeDismissed.value || !requestedJobId.value) return null
  const reused = route.query.reused === '1'
  return {
    variant: reused ? 'info' : 'success',
    title: reused ? 'Existing diff found.' : 'Diff job created.',
    message: `Job ${requestedJobId.value} is shown below. Use Show logs for build details.`
  }
})

const filtered = computed(() => {
  const massagedJobs: any[] = []
  
  for (const currentJob of jobs.value) {
    const jobDict: any = {}
    jobDict.jobId = currentJob.id
    jobDict.project = currentJob.project
    jobDict.group = currentJob.group
    jobDict.sha1 = currentJob.sha1
    jobDict.sha2 = currentJob.sha2
    jobDict.sha1_short = shortSha(currentJob.sha1)
    jobDict.sha2_short = shortSha(currentJob.sha2)
    jobDict.status = currentJob.status
    jobDict.failure_message = currentJob.failure_message || currentJob.failure_reason || ''
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

const isDetailed = (row: any) => detailedRows.value.some((detailsRow) => detailsRow.jobId === row.jobId)

const setDetailed = (row: any, open: boolean) => {
  const existing = detailedRows.value.filter((detailsRow) => detailsRow.jobId !== row.jobId)
  detailedRows.value = open ? [...existing, row] : existing
}

const toggleLogs = async (row: any) => {
  const opening = !isDetailed(row)
  setDetailed(row, opening)
  if (!opening || logs.value[row.jobId]) return

  loadingLogs.value[row.jobId] = true
  logErrors.value[row.jobId] = ''
  try {
    await jobsStore.loadLogs(row.jobId)
  } catch (error: any) {
    logErrors.value[row.jobId] = error?.data?.error?.message || 'Could not load logs.'
  } finally {
    loadingLogs.value[row.jobId] = false
  }
}

const dismissNotice = () => {
  noticeDismissed.value = true
}

const openRequestedJob = async () => {
  if (!requestedJobId.value || requestedJobOpened.value) return

  const row = filtered.value.find((job) => job.jobId === requestedJobId.value)
  if (row) {
    setDetailed(row, true)
    requestedJobOpened.value = true
    await nextTick()
    document.getElementById(`job-${requestedJobId.value}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
}

const normalizeRoute = async () => {
  if (route.path !== '/dashboard') {
    await router.replace({
      path: '/dashboard',
      query: route.query
    })
  }
}

const shortSha = (sha?: string) => sha ? sha.slice(0, 8) : '-'

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

onMounted(async () => {
  await normalizeRoute()
  await mainStore.getCurrentUser()
  await jobsStore.loadAll()
  if (requestedJobId.value) {
    await jobsStore.load(requestedJobId.value).catch(() => undefined)
    await openRequestedJob()
  }
})

watch(requestedJobId, () => {
  requestedJobOpened.value = false
  noticeDismissed.value = false
})

watch(filtered, openRequestedJob)

useIntervalFn(updatePipelines, 15000)
</script>

<style scoped>
.dashboard-notice {
  margin-top: 1rem;
}

.dashboard-notice :deep(.o-notification__content) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dashboard-section {
  padding-top: 0;
}

.dashboard-table-wrap {
  max-width: 100%;
}

.status-table {
  width: 100%;
}

.job-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9rem;
}

.artifact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.artifact-links .button {
  max-width: 18rem;
  overflow: hidden;
  text-overflow: ellipsis;
  justify-content: flex-start;
}

.job-detail {
  padding: 1rem;
  text-align: left;
}

.job-detail-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.job-meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.job-meta div {
  min-width: 0;
}

.job-meta dt {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.job-meta dd {
  margin: 0.15rem 0 0;
  overflow-wrap: anywhere;
}

.log-panel {
  width: 100%;
}

.log-panel-title {
  font-weight: 700;
  margin-bottom: 0.35rem;
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
  .section {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .status-table {
    width: 100%;
  }

  .artifact-links {
    flex-direction: column;
  }

  .artifact-links .button {
    max-width: 100%;
    width: 100%;
  }

  .job-detail {
    padding: 0.75rem 0;
  }

  .job-detail-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .job-meta {
    grid-template-columns: 1fr;
  }
}
</style>
