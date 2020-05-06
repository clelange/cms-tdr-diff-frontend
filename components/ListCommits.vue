<template>
  <div>
    <b-loading :active.sync="isLoading" :can-cancel="false"></b-loading>
    <section class="section">
      <h1 class="title is-3">{{ categoryName }} / {{ $store.state.commits.projectInfo.name }}</h1>
      <h2 class="subtitle is-6">
        description: {{ $store.state.commits.projectInfo.description }}
        <br />repository:
        <a
          :href="$store.state.commits.projectInfo.web_url"
        >{{ $store.state.commits.projectInfo.web_url }}</a>
      </h2>
      <p>
        Select two commits (rows), then hit the submit button to trigger the PDF diff pipeline. You can find the status of your jobs on the
        <nuxt-link to="/statusboard">Status Board</nuxt-link> page.
      </p>
      <p>You can filter the table entries by commit hash, commit title, and author name using the search boxes in the respective table columns below. This will also show matches from other pages. For papers and PAS, you can also only show the commits that correspond to a version upload via CADI. It might also be useful to sort by commit date.</p>
    </section>

    <div class="notification">
      <b-button
        v-for="(item, key, index) in checkedRows"
        v-on:click="removeElement(index)"
        :key="index"
        type="is-info"
        icon-right="delete"
      >{{ item.short_id }}</b-button>
      <b-button
        type="is-primary"
        size="is-large"
        v-bind:disabled="checkedRows.length != 2 || isSubmitted == true"
        @click="submitJob()"
      >Submit</b-button>
    </div>
    <section>
      <b-tabs>
        <b-field grouped group-multiline>
          <button
            class="button field is-danger"
            @click="checkedRows = []"
            :disabled="!checkedRows.length"
          >
            <b-icon icon="close"></b-icon>
            <span>Clear selected</span>
          </button>
          <b-select v-model="perPage" :disabled="!isPaginated">
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </b-select>
          <div class="control is-flex">
            <b-switch v-model="isPaginated">Paginated</b-switch>
          </div>
          <div class="control is-flex"></div>
          <div class="control is-flex">
            <b-switch v-model="onlyCADI">Show only CADI versions</b-switch>
          </div>
          <div class="control is-flex"></div>
        </b-field>
        <b-table
          ref="commitsTable"
          :data="filtered"
          :paginated="isPaginated"
          :per-page="perPage"
          pagination-position="top"
          :hoverable="true"
          :striped="true"
          sort-icon="chevron-up"
          default-sort-direction="asc"
          :default-sort="['created_at', 'desc']"
          :checked-rows.sync="checkedRows"
          checkable
          :header-checkable="false"
          checkbox-position="left"
          style="width:90vw;"
          @click="(row) => toggleSelected(row)"
        >
          <template slot-scope="props">
            <b-table-column
              field="short_id"
              label="ID"
              width="40"
              sortable
              searchable
            >{{ props.row.short_id }}</b-table-column>
            <b-table-column
              field="CADI"
              label="CADI tag"
              width="120"
              centered
              sortable
            >{{ props.row.CADI ? "&#10004;" : "" }}</b-table-column>
            <b-table-column
              field="title"
              label="Commit title"
              sortable
              searchable
            >{{ props.row.title }}</b-table-column>
            <b-table-column
              field="created_at"
              label="Commit date"
              centered
              sortable
            >{{ $dateFns.format(new Date(props.row.created_at), 'dd/MM/yyyy') }}</b-table-column>
            <b-table-column
              field="author_name"
              label="Author name"
              searchable
            >{{ props.row.author_name }}</b-table-column>
            <b-table-column field="author_email" label="Author email">{{ props.row.author_email }}</b-table-column>
          </template>
          <template slot="empty">
            <section class="section">
              <div class="content has-text-grey has-text-centered">
                <p>
                  <b-icon icon="emoticon-sad" size="is-large"></b-icon>
                </p>
                <p>No commits found in the last 90 days.</p>
              </div>
            </section>
          </template>
        </b-table>
      </b-tabs>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoading: !this.$store.state.apiStatus,
      categoryName: this.$route.params.pathMatch.split('/')[0],
      search_query: '',
      perPage: 10,
      isPaginated: true,
      onlyCADI: false,
      checkedRows: [],
      isSubmitted: false,
      commitList: [],
      currentPipeline: null
    }
  },
  computed: {
    filtered() {
      if (!this.onlyCADI) {
        return this.commitList
      }
      else {
        const myCommitList = this.commitList
        var tableData = []
        for (var i in this.commitList) {
          if (myCommitList[i].CADI) {
            tableData.push(myCommitList[i])
          }
        }
        return tableData
      }
    }
  },
  mounted() {
    this.commitList = this.$store.state.commits.commitList
    for (var i in this.commitList) {
        if (
          this.commitList[i].tag.startsWith("CADI-BuildTag_")
        ) {
          this.commitList[i].CADI = true
        }
        else {
          this.commitList[i].CADI = false
        }
      }
    console.log(this.commitList)
  },
  methods: {
    removeElement(index) {
      this.checkedRows.splice(index, 1)
      this.isSubmitted = false
    },
    toggleSelected(row) {
      const index = this.checkedRows.findIndex(p => p.short_id == row.short_id)
      console.log(row, index)

      if (index >= 0) {
        this.checkedRows.splice(index, 1)
      } else {
        this.checkedRows.push(row)
      }
      this.isSubmitted = false
    },
    success(payload) {
      this.$buefy.toast.open({
        duration: 8000,
        message:
          payload.status + ' Pipeline ID: ' + payload.pipeline_id.toString(),
        type: 'is-success'
      })
    },
    compare(a, b) {
      const timeA = new Date(a.created_at)
      const timeB = new Date(b.created_at)
      let comparison = 0
      if (timeA < timeB) {
        return 1
      } else return -1
    },
    async submitJob() {
      this.isSubmitted = true
      this.$buefy.toast.open({
        duration: 5000,
        message:
          'Submitting job to GitLab',
        type: 'is-info'
      })
      const sorted = this.checkedRows.sort(this.compare)
      // older comes first
      // console.log(sorted, sorted[0].short_id, sorted[1].short_id)
      const postDict = {
        sha1: sorted[0].id,
        sha2: sorted[1].id,
        group: this.categoryName,
        project: this.$store.state.commits.projectInfo.name
      }
      // this.$axios.setToken(this.$env.REQUEST_TOKEN)
      await this.$axios
        .$post('/trigger', postDict)
        .then(response => {
          console.log(response.pipeline_id)
          this.currentPipeline = response.pipeline_id
          this.$store.dispatch('jobs/load', response.pipeline_id)
          this.success(response)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped></style>
