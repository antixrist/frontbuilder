import Vue from 'vue';
import VueResource from 'vue-resource';
import store from './store';
import router from './router';

const API_BASE = 'http://jsonplaceholder.typicode.com';

Vue.use(VueResource);

Vue.http.options = {
  root: API_BASE
};

Vue.http.interceptors.push((request, next) => {
  next((response) => {
    // Handle global API 404 =>
    if (response.status === 404) {
      router.push('/404');
    }
  });
});

import {sync} from 'vuex-router-sync';
sync(store, router);

const app = new Vue({
  router,
  store,
});

export {app, router, store};