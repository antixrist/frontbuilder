import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import createLogger from 'vuex/dist/logger';
import { isDevelopment } from '../../config';

import state from './state';
import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import modules from './modules';

const store = new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  modules,
  
  strict: isDevelopment,
  plugins: [
    ...(isDevelopment ? [createLogger()] : []),
    createPersistedState()
  ]
});

export default store;
