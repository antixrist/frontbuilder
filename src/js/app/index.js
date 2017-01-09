import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './App.vue'
import router from './router'
import store from './store'
import { api } from './services';
sync(store, router);

Vue.prototype.$api = api;

const app = new Vue({
  router,
  store,
  ...App
});

export { app, router, store };
