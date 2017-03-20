import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import createLogger from 'vuex/dist/logger';
import { isDevelopment } from '../../config';

import getters from './getters';
import modules from './modules';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: isDevelopment,
  plugins: [
    ...(isDevelopment ? [createLogger()] : []),
    createPersistedState()
  ],

  state: {

  },

  mutations: {
  },

  actions: {
  },

  getters,
  modules,

});

export default store;
