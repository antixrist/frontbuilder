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
  flatTree: [],
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

const getters = {
  byId (state) {
    return _.keyBy(state.flatTree, 'id');
  },
  minParentId (state) {
    // todo: хардкооод!
    return 1;
    return _.minBy(state.flatTree, 'parent_id').parent_id;
  },
  rootItems (state, getters) {
    return _.filter(state.flatTree, { parent_id: getters.minParentId });
  }
};

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

  RESET_LIST (state, list = []) {
    const oldListById = _.keyBy(state.flatTree, 'id');

    state.flatTree = list.map(item => {
      const exists = oldListById[item.id] || null;

      return _.merge(exists ? exists : {}, item);
    });
  },

  SAVE (state, project) {
    const idx = _.findIndex(state.flatTree, { id: project.id });
    if (idx >= 0) {
      const exists = state.flatTree[idx];
      state.flatTree.splice(idx, 1, _.merge(exists, project));
    } else {
      state.flatTree.push(project);
    }
  },

  DELETE (state, project) {
    const exists = _.find(state.flatTree, { id: project.id });
    exists && _.pull(state.flatTree, exists);
  }

};

const actions = {
  // dispatch('projects/create')
  async create ({ commit }, query = {}) {
    commit('RESET_META', ['create', { loading: true }]);

    try {
      const res = await api.post('/project/create', query);
      const { body = { success: true } } = res;
      const { data = {} } = body;
      delete body.data;

      commit('RESET_META', ['create', { ...body, loading: false }]);
      commit('SAVE', data);
    } catch (err) {
      let handled = false;
      let meta = { loading: false, success: false };

      if (err.code == 422) {
        const { response: { body = {} } = {} } = err;
        handled = true;
        meta = Object.assign({}, body, meta);
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
      const { body = { success: true } } = res;
      const { data = {} } = body;
      delete body.data;

      commit('RESET_META', ['update', { ...body, loading: false }]);
      commit('SAVE', data);
    } catch (err) {
      let handled = false;
      let meta = { loading: false, success: false };

      if (err.code == 422) {
        const { response: { body = {} } = {} } = err;
        handled = true;
        meta = Object.assign({}, body, meta);
      }

      commit('RESET_META', ['update', meta]);
      if (!handled) { throw err; }
    }
  },

  // dispatch('projects/move')
  async move ({ commit }, item = {}) {
    commit('RESET_META', ['move', { loading: true }]);

    try {
      const res = await api.post('/project/move', item);
      const { body = { success: true } } = res;
      const { data = {} } = body;
      delete body.data;

      commit('RESET_META', ['move', { ...body, loading: false }]);
      commit('SAVE', data);
    } catch (err) {
      let handled = false;
      let meta = { loading: false, success: false };

      if (err.code == 422) {
        const { response: { body = {} } = {} } = err;
        handled = true;
        meta = Object.assign({}, body, meta);
      }

      commit('RESET_META', ['move', meta]);
      if (!handled) { throw err; }
    }
  },

  // dispatch('projects/delete')
  async delete ({ commit }, item = {}) {
    commit('RESET_META', ['delete', { loading: true }]);

    try {
      const res = await api.post('/project/delete', item);
      const { body = { success: true } } = res;
      delete body.data;

      commit('RESET_META', ['delete', { ...body, loading: false }]);
      item.id && commit('DELETE', item);
    } catch (err) {
      let handled = false;
      let meta = { loading: false, success: false };

      if (err.code == 422) {
        const { response: { body = {} } = {} } = err;
        handled = true;
        meta = Object.assign({}, body, meta);
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

  getOrderedItemsByParentId ({ state }, parentId) {
    const filtered = _.filter(state.flatTree, { parent_id: parentId });
    const ordered = _.orderBy(filtered, 'sort');

    return ordered;
  }

};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
