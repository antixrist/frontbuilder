import { api, storage } from '../';

const actions = {};

export default actions;

(() => {
  const defaultMeta = {
    code: 0,
    loading: false,
    success: false,
    message: '',
    errors: {}
  };

  const defaults = {
    items: [],
    newItem: {},
    editedItem: {},

    meta: {
      create: _.cloneDeep(defaultMeta),
      update: _.cloneDeep(defaultMeta),
      delete: _.cloneDeep(defaultMeta)
    },
  };

  const state = _.cloneDeep(defaults);

  const getters = {
    byId (state) {
      return _.keyBy(state.items, 'id');
    },
  };

  const mutations = {
    // commit('projects/RESET_META')
    RESET_META (state, [type, data = {}]) {
      if (state.meta[type]) {
        state.meta[type] = _.merge({}, defaults.meta[type], data);
      }
    },

    SET_CREATED (state, item) {
      state.newItem = item;
    },

    SET_UPDATED (state, item) {
      state.editedItem = item;
    },

    RESET_LIST (state, items = []) {
      const oldListById = _.keyBy(state.items, 'id');

      state.items = items.map(item => {
        const exists = oldListById[item.id] || null;

        return _.merge(exists ? oldListById : {}, item);
      });
    },

    SAVE (state, item) {
      const idx = _.findIndex(state.items, { id: item.id });
      if (idx >= 0) {
        const exists = state.flatTree[idx];
        state.items.splice(idx, 1, _.merge(exists, item));
      } else {
        state.items.push(item);
      }
    },

    DELETE (state, item) {
      const exists = _.find(state.items, { id: item.id });
      exists && _.pull(state.items, exists);
    }

  };

  const actions = {
    async create ({ commit }, query = {}) {
      commit('RESET_META', ['create', { loading: true }]);

      try {
        const res = await api.post('/url', query);
        const { body = { success: true } } = res;
        const { data = {} } = body;
        delete body.data;

        commit('RESET_META', ['create', { ...body, loading: false }]);
        // здесь обработчик
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

    // dispatch('projects/delete')
    async delete ({ commit }, item = {}) {
      commit('RESET_META', ['delete', { loading: true }]);

      try {
        const res = await api.post('/item/delete', item);
        const { body = { success: true } } = res;
        delete body.data;

        commit('RESET_META', ['delete', { ...body, loading: false }]);
        item.id && commit('DELETE', item.id);
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

    // dispatch('projects/fetchAll')
    async fetchAll ({ commit }, query = {}) {
      const res = await api.post('/project/tree', query);
      const { data } = res.body;

      commit('RESET_LIST', data);

      return data;
    },

  };

  // export default {
  //   namespaced: true,
  //   state,
  //   // getters,
  //   actions,
  //   mutations
  // };
})();
