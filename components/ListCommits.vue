<template>
  <div>
    <o-loading :active="isLoading" :full-page="false" :can-cancel="false"></o-loading>
    <section class="section">
      <h1 class="title is-3">{{ categoryName }} / {{ projectInfo?.name }}</h1>
      <h2 class="subtitle is-6">
        description: {{ projectInfo?.description }}
        <br />
        repository:
        <a :href="projectInfo?.web_url">{{ projectInfo?.web_url }}</a>
      </h2>
      <p>
        Select two commits (rows), then hit the submit button to trigger the PDF diff
        job. You can find the status of your jobs on the
        <nuxt-link to="/statusboard">Status Board</nuxt-link>
        page.
      </p>
    </section>

    <div class="notification">
      <o-button
        v-for="(item, index) in checkedRows"
        v-on:click="removeElement(index)"
        :key="index"
        variant="info"
        icon-right="delete"
      >
        {{ item.short_id }}
      </o-button>
      <o-button
        variant="primary"
        size="large"
        :disabled="checkedRows.length != 2 || isSubmitted == true"
        @click="submitJob()"
      >
        Submit
      </o-button>
    </div>
    <section>
      <o-tabs>
        <o-field grouped group-multiline>
          <button
            class="button field is-danger"
            @click="checkedRows = []"
            :disabled="!checkedRows.length"
          >
            <o-icon icon="close"></o-icon>
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
          <div class="control is-flex"></div>
          <div class="control is-flex">
            <o-switch v-model="onlyCADI">Show only CADI versions</o-switch>
          </div>
          <div class="control is-flex"></div>
        </o-field>
        <o-table
          ref="commitsTable"
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
          style="width:90vw;"
          @click="toggleSelected"
        >
          <template #default="{ row }">
            <o-table-column
              field="short_id"
              label="ID"
              width="40"
              sortable
            >
              {{ row.short_id }}
            </o-table-column>
            <o-table-column field="CADI" label="CADI tag" width="120" centered sortable>
              {{ row.CADI ? '&#10004;' : '' }}
            </o-table-column>
            <o-table-column field="title" label="Commit title" sortable>
              {{ row.title }}
            </o-table-column>
            <o-table-column
              field="created_at"
              label="Commit date"
              centered
              sortable
            >
              {{ format(new Date(row.created_at), 'dd/MM/yyyy') }}
            </o-table-column>
            <o-table-column field="author_name" label="Author name">
              {{ row.author_name }}
            </o-table-column>
            <o-table-column field="author_email" label="Author email">
              {{ row.author_email }}
            </o-table-column>
          </template>
          <template #empty>
            <section class="section">
              <div class="content has-text-grey has-text-centered">
                <p>
                  <o-icon icon="emoticon-sad" size="large"></o-icon>
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
import { useMainStore } from '~/stores/main'
import { useCommitsStore } from '~/stores/commits'
import { useJobsStore } from '~/stores/jobs'
import { format } from 'date-fns'

const route = useRoute()
const mainStore = useMainStore()
const commitsStore = useCommitsStore()
const jobsStore = useJobsStore()

const { projectInfo } = storeToRefs(commitsStore)

const isLoading = ref(!mainStore.apiStatus)
const categoryName = ref((route.params.slug as string[])[0])
const searchQuery = ref('')
const perPage = ref(10)
const isPaginated = ref(true)
const onlyCADI = ref(false)
const checkedRows = ref<any[]>([])
const isSubmitted = ref(false)
const commitList = ref<any[]>([])
const currentJob = ref<string | null>(null)

const filtered = computed(() => {
  if (!onlyCADI.value) {
    return commitList.value
  } else {
    return commitList.value.filter(commit => commit.CADI)
  }
})

onMounted(() => {
  commitList.value = commitsStore.commitList
  for (const commit of commitList.value) {
    if (commit.tag?.startsWith('CADI-BuildTag_')) {
      commit.CADI = true
    } else {
      commit.CADI = false
    }
  }
})

const removeElement = (index: number) => {
  checkedRows.value.splice(index, 1)
  isSubmitted.value = false
}

const toggleSelected = (row: any) => {
  const index = checkedRows.value.findIndex(p => p.short_id == row.short_id)
  
  if (index >= 0) {
    checkedRows.value.splice(index, 1)
  } else {
    checkedRows.value.push(row)
  }
  isSubmitted.value = false
}

const compare = (a: any, b: any) => {
  const timeA = new Date(a.created_at)
  const timeB = new Date(b.created_at)
  if (timeA < timeB) {
    return 1
  }
  return -1
}

const submitJob = async () => {
  isSubmitted.value = true
  
  const sorted = checkedRows.value.sort(compare)
  const postDict = {
    sha1: sorted[0].id,
    sha2: sorted[1].id,
    group: categoryName.value,
    project: commitsStore.projectInfo?.name
  }

  try {
    const response = await $fetch('/api/trigger', {
      method: 'POST',
      body: postDict
    }) as { job_id: string }
    
    currentJob.value = response.job_id
    await jobsStore.load(response.job_id)
  } catch (error) {
    console.error(error)
  }
}
</script>

<style lang="scss" scoped></style>
