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
    return _.orderBy(state.message, ['datetime'], ['asc']);
  },

  desc (state) {
    return _.orderBy(state.message, ['datetime'], ['desc']);
  }
};

function formatMessage (msg, props = {}) {
  return Object.assign(
    {},
    messageDefaults,
    typeof msg == 'string' ? { content: msg } : msg,
    props
  );
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
      type: 'danger'
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
      timeout: 0,
      datetime: new Date
    });

    if (message.timeout) {
      message.timerId = setTimeout(() => dispatch('close'), message.timeout)
    }

    return commit('add', message);
  },

  // dispatch('messages/close')
  close ({ commit, state }, message) {
    if (message.timerId) {
      clearTimeout(message.timerId);
    }

    return commit('remove', message);
  }
};

const mutations = {
  // commit('messages/add')
  add (state, message) {
    state.list.push(message);
  },

  // commit('messages/remove')
  remove (state, message) {
    state.list = _.without(state.list, message);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
