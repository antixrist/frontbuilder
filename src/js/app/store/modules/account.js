import _ from 'lodash';
import { token } from '../../../services';
import { API_TOKEN_NAME } from '../../../config';
import api from '../../../api';

const defaults = {
  [API_TOKEN_NAME]: null,
  username: null,
  roles: [],
  settings: {},
  acl: {}
};

const state = Object.assign({}, defaults);

const getters = {
  // getters['account/isLogged']
  isLogged (state) {
    return !!(state.username && state[API_TOKEN_NAME]);
  },

  // getters['account/isAdmin']
  isAdmin (state) {
    return state.roles.includes('admin');
  }
};

// const Promise = require('bluebird');

const actions = {
  // dispatch('account/login')
  async login ({ commit, dispatch }, { login, password }) {
    // todo: обработка ошибок запросов и ответов
  
    // console.log('api.post', api.post);

    // проверить catch с await'ом
    const xhr = api.post('/login', { login, password })
            .catch(err => console.log(err))

      // .then(res => {
      //   console.log('login res', res);
      //   return res;
      // })
    ;

    console.log('xhr cancel', typeof xhr.cancel);

    // console.log('api.post xhr', xhr, Object.keys(xhr));
    
    // setTimeout(() => xhr.cancel(), 50);
  

    const { status, data: res } = await xhr;

    if (status == 200) {
      const { success, data } = res;
      if (success) {
        commit('login', { username: login, ...data });
      }
    }

    return res;
  },

  // dispatch('account/logout')
  async logout ({ commit, state }) {
    commit('logout');
    
    // console.log('api.post', api.post);
    
    const xhr = api.post('/logout', { [API_TOKEN_NAME]: state[API_TOKEN_NAME] })
      .then(res => {
        console.log('logout res', res);
        return res;
      })
    ;
  
    // console.log('api.post xhr', xhr, Object.keys(xhr));
    
    setTimeout(() => xhr.cancel(), 50);

    return await xhr;
  }
};

const mutations = {
  // commit('account/login')
  login (state, data) {
    token.save(data[API_TOKEN_NAME]);

    _.forEach(defaults, (val, key) => {
      if (_.isUndefined(data[key])) { return; }

      state[key] = data[key];
    });
  },

  // commit('account/logout')
  logout (state) {
    token.remove();

    _.forEach(defaults, (val, key) => state[key] = defaults[key]);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
