import _ from 'lodash';
import { token } from '../../../services';
import { API_TOKEN_NAME } from '../../../config';
import api from '../../../api';

const defaults = {
  [API_TOKEN_NAME]: null,
  username: null,
  roles: [],
  settings: {},
  acl: {}
};

const state = Object.assign({}, defaults);

const getters = {
  // getters['account/isLogged']
  isLogged (state) {
    return !!(state.username && state[API_TOKEN_NAME]);
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
    commit('logout');
    
    return await api.post('/logout', { [API_TOKEN_NAME]: state[API_TOKEN_NAME] });
  }
};

const mutations = {
  // commit('account/login')
  login (state, data) {
    token.save(data[API_TOKEN_NAME]);

    _.forEach(defaults, (val, key) => {
      if (_.isUndefined(data[key])) { return; }

      state[key] = data[key];
    });
  },

  // commit('account/logout')
  logout (state) {
    token.remove();

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
