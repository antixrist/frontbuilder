import d from 'd';
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

/**
 * @param {{}} item
 * @returns {{}}
 */
function cleanupItem (item) {
  const { type } = item;
  Object.assign(item, {
    isTask:    type == 'task',
    isFolder:  type == 'directory',
    isPolygon: type == 'polygon'
  });

  return item;
}

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

const mutations = {
  ADD_ITEM (state, item = {}) {
    cleanupItem(item);
    state.list.push(item);
  },

  REMOVE_ITEM (state, item) {
    const idx = _.findIndex(state.list, { id: item.id });
    idx >= 0 && state.list.splice(idx, 1);
  },

  UPDATE_ITEM (state, updates = {}) {
    const { id } = updates;
    const idx = _.findIndex(state.list, { id });

    if (idx >= 0) {
      const item = _.assign(state.list[idx], updates);
      cleanupItem(item);

      Vue.set(state.list, idx, item);
    }
  },

  BATCH_UPDATE (state, updates = []) {
    const updatesById = _.keyBy(updates, 'id');

    state.list.forEach((item, idx) => {
      if (!updatesById[item.id]) { return item; }

      _.assign(item, updatesById[item.id]);
      cleanupItem(item);

      Vue.set(state.list, idx, item);
    });
  },

  SET_ACTIVE_ITEM (state, item) {
    state.activeItemId = _.isNumber(item) ? item : item.id;
  },

  RESET_ACTIVE_ITEM (state) {
    state.activeItemId = null;
  },

  RESET_LIST (state, list = []) {
    list.forEach(item => cleanupItem(item));
    state.list = list;
  },

};

const actions = {
  addItem ({ commit, dispatch }, item) {
    commit('ADD_ITEM', item);

    if (item.isActive) {
      dispatch('activateItem', item);
    }
  },

  removeItem ({ state, commit }, item = {}) {
    state.activeItemId == item.id && commit('RESET_ACTIVE_ITEM');
    commit('REMOVE_ITEM', item);
  },

  updateItem ({ commit, dispatch }, item = {}) {
    commit('UPDATE_ITEM', item);

    if (item.isActive) {
      dispatch('activateItem', item);
    }
  },

  moveItem ({ commit, dispatch }, item = {}) {

  },

  activateItem ({ state, commit, dispatch }, item) {
    const { id } = item;

    if (state.activeItemId != id) {
      commit('SET_ACTIVE_ITEM', id);
    }

    dispatch('expandBranchToItem', id);
  },

  resetList ({ commit, getters, dispatch }, list = []) {
    let activeItem;

    const mergedList = list.map(item => {
      if (getters.byId[item.id]) {
        _.defaults(item, getters.byId[item.id]);
      }

      return item;
    });

    // найдём активный элемент
    mergedList.forEach(item => {
      if (!item.isActive) { return; }

      if (activeItem) {
        item.isActive = false;
      } else {
        activeItem = item;
      }
    });

    commit('RESET_LIST', mergedList);
    activeItem && dispatch('activateItem', activeItem);
  },

  async fetch ({ dispatch, commit }, query = {}) {
    let res = await api.post('/project/tree', query);

    if (res.success) {
      dispatch('resetList', res.data);
    }

    return res;
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

};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
