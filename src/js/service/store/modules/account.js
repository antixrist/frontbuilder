import _ from 'lodash';
import Vue from 'vue';
import { API_TOKEN_NAME } from '../../../config';
import api from '../../api';

const defaults = {
  [API_TOKEN_NAME]: null,
  username: null,
  roles: [],
  settings: {},
  acl: {},
  meta: {
    status: 'init', // error || success || progress
    message: '',
    errors: {}
  },
};

const state = _.assign({}, defaults);

const mutations = {
  // commit('account/loginInProgress')
  loginInProgress (state, data) {
    state.meta.status = 'progress';
    state.meta.message = '';
    state.meta.errors = null;
    // _.assign(state.meta, { status: 'progress', message: '', errors: null });
  },

  // commit('account/loginSuccess')
  loginSuccess (state, data) {
    state.meta.status = 'success';
    state.meta.message = '';
    state.meta.errors = null;

    // _.assign(state.meta, { status: 'success', message: '', errors: null });
    // state.username = data.username;
    // state[API_TOKEN_NAME] = data[API_TOKEN_NAME];
    Object.keys(data).forEach(key => state[key] = data[key]);
  },

  // commit('account/loginFailure')
  loginFailure (state, { message, errors }) {
    state.meta.status = 'error';
    state.meta.message = message;
    state.meta.errors = errors;
    // _.assign(state.meta, { status: 'error', message, errors });
  },

  // commit('account/logout')
  logout (state) {
    // очистим локальный state
    Object.keys(state).forEach(key => delete state[key]);
    // забъём его данными по умолчанию
    Object.keys(defaults).forEach(key => state[key] = defaults[key]);
  }
};

const actions = {
  // dispatch('account/login')
  async login ({ commit, dispatch }, { username, password }) {
    commit('loginInProgress');

    try {
      const res = await api.post('/login', { login: username/*, password*/ });

      commit('loginSuccess', { username, ...res.body.data });
    } catch (err) {
      if (err.code == 422) {
        const { response } = err;
        const { message, data: errors = {} } = response.body;

        if (errors.login) {
          errors.username = errors.login;
          delete errors.login;
        }

        commit('loginFailure', { message, errors });
      } else {
        // throw err;
      }
    }
  },

  // dispatch('account/logout')
  async logout ({ commit, state }) {
    commit('logout');

    try {
      return await api.post('/logout', { [API_TOKEN_NAME]: state[API_TOKEN_NAME] });
    } catch (err) {
      throw err;
    }
  }
};

const getters = {
  // getters['account/token']
  token (state) {
    return state[API_TOKEN_NAME];
  },

  // getters['account/isLogged']
  isLogged (state) {
    return !!(state.username && state[API_TOKEN_NAME]);
  },

  // getters['account/isAdmin']
  isAdmin (state) {
    return state.roles.includes('admin');
  }
};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
