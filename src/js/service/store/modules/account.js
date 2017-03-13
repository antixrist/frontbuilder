import _ from 'lodash';
import { API_TOKEN_NAME } from '../../../config';
import { errorToJSON } from '../../../utils';
import api from '../../api';

const defaults = {
  [API_TOKEN_NAME]: null,
  username: null,
  roles: [],
  settings: {},
  acl: {}
};

const state = Object.assign({}, defaults);

const getters = {
  // getters['account/token']
  token (state) {
    return state[API_TOKEN_NAME];
  },

  // getters['account/isLogged']
  isLogged (state) {
    return !!(state.username && state[API_TOKEN_NAME]);
  },

  // getters['account/isAdmin']
  isAdmin (state) {
    return state.roles.includes('admin');
  }
};

const actions = {
  // dispatch('account/login')
  async login ({ commit, dispatch }, { username, password }) {
    // todo: обработка ошибок запросов и ответов

    try {
      // commit('login', true);
      const res = await api.post('/login', { login: username, password });

      console.log('res', res);

      commit('login', { username, ...res.body.data });

      return res;

    } catch (err) {
      console.log('catch in action', errorToJSON(err));
      if (err.CLIENT_ERROR && err.code == 422) {
        const { response } = err;
        console.log(response.message, response.body);
      } else {
        throw err;
      }
    }


    // console.log('api.post xhr', xhr, Object.keys(xhr));
    
    // setTimeout(() => xhr.cancel('Cancel message'), 50);

    // const { status, data: res } = await xhr;
    //
    // if (status == 200) {
    //   const { success, data } = res;
    //   if (success) {
    //     commit('login', { username: login, ...data });
    //   }
    // }
  },

  // dispatch('account/logout')
  async logout ({ commit, state }) {
    commit('logout');
    
    // console.log('api.post', api.post);
    
    const xhr = api.post('/logout', { [API_TOKEN_NAME]: state[API_TOKEN_NAME] })
      // .then(res => {
      //   console.log('logout res', res);
      //   return res;
      // })
    ;
  
    // console.log('api.post xhr', xhr, Object.keys(xhr));
    
    // setTimeout(() => xhr.cancel(), 50);

    return await xhr;
  }
};

const mutations = {
  // commit('account/login')
  login (state, data) {
    // token.save(data[API_TOKEN_NAME]);

    _.forEach(defaults, (val, key) => {
      if (_.isUndefined(data[key])) { return; }

      state[key] = data[key];
    });
  },

  // commit('account/logout')
  logout (state) {
    // token.remove();

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
