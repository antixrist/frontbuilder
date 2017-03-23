import _ from 'lodash';
import Vue from 'vue';
import api from '../../api';
import { assignToReactive } from '../utils';

const defaults = {
  list: [],
  processings: {},
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
        accum[parentId] = _.orderBy(items, ['sort', 'id']);
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
    return _.values(getters.byParentId[getters.minParentId]);
  },

  rootProjects (state, getters) {
    return getters.rootItems.filter(item => item.isFolder);
  },

  tasks (state, getters) {
    return state.list.filter(item => item.isTask);
  },

  projects (state, getters) {
    return state.list.filter(item => item.isFolder);
  },

  polygons (state, getters) {
    return state.list.filter(item => item.isPolygon);
  },

  activeItem (state, getters) {
    return _.last(getters.activeItems);
  },

  tasksById (state, getters) {
    return _.keyBy(getters.tasks, 'id');
  },

  projectsById (state, getters) {
    return _.keyBy(getters.projects, 'id');
  },

  activeItems (state, getters) {
    return _.filter(state.list, { isActive: true });
  },

  hasSeveralActiveItems (state, getters) {
    return !!getters.activeItems.length;
  },

  projectsFlatTree (state, { rootProjects, byParentId }) {

    return (function getter (projects, level) {
      if (!projects) {
        level = 0;
        projects = rootProjects;
      }

      return _(projects)
        .filter(project => project.isFolder)
        .flatMap(project => {
          const name = `${ _.repeat('-', level) } ${ project.name }`.trim();

          return [
            { ...project, name, level: level + 1 },
            ...getter(byParentId[project.id] || [], level + 1)
          ];
        })
        .value()
      ;
    })();
  },

};

/**
 * @param item
 * @returns {{}}
 */
function cleanupItem (item) {
  const isTask = (item.type == 'task');
  const isFolder = (item.type == 'directory');
  const isPolygon = (item.type == 'polygon');
  const isActive = item.isActive || false;
  const isExpanded = item.isExpanded || false;

  _.forEach({ isTask, isFolder, isPolygon }, (val, key) => {
    if (item[key] === val) { return; }

    Vue.set(item, key, val);
  });

  _.forEach({ isActive, isExpanded }, (val, key) => {
    if (typeof item[key] != 'undefined') { return; }

    Vue.set(item, key, val);
  });

  if (typeof item.content_json != 'undefined' && _.isString(item.content_json)) {
    item.content_json_origin = item.content_json;
    try {
      item.content_json = JSON.parse(item.content_json);
    } catch (err) {
      item.content_json = {};
    }
  }

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

  ADD_ITEMS (state, items = []) {
    items = _.isArray(items) ? items : [items];

    state.list.push(...items.reduce((all, item) => {
      if (item.id) {
        cleanupItem(item);
        state.processings[item.id] = false;
        all.push(item);
      }

      return all;
    }, []));
  },

  REMOVE_ITEMS (state, items = []) {
    items = _.isArray(items) ? items : [items];

    items.forEach(item => {
      const idx = _.findIndex(state.list, { id: item.id });
      if (idx >= 0) {
        state.list.splice(idx, 1);
        delete state.processings[item.id];
      }
    });
  },

  UPDATE_ITEMS (state, updates = []) {
    updates = _.isArray(updates) ? updates : [updates];

    updates.forEach(update => {
      const { id } = update;
      const idx = _.findIndex(state.list, { id });

      if (idx >= 0) {
        const item = state.list[idx];

        assignToReactive(item, update);
        cleanupItem(item);

        state.list.splice(idx, 1, item);
      }
    });
  },

  RESET_LIST (state, list = []) {
    state.processings = {};

    state.list = list.map(item => {
      state.processings[item.id] = false;

      return cleanupItem(item);
    });
  },

  SET_PROCESSING (state, values = {}) {

    state.processings = { ...state.processings, ...values };

    // assignToReactive(state.processings, values);
    // Object.keys(values).forEach(id => {
    //   state.processings[id] = values[id];
    // });
  },

  ENSURE_ALONE_ACTIVE_ITEM (state, activeItem) {
    activeItem.isActive && state.list.forEach(item => {
      if (item.isActive && item.id !== activeItem.id) {
        item.isActive = false;
      }
    });
  },



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
      const item = { ...state.list[idx], ...updates };
      cleanupItem(item);

      Vue.set(state.list, idx, item);
    }
  },

  BATCH_UPDATE (state, updates = []) {
    const updatesById = _.keyBy(updates, 'id');

    state.list.forEach((item, idx) => {
      if (!updatesById[item.id]) { return item; }

      const updated = { ...item, ...updatesById[item.id] };

      cleanupItem(updated);

      Vue.set(state.list, idx, updated);
    });
  },

  SET_ACTIVE_ITEM (state, item) {
    state.activeItemId = _.isNumber(item) ? item : item.id;
  },

  RESET_ACTIVE_ITEM (state) {
    state.activeItemId = null;
  },

};

const actions = {
  addItems ({ commit, getters }, items = []) {
    items = _.isArray(items) ? items : [items];

    commit('ADD_ITEMS', items);

    const newActiveItem = _.findLast(items, { isActive: true });
    newActiveItem && commit('ENSURE_ALONE_ACTIVE_ITEM', newActiveItem);
  },

  removeItems ({ commit }, items = []) {
    commit('REMOVE_ITEMS', items);
  },

  updateItems ({ commit, dispatch, getters }, items = []) {
    items = _.isArray(items) ? items : [items];

    commit('UPDATE_ITEMS', items);

    const newActiveItem = _.findLast(items, { isActive: true });
    newActiveItem && commit('ENSURE_ALONE_ACTIVE_ITEM', newActiveItem);
  },

  resetList ({ commit, getters }, list = []) {
    list = list.map(item => _.defaults(item, getters.byId[item.id] || {}));

    commit('RESET_LIST', list);

    const newActiveItem = _.findLast(list, { isActive: true });
    newActiveItem && commit('ENSURE_ALONE_ACTIVE_ITEM', newActiveItem);
  },

  expandBranchToItems ({ commit, getters }, items = []) {
    items = _.isArray(items) ? items : [items];

    items.forEach(item => {
      const { id: itemId } = item;
      const parentsIds = getParentsIds(getters.byId, itemId);

      const updates = parentsIds
        .filter(id => getters.byId[id] && getters.byId[id].isFolder)
        .map(id => ({ id, isExpanded: true }))
      ;

      updates.length && commit('UPDATE_ITEMS', updates);
    });
  },

  async fetch ({ dispatch, commit }, query = {}) {
    return await api.post('/project/tree', query);
  },

};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
