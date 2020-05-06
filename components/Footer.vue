<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        <strong>CMS TDR Diff</strong> by
        <a href="https://cern.ch/clange">Clemens Lange</a>.
        Frontend: {{ this.$env.BUILD_HASH || "undefined" }}.
        Backend: {{ backendVersion }}.
        Please report issues and feature requests in the
        <a href="https://github.com/clelange/cms-tdr-diff-frontend/issues">GitHub repository</a>.
      </p>
    </div>
  </footer>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['backendVersion'])
  }
}
</script>

<style>
</style>