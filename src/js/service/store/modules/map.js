import _ from 'lodash';
import Vue from 'vue';
import api from '../../api';

export const emptyStation = {
  id: '',
  db_id: 0,
  x: 0,
  y: 0,
  lac: 0,
  cid: 0,
  mcc: 0,
  mnc: 0,
  tech: 0,
  indoor: 0,
  height: 0,
  address: '',
  is_remote: 0,
  is_opencell: 0,
  has_opencell: 0,
};

const defaults = {
  list: [],
  activeItemId: null
};

const state = _.cloneDeep(defaults);

const getters = {

};

export function getStationKey (st) {
  return [ 'lac', 'cid', 'mnc', 'mcc', 'tech', 'is_opencell' ]
    .map(prop => st[prop])
    .join('-')
  ;
}

export function cleanupStation (st) {
  if (!st.db_id) {
    st.db_id = st.id;
    st.id = getStationKey(st);
  }

  return st;
}

const mutations = {
  ADD_ITEM (state, st = {}) {
    cleanupStation(st);
    state.list.push(st);
  },

  REMOVE_ITEM (state, st) {
    const idx = _.findIndex(state.list, { id: st.id });
    idx >= 0 && state.list.splice(idx, 1);
  },

  UPDATE_ITEM (state, updates = {}) {
    const { id } = updates;
    const idx = _.findIndex(state.list, { id });

    if (idx >= 0) {
      const st = { ...state.list[idx], ...updates };
      cleanupStation(st);

      Vue.set(state.list, idx, st);
    }
  },

  BATCH_UPDATE (state, updates = []) {
    const updatesById = _.keyBy(updates, 'id');

    state.list.forEach((st, idx) => {
      if (!updatesById[st.id]) { return st; }

      const updated = { ...st, ...updatesById[st.id] };

      cleanupStation(updated);

      Vue.set(state.list, idx, updated);
    });
  },

  SET_ACTIVE_ITEM (state, st) {
    state.activeItemId = _.isNumber(st) ? st : st.id;
  },

  RESET_ACTIVE_ITEM (state) {
    state.activeItemId = null;
  },

  RESET_LIST (state, list = []) {
    list.forEach(st => cleanupStation(st));
    state.list = list;
  },

};

const actions = {

  async fetchAll ({ commit }, query = []) {
    query = _.isArray(query) ? query : [query];

    query.push({
      cid: 53705,
      lac: 5091,
      mcc: 250,
      mnc: 2,
      tech: "",
    });

    return await api.towers.post('/stations', query);
  },

};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
