<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        <strong>CMS TDR Diff</strong> by
        <a href="https://cern.ch/clange">Clemens Lange</a>.
        Frontend: {{ config.public.buildHash || 'undefined' }}.
        Backend: {{ backendVersion }}.
        Please report issues and feature requests in the
        <a href="https://github.com/clelange/cms-tdr-diff-frontend/issues"
          >GitHub repository</a
        >.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '~/stores/main'

const config = useRuntimeConfig()
const mainStore = useMainStore()
const { backendVersion } = storeToRefs(mainStore)

onMounted(() => {
  mainStore.getBackendVersion()
})
</script>
