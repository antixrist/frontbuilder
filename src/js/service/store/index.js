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
    layout: {
      activeTab: 'tree',
      sidebarOpened: false,
      modals: {
        createTask:    false,
        editTask:      false,
        createProject: false,
        editProject:   false,
        createPolygon: false,
        editPolygon:   false,
      },
    },
  },

  mutations: {
    UPDATE_LAYOUT (state, data) {
      state.layout = _.merge(state.layout, data);
    }
  },

  actions: {
  },

  getters,
  modules,

});

export default store;
