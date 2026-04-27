<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        <strong>CMS TDR Diff</strong> by
        <a href="https://cern.ch/clange">Clemens Lange</a>.
        Frontend:
        <a :href="frontendVersion.url">{{ frontendVersion.hash }}</a>{{ frontendVersion.dateLabel }}.
        Backend:
        <a :href="backendDisplayVersion.url">{{ backendDisplayVersion.hash }}</a>{{ backendDisplayVersion.dateLabel }}.
        Please report issues and feature requests in the
        <a href="https://gitlab.cern.ch/cms-tdr-diff/cms-tdr-diff-frontend/-/issues"
          >GitLab repository</a
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

const frontendRepoUrl = 'https://gitlab.cern.ch/cms-tdr-diff/cms-tdr-diff-frontend'
const backendRepoUrl = 'https://gitlab.cern.ch/cms-tdr-diff/cms-tdr-diff-backend'

const frontendVersion = computed(() => {
  const buildHash = config.public.buildHash || 'undefined'
  const buildDate = String(config.public.buildDate || '')
  return versionDisplay(buildHash, buildDate, frontendRepoUrl)
})

const backendDisplayVersion = computed(() => {
  return versionDisplay(
    backendVersion.value?.Version || backendVersion.value?.SnapshotTag || 'undefined',
    parseBackendBuildTime(backendVersion.value?.BuildTime || ''),
    backendRepoUrl
  )
})

const versionDisplay = (hash: string, buildDate: string, repoUrl: string) => {
  const trimmedHash = hash || 'undefined'
  const shortHash = trimmedHash.length > 8 ? trimmedHash.slice(0, 8) : trimmedHash
  return {
    hash: shortHash,
    url: `${repoUrl}/-/commit/${trimmedHash}`,
    dateLabel: formatBuildDate(buildDate)
  }
}

const formatBuildDate = (buildDate: string) => {
  if (!buildDate) return ''

  const parsed = new Date(buildDate)
  if (Number.isNaN(parsed.getTime())) {
    return ` (${buildDate})`
  }
  return ` (${parsed.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short'
  })})`
}

const parseBackendBuildTime = (buildTime: string) => {
  const match = buildTime.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (!match) return buildTime

  const [, year, month, day, hour, minute, second] = match
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
}

await mainStore.getBackendVersion()
</script>
