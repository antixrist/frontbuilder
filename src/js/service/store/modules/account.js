import _ from 'lodash';
import Vue from 'vue';
import { API_TOKEN_NAME } from '../../../config';
import { storage } from '../../';
import api from '../../api';
import { resetState } from '../utils';
import { errorToJSON } from '../../../utils';

const defaults = {
  username: null,
  meta: {
    login: {
      code: 0,
      loading: false,
      success: false,
      message: '',
      errors: {}
    },
    fetch: {
      code: 0,
      loading: false,
      success: false,
      message: '',
      errors: {}
    },
  },
};

const state = _.merge({}, defaults);

const mutations = {
  // commit('account/loginInProgress')
  resetLoginStatus (state) {
    state.meta.login = _.merge({}, defaults.meta.login);
  },

  setLoginStatus (state, data = {}) {
    state.meta.login = _.merge({}, defaults.meta.login, data);
  },

  resetFetchStatus (state) {
    state.meta.fetch = _.merge({}, defaults.meta.fetch);
  },

  setFetchStatus (state, data) {
    state.meta.fetch = _.merge({}, defaults.meta.fetch, data);
  },

  updateInfo (state, data) {
    Object.keys(data).forEach(key => Vue.set(state, key, data[key]));
  },

  // commit('account/logout')
  logout (state) {
    resetState(state, defaults);
  }
};

const actions = {
  // dispatch('account/login')
  async login ({ commit }, { username, password }) {
    commit('setLoginStatus', { loading: true });

    let res;
    try {
      res = await api.post('/login', { login: username, password });
    } catch (err) {

      // todo: поменять неправильный код в json-ответе. а то хардкод
      if (err.code == 401) {
        res = err.response.body;
      } else {
        commit('setLoginStatus', { success: false, loading: false });
        throw err;
      }
    }

    if (res.success) {
      const data = res.data;
      delete res.data;
    
      const token = data[API_TOKEN_NAME];
      delete data[API_TOKEN_NAME];
    
      commit('updateInfo', { username, ...data });
      storage.set('token', token);
    } else {
      const { errors } = res;
      if (errors.login) {
        errors.username = errors.login;
        delete errors.login;
      }
    }
  
    commit('setLoginStatus', { ...res, loading: false });
  },

  // dispatch('account/logout')
  async logout ({ commit, state }) {
    commit('resetLoginStatus');
    commit('logout');

    try {
      await api.post('/logout');
    } catch (err) {
      // если пользователь и так не был авторизован, то ничего страшного
      if (err.code != 401) { throw err; }
    }

    storage.remove('token', state[API_TOKEN_NAME]);
  },

  async fetch ({ commit, dispatch }) {
    commit('setFetchStatus', { loading: true });
  
    let res;
    try {
      res = await api.post('/user/get');
    } catch (err) {
      commit('setFetchStatus', { success: false, loading: false });
      throw err;
    }

    if (res.success) {
      const { data } = res;
      delete res.data;

      commit('updateInfo', data);
    }

    commit('setFetchStatus', { ...res, loading: false });
  }
};

const getters = {
  // getters['account/isLogged']
  isLogged (state) {
    return !!(state.username);
  },
};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
