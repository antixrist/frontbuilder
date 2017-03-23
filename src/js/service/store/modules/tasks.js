import _ from 'lodash';
import api from '../../api';

export const emptyTask = {
  id: 0,
  name: '',
  description: '',
  parent_id: 0,
  content_json: {
    date: {
      start: '',
      end: '',
    },
    period: 0,
    phone: {
      id: 0,
      contact_id: 0,
      msisdn: '',
    },
    status: 0,
  }
};

export const emptyForm = {
  id: 0,
  name: '',
  parent_id: 0,
  status: 1,
  period: 15,
  msisdn: '',
  dateEnd: null,
  dateStart: null,
  description: '',
};

const defaults = {
  form: {
    create: _.cloneDeep(emptyForm),
    edit: _.cloneDeep(emptyForm),
  },
};

const state = _.cloneDeep(defaults);

const getters = {};

const mutations = {

  SET_CREATE_FORM_DATA (state, data = {}) {
    state.form.create = data;
  },

  SET_EDIT_FORM_DATA (state, data = {}) {
    state.form.edit = data;
  },

};

export function getFormDataFromTask (task) {
  // сюда можно загнать исходный объект
  if (task.content_json) {
    // но для формы из него надо вытащить только то, что принимает серверное api
    let newData = _.pick(task, ['id', 'name', 'parent_id', 'description']);

    newData.period = _.get(task, 'content_json.period');
    newData.status = _.get(task, 'content_json.status');
    newData.msisdn = _.get(task, 'content_json.phone.msisdn');
    newData.dateEnd   = _.get(task, 'content_json.date.end');
    newData.dateStart = _.get(task, 'content_json.date.start');

    task = newData;
  }

  task = _.merge({}, emptyForm, task);

  return task;
}

const actions = {

  setCreateFormData ({ commit, rootGetters }, data = {}) {
    data = getFormDataFromTask(data);
    data.parent_id = data.parent_id || rootGetters['tree/minParentId'];

    commit('SET_CREATE_FORM_DATA', data);
  },

  setEditFormData ({ commit, rootGetters }, data = {}) {
    data = getFormDataFromTask(data);
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

    let res = await api.post('/task/create', item);

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
      res = await api.post('/task/edit', item);

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
      res = await api.post('/task/delete', item);

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

  async execute ({ dispatch, commit }, item = {}) {
    commit('tree/SET_PROCESSING', { [item.id]: 'execute' }, { root: true });

    let res;
    try {
      res = await api.post('/task/execute', item);

      commit('tree/SET_PROCESSING', { [item.id]: false }, { root: true });
    } catch (err) {
      commit('tree/SET_PROCESSING', { [item.id]: false }, { root: true });

      throw err;
    }

    if (res.success) {
      // todo: косячит серверный метод
      dispatch('tree/updateItems', res.data || item, { root: true });
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
