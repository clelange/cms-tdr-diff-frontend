<template>
  <div>
    <ClientOnly>
      <list-notes v-if="isCategoryPage" />
      <list-commits v-else />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useCommitsStore } from '~/stores/commits'
import { useMainStore } from '~/stores/main'
import { useProjectsStore } from '~/stores/projects'

definePageMeta({
  key: route => route.fullPath
})

const route = useRoute()
const mainStore = useMainStore()
const projectsStore = useProjectsStore()
const commitsStore = useCommitsStore()

const slug = route.params.slug
const pathSegments = (Array.isArray(slug) ? slug : [slug])
  .map(segment => String(segment || ''))
  .filter(Boolean)

const categoryName = pathSegments[0] || ''
const analysisId = pathSegments[1] || ''
const isCategoryPage = computed(() => pathSegments.length === 1)

await mainStore.loadTdr()

if (!categoryName || !mainStore.tdrTypes.includes(categoryName) || pathSegments.length > 2) {
  throw createError({
    statusCode: 404,
    statusMessage: `Page not found: ${route.path}`
  })
}

if (isCategoryPage.value) {
  await projectsStore.load(categoryName)
} else {
  const notePattern = /^\S{2,}-\d{2}-\d{3}/
  if (!notePattern.test(analysisId)) {
    throw createError({
      statusCode: 404,
      statusMessage: `Unknown project: ${analysisId}`
    })
  }
  await commitsStore.load(categoryName, analysisId)
}
</script>
