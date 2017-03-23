import _ from 'lodash';
import api from '../../api';

export const emptyPolygon = {
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

const actions = {

  setCreateFormData ({ commit, rootGetters }, data = {}) {
    // сюда можно загнать исходный объект
    // if (data.content_json) {
    //   // но для формы из него надо вытащить только то, что принимает серверное api
    //   let newData = _.pick(data, ['id', 'name', 'parent_id', 'description']);
    //
    //   newData.period = _.get(data, 'content_json.period');
    //   newData.status = _.get(data, 'content_json.status');
    //   newData.msisdn = _.get(data, 'content_json.phone.msisdn');
    //   newData.dateEnd   = _.get(data, 'content_json.date.end');
    //   newData.dateStart = _.get(data, 'content_json.date.start');
    //
    //   data = newData;
    // }

    data = _.merge({}, emptyForm, data);

    data.parent_id = data.parent_id || rootGetters['tree/minParentId'];

    commit('SET_CREATE_FORM_DATA', data);
  },

  setEditFormData ({ commit, rootGetters }, data = {}) {
    // сюда можно загнать исходный объект
    // if (data.content_json) {
    //   // но для формы из него надо вытащить только то, что принимает серверное api
    //   let newData = _.pick(data, ['id', 'name', 'parent_id', 'description']);
    //
    //   newData.period = _.get(data, 'content_json.period');
    //   newData.status = _.get(data, 'content_json.status');
    //   newData.msisdn = _.get(data, 'content_json.phone.msisdn');
    //   newData.dateEnd   = _.get(data, 'content_json.date.end');
    //   newData.dateStart = _.get(data, 'content_json.date.start');
    //
    //   data = newData;
    // }

    data = _.merge({}, emptyForm, data);

    data.parent_id = data.parent_id || rootGetters['tree/minParentId'];

    commit('SET_EDIT_FORM_DATA', data);
  },

  async create ({ dispatch }, query = {}) {
    let res = await api.post('/polygon/create', query);

    if (res.success) {
      dispatch('tree/addItem', res.data, { root: true });
    }

    return res;
  },

  async remove ({ dispatch }, item = {}) {
    dispatch('tree/updateItem', { id: item.id, submitting: 'remove' }, { root: true });

    let res;
    try {
      res = await api.post('/polygon/delete', item);
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

    item = _.pick(item, ['id', 'name', 'description', 'sort', 'parent_id', 'content_json']);

    let res;
    try {
      res = await api.post('/polygon/edit', item);
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
      res = await api.post('/polygon/move', item);
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

  async execute ({ dispatch }, item = {}) {
    dispatch('tree/updateItem', { id: item.id, submitting: 'execute' }, { root: true });

    let res;
    try {
      res = await api.post('/polygon/execute', item);
    } catch (err) {
      dispatch('tree/updateItem', {
        id: item.id,
        submitting: false
      }, { root: true });

      throw err;
    }

    // todo: косячит серверный метод
    // const newItem = res.success ? res.data : item;
    const newItem = res.success ? item : item;
    dispatch('tree/updateItem', { ...newItem, submitting: false }, { root: true });

    return res;
  },

  async pause ({ dispatch }, item = {}) {
    dispatch('tree/updateItem', { id: item.id, submitting: 'pause' }, { root: true });

    let res;
    try {
      res = await api.post('/polygon/pause', item);
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
