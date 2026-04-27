<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        <strong>CMS TDR Diff</strong> by
        <a href="https://cern.ch/clange">Clemens Lange</a>.
        Frontend: {{ frontendVersion }}.
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

const frontendVersion = computed(() => {
  const buildHash = config.public.buildHash || 'undefined'
  const buildDate = String(config.public.buildDate || '')
  if (!buildDate) return buildHash

  const parsed = new Date(buildDate)
  if (Number.isNaN(parsed.getTime())) {
    return `${buildHash} (${buildDate})`
  }
  return `${buildHash} (${parsed.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short'
  })})`
})

await mainStore.getBackendVersion()
</script>
