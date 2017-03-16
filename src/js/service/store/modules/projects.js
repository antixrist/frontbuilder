import _ from 'lodash';
import Vue from 'vue';
import { API_TOKEN_NAME } from '../../../config';
import { storage } from '../../';
import api from '../../api';
import { resetState } from '../utils';


const defaultMeta = {
  code: 0,
  loading: false,
  success: false,
  message: '',
  errors: {}
};

const defaults = {
  ids: [],
  byIds: {},
  newProject: {},
  editedProject: {},

  meta: {
    create: _.cloneDeep(defaultMeta),
    update: _.cloneDeep(defaultMeta),
    delete: _.cloneDeep(defaultMeta),
    move: _.cloneDeep(defaultMeta),
  },
};

const state = _.cloneDeep(defaults);

const mutations = {
  // commit('projects/RESET_META')
  RESET_META (state, [type, data = {}]) {
    if (state.meta[type]) {
      state.meta[type] = _.merge({}, defaults.meta[type], data);
    }
  },

  SET_CREATED (state, project) {
    state.newProject = project;
  },

  SET_UPDATED (state, project) {
    state.editedProject = project;
  },

  RESET_LIST (state, projects = []) {
    const { ids, byIds } = projects.reduce((reducer, project) => {
      reducer.ids.push(project.id);
      reducer.byIds[project.id] = project;

      return reducer;
    }, { ids: [], byIds: {} });

    state.ids = ids;
    state.byIds = byIds;
  },

  SAVE (state, project) {
    const exists = state.ids.indexOf(project.id) >= 0;
    !exists && state.ids.push(project.id);
    state.byIds = {...state.byIds, [project.id]: project};
  },

  DELETE (state, project) {
    _.pull(state.ids,  project.id);
    delete state.byIds[project.id];
  }

};

const actions = {
  // dispatch('projects/create')
  async create ({ commit }, query = {}) {
    commit('RESET_META', ['create', { loading: true }]);

    try {
      const res = await api.post('/project/create', query);
      const { data } = res.body;

      commit('RESET_META', ['create', { loading: false }]);
      commit('SAVE', data);
    } catch (err) {
      let handled = false;
      const meta = { loading: false, success: false };

      if (err.code == 422) {
        const { response: body = {} } = err;
        handled = true;
        Object.assign(meta, body);
      }

      commit('RESET_META', ['create', meta]);
      if (!handled) { throw err; }
    }
  },

  // dispatch('projects/update')
  async update ({ commit }, query = {}) {
    commit('RESET_META', ['update', { loading: true }]);

    try {
      const res = await api.post('/project/edit', query);
      const { data } = res.body;

      commit('RESET_META', ['update', { loading: false }]);
      commit('SAVE', data);
    } catch (err) {
      let handled = false;
      const meta = { loading: false, success: false };

      if (err.code == 422) {
        const { response: body = {} } = err;
        handled = true;
        Object.assign(meta, body);
      }

      commit('RESET_META', ['update', meta]);
      if (!handled) { throw err; }
    }
  },

  // dispatch('projects/move')
  async move ({ commit }, query = {}) {
    commit('RESET_META', ['move', { loading: true }]);

    try {
      const res = await api.post('/project/move', query);
      const { data } = res.body;

      commit('RESET_META', ['move', { loading: false }]);
      commit('SAVE', data);
    } catch (err) {
      let handled = false;
      const meta = { loading: false, success: false };

      if (err.code == 422) {
        const { response: body = {} } = err;
        handled = true;
        Object.assign(meta, body);
      }

      commit('RESET_META', ['move', meta]);
      if (!handled) { throw err; }
    }
  },

  // dispatch('projects/delete')
  async delete ({ commit }, query = {}) {
    commit('RESET_META', ['delete', { loading: true }]);

    try {
      const res = await api.post('/project/delete', query);
      const { data } = res.body;

      commit('RESET_META', ['delete', { loading: false }]);
      commit('DELETE', data);
    } catch (err) {
      let handled = false;
      const meta = { loading: false, success: false };

      if (err.code == 422) {
        const { response: body = {} } = err;
        handled = true;
        Object.assign(meta, body);
      }

      commit('RESET_META', ['delete', meta]);
      if (!handled) { throw err; }
    }
  },

  // dispatch('projects/fetch')
  async fetch ({ commit }, query = {}) {
    const res = await api.post('/project/get', query);
    const { data } = res.body;

    return data;
  },

  // dispatch('projects/fetchTree')
  async fetchTree ({ commit }, query = {}) {
    const res = await api.post('/project/tree', query);
    const { data } = res.body;

    commit('RESET_LIST', data);

    return data;
  },

};


const getters = {};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
