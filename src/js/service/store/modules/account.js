import _ from 'lodash';
import Vue from 'vue';
import { API_TOKEN_NAME } from '../../../config';
import { storage } from '../../';
import api from '../../api';
import { resetState } from '../utils';

const defaults = {
  user: null,
  loginForm: {
    login: '',
    password: '',
  },
};

const state = _.cloneDeep(defaults);

const mutations = {

  RESET_LOGIN_FORM (state) {
    state.loginForm = _.cloneDeep(defaults.loginForm);
  },

  SET_LOGIN_FORM_DATA (state, data = {}) {
    state.loginForm = _.merge({}, state.loginForm, data);

    delete state.loginForm.password;
  },

  SET_USER (state, data = {}) {
    state.user = data;
  },

  UPDATE_USER (state, data = {}) {
    state.user = _.merge(state.user, data);
  },

  LOGOUT (state) {
    resetState(state, defaults);
  }
};

const actions = {
  async login ({ commit, dispatch }, data = {}) {
    let res;
    try {
      res = await api.post('/login', data);
    } catch (err) {
      // todo: поменять неправильный код в json-ответе. а то хардкод
      if (err.code == 401) {
        res = err.response.body;
      } else {
        throw err;
      }
    }

    if (res.success) {
      const token = res.data[API_TOKEN_NAME];
      delete res.data[API_TOKEN_NAME];

      storage.set(API_TOKEN_NAME, token);

      res = await dispatch('fetch');
      if (res.success) {
        commit('SET_USER', res.data);
      }
    }

    return res;
  },

  async logout ({ commit, state }) {
    commit('LOGOUT');

    try {
      await api.post('/logout');
      storage.remove(API_TOKEN_NAME, state[API_TOKEN_NAME]);
    } catch (err) {
      storage.remove(API_TOKEN_NAME, state[API_TOKEN_NAME]);
      // если пользователь и так не был авторизован, то ничего страшного
      if (err.code != 401) {
        throw err;
      }
    }
  },

  async fetch ({ commit }) {
    let res = await api.post('/user/get');

    if (res.success) {
      commit('UPDATE_USER', res.data);
    }

    return res;
  }
};

const getters = {
  isLogged (state) {
    return (state.user && state.user.id);
  },
};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
