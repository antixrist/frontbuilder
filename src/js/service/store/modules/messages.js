import _ from 'lodash';

const messageDefaults = {
  title: '',
  content: '',
  type: 'default',
  closed: false,
  timeout: 0,
  timerId: 0
};

const state = {
  messages: []
};

const getters = {
  asc (state) {
    return _.orderBy(state.message, ['datetime'], ['asc']);
  },

  desc (state) {
    return _.orderBy(state.message, ['datetime'], ['desc']);
  }
};

const actions = {
  // dispatch('messages/show')
  show ({ commit, dispatch }, msg) {
    const message = Object.assign({}, typeof msg == 'string' ? { content: msg } : msg, messageDefaults, {
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
    state.message.push(message);
  },

  // commit('messages/remove')
  remove (state, message) {
    state.messages = _.without(state.messages, message);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
