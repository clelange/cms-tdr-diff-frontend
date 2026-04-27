<template>
  <div class="home-page">
    <div class="home-content">
      <div class="home-logo">
        <cms-logo />
      </div>
      <h1 class="home-title">CMS paper and notes diff</h1>
      <h2 class="home-subtitle">Choose a category to browse:</h2>
      <div class="links">
        <span v-for="item in tdrTypes" :key="item">
          <NuxtLink :to="`/${item}`" class="button--grey">{{ item }}</NuxtLink>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '~/stores/main'

const mainStore = useMainStore()
const { tdrTypes } = storeToRefs(mainStore)

await mainStore.loadTdr()
</script>

<style scoped>
.home-page {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
}

.home-content {
  width: 100%;
}

.home-logo :deep(svg) {
  width: 320px;
  max-width: 80%;
  height: auto;
}

.home-title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 80px;
  line-height: 1.05;
  color: #35495e;
  letter-spacing: 1px;
  margin: 1rem 0;
}

.home-subtitle {
  font-weight: 300;
  font-size: 24px;
  color: #526488;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}

@media (max-width: 768px) {
  .home-page {
    min-height: auto;
    align-items: flex-start;
    padding: 2rem 1rem 3rem;
  }

  .home-logo :deep(svg) {
    width: 260px;
    max-width: 72%;
  }

  .home-title {
    font-size: 42px;
    line-height: 1.12;
  }

  .home-subtitle {
    font-size: 18px;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .button--grey {
    margin: 0;
    padding: 0.65rem 1.25rem;
  }
}
</style>
