import _ from 'lodash';

const messageDefaults = {
  title: '',
  content: '',
  type: 'default',
  closer: true,
  timeout: 0,
  timerId: 0,
  datetime: 0
};

const state = {
  list: []
};

const getters = {
  asc (state) {
    return _.orderBy(state.list, ['datetime'], ['asc']);
  },

  desc (state) {
    return _.orderBy(state.list, ['datetime'], ['desc']);
  }
};

function formatMessage (msg, props = {}) {
  msg = typeof msg == 'string' ? { content: msg } : msg;

  return Object.assign({}, messageDefaults, msg, props);
}

const actions = {
  // dispatch('messages/success')
  success ({ dispatch }, msg) {
    const message = formatMessage(msg, {
      type: 'success'
    });

    return dispatch('show', message);
  },

  // dispatch('messages/error')
  error ({ dispatch }, msg) {
    const message = formatMessage(msg, {
      type: 'error'
    });

    return dispatch('show', message);
  },

  // dispatch('messages/warning')
  warning ({ dispatch }, msg) {
    const message = formatMessage(msg, {
      type: 'warning'
    });

    return dispatch('show', message);
  },

  // dispatch('messages/show')
  show ({ commit, dispatch }, msg) {
    const message = formatMessage(msg, {
      datetime: new Date
    });

    if (message.timeout) {
      message.timerId = setTimeout((message) => dispatch('close', message), message.timeout, message);
    }

    commit('add', message);

    return message;
  },

  // dispatch('messages/close')
  close ({ commit, state }, message) {
    if (message.timerId) {
      clearTimeout(message.timerId);
    }

    commit('remove', message);

    return message;
  }
};

let idx = 0;
const mutations = {
  // commit('messages/add')
  add (state, message) {
    message.idx = idx++;
    state.list.push(message);
  },

  // commit('messages/remove')
  remove (state, message) {
    const idx = state.list.indexOf(message);
    idx >= 0 && state.list.splice(idx, 1);
  },

  reset_list (state) {
    state.list = [];
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
