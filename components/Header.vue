<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <NuxtLink class="navbar-item marker" to="/">
        <o-icon icon="vector-difference" size="small" class="mr-1" />
        CMS Paper Diff
      </NuxtLink>

      <button
        class="navbar-burger"
        :class="{ 'is-active': isMenuOpen }"
        type="button"
        aria-label="menu"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>
    </div>

    <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
      <div class="navbar-start">
        <NuxtLink class="navbar-item" to="/">Home</NuxtLink>
        <NuxtLink
          v-for="item in tdrTypes"
          :key="item"
          class="navbar-item"
          :to="`/${item}`"
          @click="isMenuOpen = false"
        >
          {{ item }}
        </NuxtLink>
        <NuxtLink class="navbar-item" to="/about">About</NuxtLink>
      </div>

      <div class="navbar-end">
        <span v-if="currentUserLabel" class="navbar-item user-label">
          <o-icon icon="account" size="small" class="mr-1" />
          {{ currentUserLabel }}
        </span>
        <button class="navbar-item api-status" type="button" @click="reloadPage">
          <span v-if="apiStatus === 'good'" class="button has-text-success">
            API status OK
          </span>
          <span v-else-if="apiStatus === 'bad'" class="button has-text-danger">
            Cannot connect to backend API
          </span>
          <span v-else class="button">Loading...</span>
        </button>
        <NuxtLink class="navbar-item" to="/statusboard">
          <div class="buttons">
            <strong>Status Board</strong>
          </div>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '~/stores/main'

const mainStore = useMainStore()
const { apiStatus, tdrTypes, currentUserLabel } = storeToRefs(mainStore)
const isMenuOpen = ref(false)

const reloadPage = () => {
  window.location.reload()
}

await mainStore.loadTdr()
await mainStore.getCurrentUser()
</script>

<style lang="scss" scoped>
.marker {
  font-family: 'Permanent Marker', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-weight: normal;
}

.api-status {
  background: transparent;
  border: 0;
  cursor: pointer;
}

.user-label {
  max-width: 18rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
