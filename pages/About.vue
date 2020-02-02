<template>
  <div>
    <div>
      <page-header />
    </div>
    <div class="container">
      <div>
        <h1 class="subtitle">Using this website</h1>
        <p>This website uses the GitLab API at CERN to query existing documents
          (papers, reports, and notes) as well as their commit history.</p>
        <p>Start by choosing one of the available categories from the top left
          menu, then pick the document of your interest.
          You can filter the table entries by typing a part of the document name,
          e.g. <i>18-002</i> will show B2G-18-002, BPH-18-002, etc. if available
          in the chosen category.</p>
        <p>By clicking on the document name, you will see a page that displays
          all commits including their corresponding tags.
          Select two commits, and hit submit. This will trigger a job in GitLab to generate the documents for the two chosen commits as well as the difference between them.
          Creating the three PDF files usually takes a few minutes.
          You can follow the progress on the
          <nuxt-link to="/StatusBoard">Status Board</nuxt-link>
          linked from the top right of the page.
          Once the job has completed, a link will appear on the
          <nuxt-link to="/StatusBoard">Status Board</nuxt-link>
          that will allow you to download a zip file of the PDF files.
        </p>
        <hr>
        <h1 class="subtitle">About this project</h1>
        <p>This project has been developed by Clemens Lange.</p>
        <p>Please let me know what you think about it: Drop me an email,
          or if you really like it, <a href="https://ko-fi.com/clange">buy me a coffee</a>!</p>
      </div>
    </div>
      <page-footer />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PageHeader from '~/components/Header.vue'
import PageFooter from '~/components/Footer.vue'

export default {
  components: {
    PageHeader,
    PageFooter
  },
  computed: {
    ...mapState(['tdrTypes', 'apiStatus'])
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 30px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 20px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
