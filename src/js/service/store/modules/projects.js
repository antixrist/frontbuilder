import _ from 'lodash';
import api from '../../api';

export const emptyProject = {
  id: 0,
  name: ''
};

export const emptyForm = {
  id: 0,
  name: '',
  parent_id: 0,
  description: '',
};

const defaults = {
  form: {
    create: _.cloneDeep(emptyForm),
    edit: _.cloneDeep(emptyForm),
  },
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

export function getFormDataFromProject (project) {
  // сюда можно загнать исходный объект
  if (project.content_json) {
    // но для формы из него надо вытащить только то, что принимает серверное api
  }

  project = _.merge({}, emptyForm, project);

  return project;
}


const actions = {

  setCreateFormData ({ commit, rootGetters }, data = {}) {
    data = getFormDataFromProject(data);
    data.parent_id = data.parent_id || rootGetters['tree/minParentId'];

    commit('SET_CREATE_FORM_DATA', data);
  },

  setEditFormData ({ commit, rootGetters }, data = {}) {
    data = getFormDataFromProject(data);
    data.parent_id = data.parent_id || rootGetters['tree/minParentId'];

    commit('SET_EDIT_FORM_DATA', data);
  },

  async save ({ dispatch }, item = {}) {
    let res;

    if (!item.id) {
      res = await dispatch('create', item);
    } else {
      res = await dispatch('update', item);
    }

    return res;
  },

  async create ({ dispatch }, item = {}) {
    item = _.pick(item, _.keys(emptyForm));

    let res = await api.post('/project/create', item);

    if (res.success) {
      dispatch('tree/addItems', res.data, { root: true });
    }

    return res;
  },

  async update ({ dispatch, commit }, item = {}) {
    item = _.pick(item, _.keys(emptyForm));

    commit('tree/SET_PROCESSING', { [item.id]: 'update' }, { root: true });

    let res;
    try {
      res = await api.post('/project/edit', item);

      commit('tree/SET_PROCESSING', { [item.id]: false }, { root: true });
    } catch (err) {
      commit('tree/SET_PROCESSING', { [item.id]: false }, { root: true });

      throw err;
    }

    if (res.success) {
      dispatch('tree/updateItems', res.data, { root: true });
    }

    return res;
  },

  async remove ({ dispatch, commit }, item = {}) {
    commit('tree/SET_PROCESSING', { [item.id]: 'remove' }, { root: true });

    let res;
    try {
      res = await api.post('/project/delete', item);

      commit('tree/SET_PROCESSING', { [item.id]: false }, { root: true });
    } catch (err) {
      commit('tree/SET_PROCESSING', { [item.id]: false }, { root: true });

      throw err;
    }

    if (res.success) {
      dispatch('tree/removeItems', item, { root: true });
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
