import _ from 'lodash';
import Vue from 'vue';
import api from '../../api';


const defaults = {
  list: [],
  activeItemId: null,
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
  },

  activeItem (state, getters) {
    return state.activeItemId ? getters.byId[state.activeItemId] : null;
  }
};

const mutations = {
  RESET_LIST (state, list = []) {
    state.list = list;
  },

  DELETE (state, project) {
    const exists = _.find(state.list, { id: project.id });
    exists && _.pull(state.list, exists);
  },

  SET_ACTIVE_ITEM (store, item) {
    store.activeItemId = _.isNumber(item) ? item : item.id;
  },

  RESET_ACTIVE_ITEM (store) {
    store.activeItemId = null;
  },

  UPDATE_ITEM (store, updates) {
    const { id } = updates;
    const idx = _.findIndex(state.list, { id });

    if (idx >= 0) {
      const item = store.list[idx];
      const updated = _.assign(item, updates);

      Vue.set(store.list, idx, updated);
    }
  },

  BATCH_UPDATE (store, updates = []) {
    const updatesById = _.keyBy(updates, 'id');

    store.list = store.list.map(item => {
      if (!updatesById[item.id]) { return item; }

      return { ...item, ...updatesById[item.id] };
    });
  }
};

/**
 * @param {{}} byId
 * @param {Number} itemId
 * @returns {Array}
 */
function getParentsIds (byId, itemId) {
  const parentsIds = [];

  let item = byId[itemId];
  if (item) {
    let parent = byId[item.parent_id];
    while (parent) {
      parentsIds.push(parent.id);
      item = parent;
      parent = byId[item.parent_id];
    }
  }

  return parentsIds;
}

const actions = {
  activateItem ({ state, commit, dispatch }, item) {
    const { id } = item;

    if (state.activeItemId != id) {
      commit('SET_ACTIVE_ITEM', id);
    }

    dispatch('expandBranchToItem', id);
  },

  expandBranchToItem ({ commit, getters, dispatch }, item) {
    const { id: itemId } = item;
    const parentsIds = getParentsIds(getters.byId, itemId);

    const updates = parentsIds
      .filter(id => getters.byId[id] && getters.byId[id].isFolder)
      .map(id => ({ id, isExpanded: true }))
    ;

    updates.length && commit('BATCH_UPDATE', updates);
  },

  async updateList ({ commit, getters, dispatch }, list = []) {
    let activeItem;

    const mergedList = list.map(item => {
      if (getters.byId[item.id]) {
        _.defaults(item, getters.byId[item.id], {
          isExpanded: false
        });
      }

      const { type } = item;
      Object.assign(item, {
        isTask:    type == 'task',
        isFolder:  type == 'directory',
        isPolygon: type == 'polygon',
      });

      return item;
    });

    mergedList.forEach(item => {
      if (!item.isActive) { return; }

      if (activeItem) {
        item.isActive = false;
      } else {
        activeItem = item;
      }
    });

    commit('RESET_LIST', mergedList);
    if (activeItem) {
      await dispatch('activateItem', activeItem);
    }
  },

  // dispatch('projects/move')
  async move ({ commit }, item = {}) {
    // на move раскрывать ветку, если перемещаемый является активным

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
    // на delete проверять не является ли удаляемый активным

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

};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
