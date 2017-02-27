/**
 * Здесь настраиваем все части приложения и соединяем их между собой
 */

import { random } from 'lodash'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import api from './api';
import * as services from './services';
import { sync } from 'vuex-router-sync'

if (!services.ls.enabled) {
  throw new Error('LocalStorage не доступен. Пожалуйста, выйдите из приватного режима Safari');
}


/** Роутер */
sync(store, router);


Object.defineProperties(Vue.prototype, {
  $api: {
    get () { return api; }
  },
  $http: {
    get () { return services.http; }
  },
  $bus: {
    get () { return services.bus; }
  },
  $ls: {
    get () { return services.ls; }
  },
  $progress: {
    get () { return services.progress; }
  }
});

/** Инcтанс */
const app = new Vue({
  router,
  store,
  ...App
});


/** выплёвываем наружу (монтирование приложения снаружи, надо оно или не надо - всё там) */
export { app, router, store, api, services };
