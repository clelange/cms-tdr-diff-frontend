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
            v-model:detailed-rows="detailedRows"
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
            sort-icon="chevron-up"
            default-sort-direction="asc"
            :default-sort="['created_at_raw', 'desc']"
            :header-checkable="false"
            checkbox-position="left"
            class="status-table"
          >
            <o-table-column
              v-slot="props"
              field="jobId"
              label="Job ID"
              width="120"
              sortable
            >
              <span :id="`job-${props?.row?.jobId || ''}`" class="job-id">
                {{ props?.row?.jobId || '' }}
              </span>
            </o-table-column>
            <o-table-column v-slot="props" field="project" label="Project" width="120" sortable>
              <template v-if="props?.row">
                {{ props.row.group }} / {{ props.row.project }}
              </template>
            </o-table-column>
            <o-table-column v-slot="props" field="status" label="Status" width="40" sortable>
              <span v-if="props?.row" :class="props.row.status_style">{{ props.row.status }}</span>
            </o-table-column>
            <o-table-column
              v-slot="props"
              field="created_at"
              label="Created"
              width="200"
              centered
              sortable
            >
              <template v-if="props?.row">
                {{ props.row.created_at }} ago
              </template>
            </o-table-column>
            <o-table-column v-slot="props" field="duration" label="Duration" width="150" centered>
              {{ props?.row?.duration || '' }}
            </o-table-column>
            <o-table-column
              v-slot="props"
              field="expires_at"
              label="Expires"
              width="150"
              centered
              sortable
            >
              {{ props?.row?.expires_at || '' }}
            </o-table-column>
            <o-table-column v-slot="props" field="artifact" label="Diff output">
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
            <o-table-column v-slot="props" field="logs" label="Logs" width="100" centered>
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
                    <o-icon icon="emoticon-sad" size="large"/>
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
import type { JobArtifact, JobStatus } from '~/stores/jobs'
import { formatDistanceToNow, differenceInSeconds } from 'date-fns'
import { useIntervalFn } from '@vueuse/core'

interface DashboardArtifact {
  href: string
  label: string
}

interface DashboardRow {
  jobId: string
  project: string
  group: string
  sha1?: string
  sha2?: string
  sha1_short: string
  sha2_short: string
  status: string
  status_style: string
  duration: string
  failure_message: string
  created_at_raw: string
  created_at: string
  expires_at: string
  artifacts: DashboardArtifact[]
  artifacts_text: string
}

const jobsStore = useJobsStore()
const mainStore = useMainStore()
const route = useRoute()
const router = useRouter()

const { jobs, logs } = storeToRefs(jobsStore)
const { currentUserLabel } = storeToRefs(mainStore)

const loaded = computed(() => jobsStore.status)
const loadingLogs = ref<Record<string, boolean>>({})
const logErrors = ref<Record<string, string>>({})
const detailedRows = ref<DashboardRow[]>([])
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

const filtered = computed<DashboardRow[]>(() => jobs.value.map(toDashboardRow))

const updatePipelines = async () => {
  await jobsStore.update()
}

const isDetailed = (row: DashboardRow) =>
  detailedRows.value.some(detailsRow => detailsRow.jobId === row.jobId)

const setDetailed = (row: DashboardRow, open: boolean) => {
  const existing = detailedRows.value.filter(detailsRow => detailsRow.jobId !== row.jobId)
  detailedRows.value = open ? [...existing, row] : existing
}

const toggleLogs = async (row: DashboardRow) => {
  const opening = !isDetailed(row)
  setDetailed(row, opening)
  if (!opening || logs.value[row.jobId]) return

  loadingLogs.value[row.jobId] = true
  logErrors.value[row.jobId] = ''
  try {
    await jobsStore.loadLogs(row.jobId)
  } catch (error: unknown) {
    logErrors.value[row.jobId] = getFetchErrorMessage(error) || 'Could not load logs.'
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

const toDashboardRow = (job: JobStatus): DashboardRow => {
  const { status_style, duration } = getStatusDisplay(job)
  const artifacts = formatArtifacts(job.artifacts || [])

  return {
    jobId: job.id,
    project: job.project,
    group: job.group,
    sha1: job.sha1,
    sha2: job.sha2,
    sha1_short: shortSha(job.sha1),
    sha2_short: shortSha(job.sha2),
    status: job.status,
    status_style,
    duration,
    failure_message: job.failure_message || job.failure_reason || '',
    created_at_raw: job.created_at,
    created_at: formatDistanceToNow(new Date(job.created_at)),
    expires_at: formatExpiresAt(job.expires_at),
    artifacts,
    artifacts_text: artifacts.length ? '' : job.status === 'success' ? 'not available' : ''
  }
}

const getStatusDisplay = (job: JobStatus) => {
  switch (job.status) {
    case 'pending':
      return { status_style: 'tag is-warning', duration: '-' }
    case 'running':
      return { status_style: 'tag is-warning', duration: formatDuration(job.duration) }
    case 'success':
      return { status_style: 'tag is-success', duration: formatDuration(job.duration) }
    default:
      return { status_style: 'tag is-danger', duration: formatDuration(job.duration) }
  }
}

const formatDuration = (duration?: number) => {
  if (!Number.isFinite(duration)) return '-'

  return `${Number(duration)} s`
}

const formatExpiresAt = (expiresAt: string) => {
  if (differenceInSeconds(new Date(), new Date(expiresAt)) > 0) return 'expired'

  return `in ${formatDistanceToNow(new Date(expiresAt))}`
}

const formatArtifacts = (artifacts: JobArtifact[]): DashboardArtifact[] =>
  artifacts.map(artifact => ({
    href: `/api${artifact.url}`,
    label: artifact.filename === 'output.zip'
      ? 'output.zip'
      : `${artifact.filename}${artifact.size ? ` (${formatBytes(artifact.size)})` : ''}`
  }))

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

const getFetchErrorMessage = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('data' in error)) return ''

  const data = (error as { data?: { error?: { message?: unknown } } }).data
  return typeof data?.error?.message === 'string' ? data.error.message : ''
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
