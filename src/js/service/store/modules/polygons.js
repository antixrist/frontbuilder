import _ from 'lodash';
import api from '../../api';

export const emptyPolygon = {
  name: ''
};

const defaults = {
  newPolygon:    _.cloneDeep(emptyPolygon),
  editedPolygon: _.cloneDeep(emptyPolygon),
};

const state = _.cloneDeep(defaults);

const getters = {

};

const mutations = {

  SET_CREATED (state, polygon) {
    state.newPolygon = _.cloneDeep(polygon);
  },

  RESET_CREATED (state) {
    state.newPolygon = _.cloneDeep(emptyPolygon);
  },

  SET_UPDATED (state, polygon) {
    state.editedPolygon = _.cloneDeep(polygon);
  },

  RESET_UPDATED (state) {
    state.editedPolygon = _.cloneDeep(emptyPolygon);
  },

};

const actions = {
  async create ({ commit, dispatch }, query = {}) {
    let res = await api.post('/polygon/create', query);

    if (res.success) {
      dispatch('tree/addItem', res.data, { root: true });
    }

    return res;
  },

  async remove ({ commit, dispatch }, item = {}) {
    let res = await api.post('/polygon/delete', item);

    if (res.success) {
      dispatch('tree/removeItem', item, { root: true });
    }

    return res;
  },

  async update ({ commit, dispatch }, query = {}) {
    let res = await api.post('/polygon/edit', query);

    if (res.success) {
      dispatch('tree/updateItem', res.data, { root: true });
    }

    return res;
  },

  async move ({ commit, dispatch }, item = {}) {
    let res = await api.post('/polygon/move', item);

    if (res.success) {
      dispatch('tree/moveItem', res.data, { root: true });
    }

    return res;
  },

  async fetch ({ commit }, query = {}) {
    return await api.post('/polygon/get', query);
  },

};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
