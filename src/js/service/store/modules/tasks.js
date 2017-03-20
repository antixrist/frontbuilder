import _ from 'lodash';
import api from '../../api';

export const emptyTask = {
  name: ''
};

const defaults = {
  newTask:    _.cloneDeep(emptyTask),
  editedTask: _.cloneDeep(emptyTask),
};

const state = _.cloneDeep(defaults);

const getters = {

};

const mutations = {

  SET_CREATED (state, task) {
    state.newTask = _.cloneDeep(task);
  },

  RESET_CREATED (state) {
    state.newTask = _.cloneDeep(emptyTask);
  },

  SET_UPDATED (state, task) {
    state.editedTask = _.cloneDeep(task);
  },

  RESET_UPDATED (state) {
    state.editedTask = _.cloneDeep(emptyTask);
  },

};

const actions = {
  async create ({ commit, dispatch }, query = {}) {
    let res = await api.post('/task/create', query);

    if (res.success) {
      dispatch('tree/addItem', res.data, { root: true });
    }

    return res;
  },

  async remove ({ commit, dispatch }, item = {}) {
    let res = await api.post('/task/delete', item);

    if (res.success) {
      dispatch('tree/removeItem', item, { root: true });
    }

    return res;
  },

  async update ({ commit, dispatch }, query = {}) {
    let res = await api.post('/task/edit', query);

    if (res.success) {
      dispatch('tree/updateItem', res.data, { root: true });
    }

    return res;
  },

  async move ({ commit, dispatch }, item = {}) {
    let res = await api.post('/task/move', item);

    if (res.success) {
      dispatch('tree/moveItem', res.data, { root: true });
    }

    return res;
  },

  async fetch ({ commit }, query = {}) {
    return await api.post('/task/get', query);
  },

};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
