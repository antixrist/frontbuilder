import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import createLogger from 'vuex/dist/logger';
import { isDevelopment } from '../../config';
import modules from './modules';
import { ru } from 'flatpickr/src/l10n/ru';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: isDevelopment,
  plugins: [
    ...(isDevelopment ? [createLogger()] : []),
    createPersistedState()
  ],

  modules,

  state: {
    flatpickrDefaults: {
      enableTime: true,
      time_24hr: true,
      locale: ru
    },
    layout: {
      activeTab: 'tree',
      sidebarOpened: false,
      modals: {
        projectCreate: false,
        projectEdit: false,
        taskCreate: false,
        taskEdit: false,
        polygonCreate: false,
        polygonEdit: false,

        taskForm: false,
        polygonForm: false,
      },
    },
  },

  mutations: {
    ACTIVATE_TAB (state, tabName) {
      state.activeTab = tabName;
    },

    UPDATE_LAYOUT (state, data) {
      state.layout = _.merge(state.layout, data);
    }
  },

  actions: {
    activateTab ({ commit, state }, tabName) {
      if (state.layout.activeTab == tabName) { return; }

      commit('UPDATE_LAYOUT', { activeTab: tabName });
    },

    toggleSidebar ({ commit, state }, opened) {
      if (state.layout.sidebarOpened == opened) { return; }

      commit('UPDATE_LAYOUT', { sidebarOpened: opened });
    },

    toggleModal ({ commit }, modals) {
      commit('UPDATE_LAYOUT', { modals });
    },

  },

  getters: {

  },

});

export default store;
