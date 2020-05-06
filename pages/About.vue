<template>
  <div>
    <page-header />
    <section class="hero">
      <div class="hero-body">
        <h1 class="title">Using this website</h1>
        <p>
          This website uses the GitLab API at CERN to query existing documents
          (papers, reports, and notes) as well as their commit history.
        </p>

        <p>
          Start by choosing one of the available categories from the top left
          menu, then pick the document of your interest. You can filter the
          table entries by typing a part of the document name, e.g.
          <b>18-002</b> will show B2G-18-002, BPH-18-002, etc. if available in
          the chosen category.
        </p>
        <p>
          By clicking on the document name, you will see a page that displays
          all commits including their corresponding tags. Select two commits,
          and hit submit. This will trigger a job in GitLab to generate the
          documents for the two chosen commits as well as the difference between
          them. Creating the three PDF files usually takes a few minutes. You
          can follow the progress on the
          <nuxt-link to="/StatusBoard">Status Board</nuxt-link> linked from the
          top right of the page. Once the job has completed, a link will appear
          on the <nuxt-link to="/StatusBoard">Status Board</nuxt-link> that will
          allow you to download a zip file of the PDF files.
        </p>
        <p>
          Please mind that parsing LateX programmatically is difficult and building
          a diff is not always possible. In particular, if the TeX files produce
          errors for one or both of the two chosen commits, the diff will most
          likely not work either.
        </p>
      </div>
    </section>
    <section class="hero">
      <div class="hero-body">
        <h1 class="title">About this project</h1>
        <p>This project has been developed by Clemens Lange.</p>
        <p>
          Please let me know what you think about it: Drop me an email, or if
          you really like it,
          <a href="https://www.buymeacoffee.com/clange">buy me a tea</a>!
          <br /><link
            href="https://fonts.googleapis.com/css?family=Cookie"
            rel="stylesheet"
          /><a
            class="bmc-button"
            target="_blank"
            href="https://www.buymeacoffee.com/clange"
            ><img
              src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
              alt="Buy me a tea"
            /><span style="margin-left:15px;font-size:28px !important;"
              >Buy me a tea</span
            ></a
          >
        </p>
      </div>
    </section>
    <page-footer />
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

.bmc-button img {
  height: 34px !important;
  width: 35px !important;
  margin-bottom: 1px !important;
  box-shadow: none !important;
  border: none !important;
  vertical-align: middle !important;
}
.bmc-button {
  padding: 7px 10px 7px 10px !important;
  line-height: 35px !important;
  height: 51px !important;
  min-width: 217px !important;
  text-decoration: none !important;
  display: inline-flex !important;
  color: #ffffff !important;
  background-color: #ff813f !important;
  border-radius: 5px !important;
  border: 1px solid transparent !important;
  padding: 7px 10px 7px 10px !important;
  font-size: 22px !important;
  letter-spacing: 0.6px !important;
  box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;
  -webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
  margin: 0 auto !important;
  font-family: 'Cookie', cursive !important;
  -webkit-box-sizing: border-box !important;
  box-sizing: border-box !important;
  -o-transition: 0.3s all linear !important;
  -webkit-transition: 0.3s all linear !important;
  -moz-transition: 0.3s all linear !important;
  -ms-transition: 0.3s all linear !important;
  transition: 0.3s all linear !important;
}
.bmc-button:hover,
.bmc-button:active,
.bmc-button:focus {
  -webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
  text-decoration: none !important;
  box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
  opacity: 0.85 !important;
  color: #ffffff !important;
}
</style>
