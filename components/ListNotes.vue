<template>
  <div>
    <o-loading :active="isLoading" :full-page="false" :can-cancel="false"></o-loading>
    <section class="section">
      <h1 class="title is-3">{{ categoryName }}</h1>
      <p>You can filter by CADI ID/name using the search box below.</p>
    </section>

    <nav class="panel">
      <div class="panel-block">
        <o-field label="Filter by name" label-position="on-border" grouped>
          <o-input v-model="searchQueryInput" type="text" icon="magnify" placeholder="search"></o-input>
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
            <template #default="{ row }">
              <o-table-column field="id" label="ID" width="40" sortable numeric>{{ row.id }}</o-table-column>
              <o-table-column field="name" label="Name" sortable>
                <nuxt-link :to="row.name" append>{{ row.name }}</nuxt-link>
              </o-table-column>
              <o-table-column field="last_activity_at" label="Last activity" centered sortable>
                <span :class="[
                  'tag',
                  {'is-danger': differenceInDays(new Date(), new Date(row.last_activity_at)) >= 7},
                  {'is-success': differenceInDays(new Date(), new Date(row.last_activity_at)) < 7}
                ]">
                  {{ formatDistanceToNow(new Date(row.last_activity_at)) }} ago
                </span>
              </o-table-column>
              <o-table-column field="description" label="Description">{{ row.description }}</o-table-column>
              <o-table-column field="web_url" label="GitLab repository">
                <a :href="row.web_url">{{ row.web_url }}</a>
              </o-table-column>
            </template>
          </o-table>
        </o-tabs>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePreferencesStore, useProjectsStore } from '~/stores'
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
