import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { isDevelopment } from '../config';
import api, { reportError } from '../api';
import { sync } from 'vuex-router-sync';
import { assert, uncaughtExceptionHandler, unhandledRejectionHandler } from '../utils';
import * as services from '../services';
import { HttpError } from '../services/http';

const { storage, http, progress, bus } = services;

/**
 * Здесь настраиваем все части приложения и соединяем их между собой
 */


/** Роутер */
sync(store, router);

/** Прогресс для запросов к api */
const apiRequestsProgress = new ProgressStack();
apiRequestsProgress.setProgress(progress);

api.interceptors.request.use(config => {
  /**
   * если передать { silent: true } в параметрах запроса,
   * то прогресс для этого запроса показан не будет
   */
  !config.silent && apiRequestsProgress.add(config);

  // throw new Error('Errrooooorrr!!!');

  return config;
}, err => {
  apiRequestsProgress.done(err.config);

  // console.error('err', err);

  return Promise.reject(err);
});
api.interceptors.response.use(res => {
  apiRequestsProgress.done(res.config);

  return res;
}, err => {
  apiRequestsProgress.done(err.config);

  return Promise.reject(err);
});


/** Внедряем сервисы */
Object.defineProperties(Vue.prototype, {
  $api: {
    get () { return api; }
  },
  $http: {
    get () { return http; }
  },
  $bus: {
    get () { return bus; }
  },
  $storage: {
    get () { return storage; }
  },
  $progress: {
    get () { return progress; }
  }
});

/**
 * если вызвать этот метод внутри компонента `this.$reset()`,
 * то внутри компонента все данные будут установлены в init-данные,
 * при условии, что `data` была определена как функция (иначе сброса не будет)
 */
Vue.prototype.$reset = function () {
  const dataFn = typeof this.$options.data == 'function' ? this.$options.data : () => this.$options.data;
  const data = dataFn();

  Object.keys(data).forEach(key => this[key] = data[key]);
};

/** Инcтанс */
const app = new Vue({
  router,
  store,
  ...App
});

/** выплёвываем наружу (монтирование приложения снаружи, надо оно или не надо - всё там) */
export default app;
