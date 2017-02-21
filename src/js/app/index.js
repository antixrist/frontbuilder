import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './App.vue'
import router from './router'
import store from './store'
import api from './api';
import * as services from './services';

/**
 * Здесь настраиваем все части приложения и соединяем их между собой
 */

if (!services.ls.enabled) {
  throw new Error('LocalStorage не доступен. Пожалуйста, выйдите из приватного режима Safari');
}

/** Общие для всего приложения UI-компоненты */
/** todo: перенести куда-то */
Vue.component('check-box', require('./ui/check-box/index.vue'));
Vue.component('modal', require('./ui/modal/index.vue'));

/** Роутер */
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // этот путь требует авторизации, проверяем залогинен ли
    // пользователь, и если нет, перенаправляем на страницу логина
    // if (!auth.loggedIn()) {
    if (false) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  }

  return next();
});

sync(store, router);

/** Api */
Vue.prototype.$api = api;


/** Инcтанс */
const app = new Vue({
  api,
  router,
  store,
  ...App
});


/** выплёвываем наружу (монтирование приложение снаружи, надо оно или не надо - всё там) */
export { app, router, store, api, services};
