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
import NProgress from 'vue-nprogress';

const { storage, http, progress, bus, ProgressStack } = services;

/**
 * Здесь настраиваем все части приложения и соединяем их между собой
 */


/** Роутер */
sync(store, router);

/** Глобальная обработка необработанных ошибок */
window.addEventListener('error', uncaughtExceptionHandler(({ error }) => globalErrorsHandler(error)));
window.addEventListener('unhandledrejection', unhandledRejectionHandler(({ error }) => globalErrorsHandler(error)));
Vue.config.errorHandler = globalErrorsHandler;

async function globalErrorsHandler (err) {
  const isHttpError = (err instanceof HttpError);
  const isConnectionError = isHttpError && err.CONNECTION_ERROR;

  if (err instanceof HttpError) {
    if (err.isCanceled) { return; }

  }

  // console.error('[app]', err);
  bus.emit('uncaughtException', err);

  if (!isDevelopment && !isConnectionError) {
    await reportError({ err });
  }
}

/** Проверяем работоспособность LocalStorage'а */
assert(storage.enabled, 'Пожалуйста, выйдите из приватного режима Safari. Стабильность работы приложения не гарантируется');

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
  $ls: {
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

// Vue.use(NProgress);
// const nprogress = new NProgress();

// Vue.mixin({
//   beforeCreate () {
//     this._qweqwe = function fnName () {};
//     console.log('beforeCreate', this, this === this.$root);
//   }
// });

/** Инcтанс */
const app = new Vue({
  // nprogress,
  router,
  store,
  ...App
});

/** todo: удалить */
function sdfsdf () {
  throw new Error('Test Error');
}

function zxczxc () {
  sdfsdf();
}

function asdasd () {
  zxczxc();
}

setTimeout(function qsweqweqwe () {
  asdasd();
}, 100);

/** выплёвываем наружу (монтирование приложения снаружи, надо оно или не надо - всё там) */
export { app, router, store, api, services };
