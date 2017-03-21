import _ from 'lodash';
import api from '../../api';

export const emptyProject = {
  id: 0,
  name: ''
};

const defaults = {
  form: {
    create: _.cloneDeep(emptyProject),
    edit: _.cloneDeep(emptyProject),
  },

  // createFormOpened: false,
  // createForm: {
  //   project: _.cloneDeep(emptyProject)
  // },
  //
  // editFormOpened: false,
  // editForm: {
  //   project: _.cloneDeep(emptyProject)
  // },

  newProject:    _.cloneDeep(emptyProject),
  editedProject: _.cloneDeep(emptyProject),
};

const state = _.cloneDeep(defaults);

const getters = {

};

const mutations = {

  RESET_CREATE_FORM (state, name) {
    state.form.create = _.cloneDeep(defaults.form.create);
  },

  RESET_EDIT_FORM (state, name) {
    state.form.edit = _.cloneDeep(defaults.form.edit);
  },

  SET_CREATE_FORM_DATA (state, data = {}) {
    state.form.create = _.merge(state.form.create, data);
  },

  SET_EDIT_FORM_DATA (state, data = {}) {
    state.form.edit = _.merge(state.form.edit, data);
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
