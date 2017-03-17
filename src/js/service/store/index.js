import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import createLogger from 'vuex/dist/logger';
import { isDevelopment } from '../../config';

import getters from './getters';
import actions from './actions';
import modules from './modules';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: isDevelopment,
  plugins: [
    ...(isDevelopment ? [createLogger()] : []),
    createPersistedState()
  ],

  state: {
    activeObjectId: 0,
  },

  mutations: {
    SET_ACTIVE_OBJECT (store, item) {
      store.activeObjectId = _.isNumber(item) ? item : item.id;
    }
  },

  getters,
  actions,
  modules,

});

export default store;
