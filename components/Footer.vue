<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        <strong>CMS TDR Diff</strong> by
        <a href="https://cern.ch/clange">Clemens Lange</a>.
        Version hash {{ this.$env.BUILD_HASH || "undefined" }}. Please report issues and feature requests in the
        <a href="https://github.com/clelange/cms-tdr-diff-frontend/issues">GitHub repository</a>.
      </p>
    </div>
  </footer>
</template>

<script>
export default {}
</script>

<style>
</style>