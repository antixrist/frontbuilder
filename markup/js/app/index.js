import Vue from 'vue';
import store from './store';
import router from './router';

import {sync} from 'vuex-router-sync';
sync(store, router);

const app = new Vue({
  router,
  store,
});

export {app, router, store};
