<template>
  <div>
    <div>
      <page-header />
    </div>
    <div>
      <list-notes v-if="categoryPage" />
      <list-commits v-else />
    </div>
    <div>
      <page-footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore, useProjectsStore, useCommitsStore } from '~/stores'

const route = useRoute()
const mainStore = useMainStore()
const projectsStore = useProjectsStore()
const commitsStore = useCommitsStore()

const { tdrTypes } = storeToRefs(mainStore)

const categoryPage = ref(false)
const categoryName = ref<string | null>(null)
const analysisId = ref<string | null>(null)

onMounted(() => {
  const res = route.params.slug as string[]
  if (res.length <= 1) {
    categoryPage.value = true
    categoryName.value = res[0]
  } else {
    categoryName.value = res[0]
    analysisId.value = res[1]
  }
})

definePageMeta({
  validate: async () => {
    const res = route.params.slug as string[]
    const types = mainStore.tdrTypes
    if (!types.includes(res[0])) {
      return false
    }
    if (res.length <= 1) {
      return true
    }
    if (['papers', 'notes'].includes(res[0])) {
      const notePattern = /^\S{2,}-\d{2}-\d{3}/
      return notePattern.test(res[1])
    }
    return true
  }
})

await useAsyncData(async () => {
  const res = route.params.slug as string[]
  const catName = res[0]
  if (res.length === 1) {
    await projectsStore.load(catName)
  } else if (res.length >= 1) {
    const analysis = res[1]
    await commitsStore.load(catName, analysis)
  }
})
</script>

<style lang="scss" scoped></style>
