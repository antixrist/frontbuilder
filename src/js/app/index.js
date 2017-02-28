import _ from 'lodash';
import StackTrace from 'stacktrace-js';
import StackFrame from 'stackframe';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import api, { reportError } from '../api';
import { sync } from 'vuex-router-sync';
import { assert, errors } from '../utils';
import * as services from '../services';
const { ls, http, progress, bus, ProgressStack } = services;

console.log('errors.asd', errors.asd);

/**
 * Здесь настраиваем все части приложения и соединяем их между собой
 */

/** Роутер */
sync(store, router);

/** Глобальная обработка необработанных ошибок */
window.onerror = async function (msg, file, line, col, err) {
  let error = err;
  let stackframes = [];

  try {
    // err в разных браузерах может и не быть
    if (error) {
      stackframes = await StackTrace.fromError(error);
    } else {
      error = new Error(msg);
      stackframes.push(new StackFrame({
        fileName: file,
        lineNumber: line,
        columnNumber: col,
      }));
    }
  } catch (err) {
    error = err;
  }

  stackframes = stackframes.length ? stackframes : await StackTrace.get();
  error.stack = stackframes.map(sf => sf.toString()).join('\n');

  console.group(error.message);
  console.log(error.stack);
  console.groupEnd();

  bus.emit('uncaughtException', error);
  await reportError({
    message: error.message || '',
    stack: error.stack || ''
  });

  return true;
};

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

  return config;
}, err => {
  apiRequestsProgress.done(err.config);

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
