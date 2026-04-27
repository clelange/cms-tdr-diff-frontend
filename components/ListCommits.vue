<template>
  <div>
    <o-loading :active="isLoading" :full-page="false" :can-cancel="false"/>
    <section class="section">
      <h1 class="title is-3">{{ categoryName }} / {{ projectInfo?.name }}</h1>
      <h2 class="subtitle is-6">
        description: <LatexText :text="projectInfo?.description || ''" />
        <br >
        repository:
        <a :href="projectInfo?.web_url">{{ projectInfo?.web_url }}</a>
      </h2>
      <p>
        Select two commits (rows), then hit the submit button to trigger the PDF diff
        job. You can find the status of your jobs on the
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
        page.
      </p>
    </section>

    <o-notification
      v-if="submitError"
      class="submit-error"
      variant="danger"
      closeable
      aria-close-label="Close notification"
      @close="submitError = ''"
    >
      {{ submitError }}
    </o-notification>

    <div class="notification commit-selection">
      <o-button
        v-for="(item, index) in checkedRows"
        :key="index"
        variant="info"
        icon-right="delete"
        @click="removeElement(index)"
      >
        {{ item.short_id }}
      </o-button>
      <o-button
        variant="primary"
        size="large"
        :disabled="checkedRows.length !== 2 || isSubmitted"
        :loading="isSubmitted"
        @click="submitJob"
      >
        {{ isSubmitted ? 'Creating diff job...' : 'Submit' }}
      </o-button>
    </div>
    <section>
      <o-tabs>
        <o-field grouped group-multiline>
          <button
            class="button field is-danger"
            :disabled="!checkedRows.length"
            @click="checkedRows = []"
          >
            <o-icon icon="close"/>
            <span>Clear selected</span>
          </button>
          <o-select v-model="perPage" :disabled="!isPaginated">
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </o-select>
          <div class="control is-flex">
            <o-switch v-model="isPaginated">Paginated</o-switch>
          </div>
          <div class="control is-flex"/>
          <div class="control is-flex">
            <o-switch v-model="onlyCADI">Show only CADI versions</o-switch>
          </div>
          <div class="control is-flex"/>
        </o-field>
        <o-table
          :data="filtered"
          :paginated="isPaginated"
          :per-page="perPage"
          pagination-position="top"
          :hoverable="true"
          :striped="true"
          sort-icon="chevron-up"
          default-sort-direction="asc"
          :default-sort="['created_at', 'desc']"
          :checked-rows="checkedRows"
          checkable
          :header-checkable="false"
          checkbox-position="left"
          class="commit-table"
          @click="toggleSelected"
        >
          <o-table-column
            v-slot="props"
            field="short_id"
            label="ID"
            width="40"
            sortable
          >
            {{ props?.row?.short_id || '' }}
          </o-table-column>
          <o-table-column v-slot="props" field="CADI" label="CADI tag" width="120" centered sortable>
            {{ props?.row?.CADI ? '&#10004;' : '' }}
          </o-table-column>
          <o-table-column v-slot="props" field="title" label="Commit title" sortable>
            <LatexText :text="props?.row?.title || ''" />
          </o-table-column>
          <o-table-column
            v-slot="props"
            field="created_at"
            label="Commit date"
            centered
            sortable
          >
            <template v-if="props?.row?.created_at">
              {{ format(new Date(props.row.created_at), 'dd/MM/yyyy') }}
            </template>
          </o-table-column>
          <o-table-column v-slot="props" field="author_name" label="Author name">
            {{ props?.row?.author_name || '' }}
          </o-table-column>
          <o-table-column v-slot="props" field="author_email" label="Author email">
            {{ props?.row?.author_email || '' }}
          </o-table-column>
          <template #empty>
            <section class="section">
              <div class="content has-text-grey has-text-centered">
                <p>
                  <o-icon icon="emoticon-sad" size="large"/>
                </p>
                <p>No commits found in the last 90 days.</p>
              </div>
            </section>
          </template>
        </o-table>
      </o-tabs>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCommitsStore } from '~/stores/commits'
import { useJobsStore } from '~/stores/jobs'
import type { Commit } from '~/stores/commits'
import { format } from 'date-fns'

type CommitRow = Commit & {
  CADI: boolean
}

const route = useRoute()
const router = useRouter()
const commitsStore = useCommitsStore()
const jobsStore = useJobsStore()

const { projectInfo } = storeToRefs(commitsStore)

const isLoading = computed(() => !projectInfo.value && !commitsStore.commitList.length)
const categoryName = computed(() => {
  const slug = route.params.slug
  const segments = Array.isArray(slug) ? slug : [slug]
  return String(segments[0] || '')
})
const perPage = ref(10)
const isPaginated = ref(true)
const onlyCADI = ref(false)
const checkedRows = ref<CommitRow[]>([])
const isSubmitted = ref(false)
const submitError = ref('')

const commitList = computed<CommitRow[]>(() => {
  return commitsStore.commitList.map(commit => ({
    ...commit,
    CADI: commit.tag?.startsWith('CADI-BuildTag_') || false
  }))
})

const filtered = computed(() => {
  if (!onlyCADI.value) return commitList.value

  return commitList.value.filter(commit => commit.CADI)
})

const removeElement = (index: number) => {
  checkedRows.value.splice(index, 1)
  isSubmitted.value = false
}

const toggleSelected = (row: CommitRow) => {
  const index = checkedRows.value.findIndex(commit => commit.short_id === row.short_id)

  if (index >= 0) {
    checkedRows.value.splice(index, 1)
  } else {
    checkedRows.value.push(row)
  }
  isSubmitted.value = false
}

const compareByNewestFirst = (a: CommitRow, b: CommitRow) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

const submitJob = async () => {
  isSubmitted.value = true
  submitError.value = ''

  const sorted = [...checkedRows.value].sort(compareByNewestFirst)
  const postDict = {
    sha1: sorted[0].id,
    sha2: sorted[1].id,
    group: categoryName.value,
    project: projectInfo.value?.name
  }

  try {
    const response = await $fetch<{ job_id: string; reused?: boolean }>('/api/trigger', {
      method: 'POST',
      body: postDict
    })

    await jobsStore.load(response.job_id).catch(() => undefined)
    await router.push({
      path: '/dashboard',
      query: {
        job: response.job_id,
        reused: response.reused ? '1' : '0'
      }
    })
  } catch (error) {
    console.error(error)
    submitError.value = 'Could not create the diff job. Please check the selected commits and try again.'
    isSubmitted.value = false
  }
}
</script>

<style lang="scss" scoped>
.commit-table {
  width: 90vw;
}

.submit-error {
  margin: 0 1.5rem 1rem;
}

.commit-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

@media (max-width: 768px) {
  .submit-error {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .notification {
    border-radius: 0;
  }

  :deep(.field.is-grouped) {
    flex-wrap: wrap;
  }

  .commit-table {
    width: 100%;
  }
}
</style>
