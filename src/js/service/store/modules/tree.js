import _ from 'lodash';
import api from '../../api';


const defaults = {
  list: [],
};

const state = _.cloneDeep(defaults);

const getters = {
  byId (state) {
    return _.keyBy(state.list, 'id');
  },
  byParentId (state) {
    return _(state.list)
      .groupBy('parent_id')
      .transform((accum, items, parentId) => {
        accum[parentId] = _.orderBy(items, 'sort');
      }, {})
      .value()
    ;
  },
  minParentId (state) {
    // todo: хардкооод!
    return 1;
    return _.minBy(state.list, 'parent_id').parent_id;
  },
  rootItems (state, getters) {
    return getters.byParentId[getters.minParentId];
  }
};

const mutations = {
  // commit('projects/RESET_META')
  RESET_LIST (state, list = []) {
    state.list = list;
  },

  DELETE (state, project) {
    const exists = _.find(state.list, { id: project.id });
    exists && _.pull(state.list, exists);
  }

};

const actions = {

  updateList ({ commit, getters }, list = []) {
    const mergedList = list.map(item => {
      if (getters.byId[item.id]) {
        return _.defaults(item, getters.byId[item.id]);
      }

      return item;
    });

    commit('RESET_LIST', mergedList);
  },

  // dispatch('projects/move')
  async move ({ commit }, item = {}) {
    commit('RESET_META', ['move', { loading: true }]);

    try {
      const res = await api.post('/project/move', item);
      const { body = { success: true } } = res;
      const { data = {} } = body;
      delete body.data;

      commit('RESET_META', ['move', { ...body, loading: false }]);
      commit('SAVE', data);
    } catch (err) {
      let handled = false;
      let meta = { loading: false, success: false };

      if (err.code == 422) {
        const { response: { body = {} } = {} } = err;
        handled = true;
        meta = Object.assign({}, body, meta);
      }

      commit('RESET_META', ['move', meta]);
      if (!handled) { throw err; }
    }
  },

  // dispatch('projects/delete')
  async delete ({ commit }, item = {}) {
    commit('RESET_META', ['delete', { loading: true }]);

    try {
      const res = await api.post('/project/delete', item);
      const { body = { success: true } } = res;
      delete body.data;

      commit('RESET_META', ['delete', { ...body, loading: false }]);
      item.id && commit('DELETE', item);
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

  // dispatch('projects/fetchTree')
  async fetch ({ dispatch, commit }, query = {}) {
    let res;
    // try {
      res = await api.post('/project/tree', query);
    // } catch (err) {
    //   commit('RESET_LIST', []);
    //   throw err;
    // }

    dispatch('updateList', res.data);

    return res.data;
  },

  getOrderedItemsByParentId ({ state }, parentId) {
    const filtered = _.filter(state.list, { parent_id: parentId });
    const ordered = _.orderBy(filtered, 'sort');

    return ordered;
  }

};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
