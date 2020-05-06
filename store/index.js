// export const state = () => ({})
export const state = () => ({
  tdrTypes: [],
  apiStatus: null,
  backendVersion: "undefined",
})

export const actions = {
  async loadTdr({ state, commit }) {
    if (state.tdrTypes.length) return
    commit('setApiStatus', null)
    // this.$axios.setToken(this.$env.REQUEST_TOKEN)
    await this.$axios.$get('/types').then(
      tdrTypes => {
        commit('setApiStatus', 'good')
        commit('updateTdr', tdrTypes)
      },
      (err) => {
        console.log(err)
        commit('setApiStatus', 'bad')
      }
    )
  },
  async getBackendVersion({ state, commit }) {
    await this.$axios.$get('/version').then(
      version => {
        commit('setBackendVersion', version)
      },
      (err) => {
        console.log(err)
        commit('setBackendVersion', 'undefined')
      }
    )
  }
}

export const mutations = {
  updateTdr(state, payload) {
    state.tdrTypes = payload
  },
  setApiStatus(state, status) {
    state.apiStatus = status
  },
  setBackendVersion(state, payload) {
    state.getBackendVersion = payload.SnapshotTag
  }
}
