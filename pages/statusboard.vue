<template>
  <div />
</template>

<script setup lang="ts">
const route = useRoute()
const query = route.fullPath.includes('?')
  ? route.fullPath.slice(route.fullPath.indexOf('?'))
  : ''

await navigateTo(`/dashboard${query}`, { redirectCode: 302 })
</script>
