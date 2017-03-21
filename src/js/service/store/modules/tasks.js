import _ from 'lodash';
import api from '../../api';

export const emptyTask = {
  id: 0,
  name: ''
};

const defaults = {
  form: {
    create: _.cloneDeep(emptyTask),
    edit: _.cloneDeep(emptyTask),
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

const actions = {

  async create ({ dispatch }, query = {}) {
    let res = await api.post('/task/create', query);

    if (res.success) {
      dispatch('tree/addItem', res.data, { root: true });
    }

    return res;
  },

  async remove ({ dispatch }, item = {}) {
    dispatch('tree/updateItem', { id: item.id, submitting: 'remove' }, { root: true });

    let res;
    try {
      res = await api.post('/task/delete', item);
    } catch (err) {
      dispatch('tree/updateItem', {
        id: item.id,
        submitting: false
      }, { root: true });

      throw err;
    }

    if (res.success) {
      dispatch('tree/removeItem', { ...item, submitting: false }, { root: true });
    } else {
      dispatch('tree/updateItem', { ...item, submitting: false }, { root: true });
    }

    return res;
  },

  async update ({ dispatch }, item = {}) {
    dispatch('tree/updateItem', { id: item.id, submitting: 'update' }, { root: true });

    let res;
    try {
      res = await api.post('/task/edit', item);
    } catch (err) {
      dispatch('tree/updateItem', {
        id: item.id,
        submitting: false
      }, { root: true });

      throw err;
    }

    const newItem = res.success ? res.data : item;
    dispatch('tree/updateItem', { ...newItem, submitting: false }, { root: true });

    return res;
  },

  async move ({ dispatch }, item = {}) {
    dispatch('tree/updateItem', { id: item.id, submitting: 'move' }, { root: true });

    let res;
    try {
      res = await api.post('/task/move', item);
    } catch (err) {
      dispatch('tree/updateItem', {
        id: item.id,
        submitting: false
      }, { root: true });

      throw err;
    }

    const newItem = res.success ? res.data : item;
    dispatch('tree/moveItem', { ...newItem, submitting: false }, { root: true });

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
