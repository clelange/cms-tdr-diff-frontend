<template>
  <div>
    <o-loading :active="isLoading" :full-page="false" :can-cancel="false"/>
    <section class="section">
      <h1 class="title is-3">{{ categoryName }}</h1>
      <p>You can filter by CADI ID/name using the search box below.</p>
    </section>

    <nav class="panel">
      <div class="panel-block">
        <o-field label="Filter by name" label-position="on-border" grouped>
          <o-input v-model="searchQueryInput" type="text" icon="magnify" placeholder="search"/>
          <p class="control">
            <button
              class="button is-primary"
              size="is-medium"
              :disabled="searchQueryInput == ''"
              @click="clearSearchQuery()"
            >
              Clear filter
            </button>
          </p>
        </o-field>
      </div>
    </nav>
    <div>
      <section>
        <o-tabs>
          <o-field grouped group-multiline>
            <o-select v-model="perPage" :disabled="!isPaginated">
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </o-select>
            <div class="control is-flex">
              <o-switch v-model="isPaginated">Paginated</o-switch>
            </div>
          </o-field>
          <o-table
            :data="filtered"
            :paginated="isPaginated"
            :per-page="perPage"
            pagination-position="top"
            :hoverable="true"
            :striped="true"
            default-sort-direction="asc"
            :default-sort="['last_activity_at', 'desc']"
            sort-icon="chevron-up"
          >
            <o-table-column v-slot="props" field="id" label="ID" width="40" sortable numeric>
              {{ props?.row?.id || '' }}
            </o-table-column>
            <o-table-column v-slot="props" field="name" label="Name" sortable>
              <NuxtLink v-if="props?.row?.name" :to="`/${categoryName}/${props.row.name}`">{{ props.row.name }}</NuxtLink>
            </o-table-column>
            <o-table-column v-slot="props" field="last_activity_at" label="Last activity" centered sortable>
              <span
                v-if="props?.row?.last_activity_at"
                :class="[
                  'tag',
                  {'is-danger': differenceInDays(new Date(), new Date(props.row.last_activity_at)) >= 7},
                  {'is-success': differenceInDays(new Date(), new Date(props.row.last_activity_at)) < 7}
                ]"
              >
                {{ formatDistanceToNow(new Date(props.row.last_activity_at)) }} ago
              </span>
            </o-table-column>
            <o-table-column v-slot="props" field="description" label="Description">
              <LatexText :text="props?.row?.description || ''" />
            </o-table-column>
            <o-table-column v-slot="props" field="web_url" label="GitLab repository">
              <a v-if="props?.row?.web_url" :href="props.row.web_url">{{ props.row.web_url }}</a>
            </o-table-column>
          </o-table>
        </o-tabs>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '~/stores/preferences'
import { useProjectsStore } from '~/stores/projects'
import { formatDistanceToNow, differenceInDays } from 'date-fns'

const route = useRoute()
const projectsStore = useProjectsStore()
const preferencesStore = usePreferencesStore()

const { myProjects } = storeToRefs(projectsStore)
const { searchQuery } = storeToRefs(preferencesStore)

const isLoading = ref(!projectsStore.myProjects.length)
const categoryName = ref((route.params.slug as string[])[0])
const perPage = ref(10)
const isPaginated = ref(true)

const searchQueryInput = computed({
  get: () => searchQuery.value,
  set: (value) => {
    preferencesStore.setSearchQuery(value)
  }
})

const filtered = computed(() => {
  let query = searchQuery.value
  while (query.endsWith('\\')) {
    query = query.slice(0, query.lastIndexOf('\\') - 1)
  }
  const nameRe = new RegExp(query, 'i')

  return myProjects.value.filter(project =>
    project.name.match(nameRe)
  )
})

const clearSearchQuery = () => {
  searchQueryInput.value = ''
}
</script>

<style lang="scss" scoped></style>
