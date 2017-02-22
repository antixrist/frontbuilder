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


/** Api */
Vue.prototype.$api = api;


/** Bus */
Vue.prototype.$bus = services.bus;


/** Инcтанс */
const app = new Vue({
  api,
  router,
  store,
  ...App
});


/** выплёвываем наружу (монтирование приложения снаружи, надо оно или не надо - всё там) */
export { app, router, store, api, services };
