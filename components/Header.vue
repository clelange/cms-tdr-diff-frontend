<template>
  <o-navbar>
    <template #brand>
      <o-navbar-item tag="NuxtLink" to="/">
        <o-icon icon="vector-difference" size="small" />
        CMS Paper Diff
      </o-navbar-item>
    </template>

    <template #start>
      <o-navbar-item tag="NuxtLink" to="/">Home</o-navbar-item>
      <o-navbar-item
        v-for="item in tdrTypes"
        :key="item"
        tag="NuxtLink"
        :to="`/${item}`"
      >
        {{ item }}
      </o-navbar-item>
      <o-navbar-item tag="NuxtLink" to="/about">About</o-navbar-item>
    </template>

    <template #end>
      <o-navbar-item href="#" @click.prevent="reloadPage">
        <h1 v-if="apiStatus === 'good'" style="color: green;" class="button">
          API status OK
        </h1>
        <h1 v-else-if="apiStatus === 'bad'" style="color: red;" class="button">
          Cannot connect to backend API
        </h1>
        <h1 v-else class="button">Loading...</h1>
      </o-navbar-item>
      <o-navbar-item tag="NuxtLink" to="/statusboard">
        <div class="buttons">
          <strong>Status Board</strong>
        </div>
      </o-navbar-item>
    </template>
  </o-navbar>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '~/stores/main'

const mainStore = useMainStore()
const { apiStatus, tdrTypes } = storeToRefs(mainStore)

const reloadPage = () => {
  window.location.reload()
}

onMounted(() => {
  mainStore.loadTdr()
})
</script>

<style lang="scss" scoped>
.marker {
  font-family: 'Permanent Marker', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-weight: normal;
}
</style>
