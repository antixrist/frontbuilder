import _ from 'lodash';
import api from '../../../api';

const defaults = {
  username: null,
  api_token: null,
  roles: [],
  settings: {},
  acl: {}
};

const state = Object.assign({}, defaults);

const getters = {
  // getters['account/isLogged']
  isLogged (state) {
    return !!(state.username && state.api_token);
  },

  // getters['account/isAdmin']
  isAdmin (state) {
    return state.roles.includes('admin');
  }
};

// const Promise = require('bluebird');

const actions = {
  // dispatch('account/login')
  async login ({ commit, dispatch }, { login, password }) {
    // todo: обработка ошибок запросов и ответов

    const { status, data: res } = await api.post('/login', { login, password });

    if (status == 200) {
      const { success, data } = res;
      if (success) {
        commit('login', { username: login, ...data });
      }
    }

    return res;
  },

  // dispatch('account/logout')
  async logout ({ commit, state }) {
    await api.post('/logout', { api_token: state.api_token }).catch(err => console.log('catched err', err));

    commit('logout');
  }
};

const mutations = {
  // commit('account/login')
  login (state, data) {
    _.forEach(defaults, (val, key) => {
      if (_.isUndefined(data[key])) { return; }

      state[key] = data[key];
    });
  },

  // commit('account/logout')
  logout (state) {
    _.forEach(defaults, (val, key) => state[key] = defaults[key]);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
