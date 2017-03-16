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
    ids: [],
    byIds: {},
    newItem: {},
    editedItem: {},

    meta: {
      create: _.cloneDeep(defaultMeta),
      update: _.cloneDeep(defaultMeta),
      delete: _.cloneDeep(defaultMeta)
    },
  };

  const state = _.cloneDeep(defaults);

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
      const { ids, byIds } = items.reduce((reducer, item) => {
        reducer.ids.push(item.id);
        reducer.byIds[item.id] = item;

        return reducer;
      }, { ids: [], byIds: {} });

      state.ids = ids;
      state.byIds = byIds;
    },

    SAVE (state, item) {
      const exists = state.ids.indexOf(item.id) >= 0;
      !exists && state.ids.push(item.id);
      state.byIds = {...state.byIds, [item.id]: item};
    },

    DELETE (state, item) {
      _.pull(state.ids,  item.id);
      delete state.byIds[item.id];
    }

  };

  const actions = {
    async create ({ commit }, query = {}) {
      commit('RESET_META', ['create', { loading: true }]);

      try {
        const res = await api.post('/url', query);
        const { data } = res.body;

        commit('RESET_META', ['create', { loading: false }]);
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
