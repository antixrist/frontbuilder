import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

const state = {
  count: 0
};

const mutations = {
  INCREMENT (state) {
    state.count++
  }
};

const actions = {
  INCREMENT ({commit}) {
    commit('INCREMENT')
  },
  INCREMENT_ASYNC ({commit}) {
    setTimeout(() => {
      commit('INCREMENT')
    }, 1000)
  }
};

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [createPersistedState({
    key: 'appStore'
  })],
  state,
  mutations,
  actions,
  modules: {}
});

export default store;
