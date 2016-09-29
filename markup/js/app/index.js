import Vue from 'vue';
import VueResource from 'vue-resource';
import store from './store';
import router from './router';

Vue.use(VueResource);

import {sync} from 'vuex-router-sync';
sync(store, router);

const app = new Vue({
  router,
  store,
});

export {app, router, store};