import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { isDevelopment } from '../config';
import api, { reportError } from '../api';
import { sync } from 'vuex-router-sync';
import { assert, uncaughtExceptionHandler, unhandledRejectionHandler } from '../utils';
import * as services from '../services';
const { ls, http, progress, bus, ProgressStack } = services;

/**
 * Здесь настраиваем все части приложения и соединяем их между собой
 */

/** Роутер */
sync(store, router);


/** Глобальная обработка необработанных ошибок */
window.onerror = uncaughtExceptionHandler(async err => {
  bus.emit('uncaughtException', { err });

  if (isDevelopment) {
    console.group && console.group(`Error: ${err.message}`);
    console.log(err.stack);
    console.groupEnd && console.groupEnd();
  } else {
    await reportError({
      message: err.message || '',
      stack: err.stack || err.stackframes.map(sf => sf.toString()).join('\n') || '',
    });
  }
});

window.onunhandledrejection = unhandledRejectionHandler(async event => {
  bus.emit('unhandledRejection', event);

  const { reason: err } = event;

  if (isDevelopment) {
    console.group && console.group(`Error: ${err.message}`);
    console.log(err.stack);
    console.groupEnd && console.groupEnd();
  } else {
    await reportError({
      message: err.message || '',
      stack: err.stack || err.stackframes.map(sf => sf.toString()).join('\n') || '',
    });
  }
});

/** Проверяем работоспособность LocalStorage'а */
assert(ls.enabled, 'Пожалуйста, выйдите из приватного режима Safari. Стабильность работы приложения не гарантируется');

/** Прогресс для запросов к api */
const apiRequestsProgress = new ProgressStack();
apiRequestsProgress.setProgress(progress);

api.interceptors.request.use((config) => {
  /**
   * если передать { silent: true } в параметрах запроса,
   * то прогресс для этого запроса показан не будет
   */
  !config.silent && apiRequestsProgress.add(config);

  throw new Error('Errrooooorrr!!!');

  return config;
}, err => {
  apiRequestsProgress.done(err.config);

  console.error('err', err);

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
    get () { return ls; }
  },
  $progress: {
    get () { return progress; }
  }
});


/** Инcтанс */
const app = new Vue({
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
