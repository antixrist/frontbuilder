const actions = {
  INCREMENT ({ commit }) {
    commit('INCREMENT')
  },
  INCREMENT_ASYNC ({ commit }) {
    setTimeout(() => {
      commit('INCREMENT')
    }, 1000)
  }
};

export default actions;
