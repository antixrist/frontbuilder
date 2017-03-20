import _ from 'lodash';
import api from '../../api';

import { emptyProject } from './projects';

const initial = {
  'create-project': {
    project: _.cloneDeep(emptyProject),
  },
  'update-project': {
    project: _.cloneDeep(emptyProject),
  },
};

const state = _.cloneDeep(initial);

const getters = {

};

const mutations = {

  RESET_FORM (state, name) {
    state[name] = _.cloneDeep(initial[name]);
  },

  SET_FORM_DATA (state, { name, data = {} }) {
    state[name] = _.merge(state[name], data);
  },








  SET_CREATED (state, project) {
    state.newProject = _.cloneDeep(project);
  },

  RESET_CREATED (state) {
    state.newProject = _.cloneDeep(emptyProject);
  },

  SET_UPDATED (state, project) {
    state.editedProject = _.cloneDeep(project);
  },

  RESET_UPDATED (state) {
    state.editedProject = _.cloneDeep(emptyProject);
  },

};

const actions = {
  async create ({ commit, dispatch }, query = {}) {
    let res = await api.post('/project/create', query);

    if (res.success) {
      dispatch('tree/addItem', res.data, { root: true });
      commit('RESET_CREATED');
    }

    return res;
  },

  async remove ({ commit, dispatch }, item = {}) {
    let res = await api.post('/project/delete', item);

    if (res.success) {
      dispatch('tree/removeItem', item, { root: true });
    }

    return res;
  },

  async update ({ commit, dispatch }, query = {}) {
    let res = await api.post('/project/edit', query);

    if (res.success) {
      dispatch('tree/updateItem', res.data, { root: true });
      commit('RESET_UPDATED');
    }

    return res;
  },

  async move ({ commit, dispatch }, item = {}) {
    let res = await api.post('/project/move', item);

    if (res.success) {
      dispatch('tree/moveItem', res.data, { root: true });
    }

    return res;
  },

  async fetch ({ commit }, query = {}) {
    return await api.post('/project/get', query);
  },

};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
