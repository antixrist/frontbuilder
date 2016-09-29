import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import store from './store';
import routes from './routes';

Vue.use(VueRouter);
Vue.use(VueResource);

const router = new VueRouter({
  routes,
  mode: 'history',
  hashbang: false
});

import {sync} from 'vuex-router-sync';
sync(store, router);

export default new Vue({
  router,
  store,
});
