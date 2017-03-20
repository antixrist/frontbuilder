/**
 * В точке входа лучше определить все тяжёлые зависимости (даже если они здесь не используются),
 * чтобы при webpack'овском code-splitting'е они не попадали в каждый чанк по отдельности
 */

/** Но `babel-polyfill` надо ставить первым в каждой точке входа */
import 'babel-polyfill';
import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';
import FastClick from 'fastclick';
import { assert, getErrorFromUncaughtException, getErrorFromUnhandledRejection } from './utils';
import { app, store, router } from './app';

/**
 * Ловим все возможные необработанные ошибки
 * и отправляем каждую в свой обработчик
 */
window.addEventListener('error', getErrorFromUncaughtException(err => globalErrorsHandler(err)));
window.addEventListener('unhandledrejection', getErrorFromUnhandledRejection(err => globalErrorsHandler(err)));
Vue.config.errorHandler = globalErrorsHandler;

/** тот самый обработчик необработанных ошибок */
async function globalErrorsHandler (err) {
  // прокидываем ошибку в приложение
  app.$bus.emit('uncaughtException', err);
}

/** Теперь можно глобально выкидывать ошибки без обработчиков */
/** Проверяем работоспособность LocalStorage'а */
assert(app.$storage.enabled, 'Пожалуйста, выйдите из приватного режима Safari. Стабильность работы приложения не гарантируется');

/**
 * Вешаем событие FastClick'а
 * @link http://v4-alpha.getbootstrap.com/content/reboot/#click-delay-optimization-for-touch
 */
document.addEventListener('DOMContentLoaded', () => FastClick.attach(document.body), false);

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

/** Монтируем приложение */
// wait until router has resolved all async before hooks
// and async components...
router.onReady(() => app.$mount('#app'));

// // service worker
// if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js')
// }

/** Для разработки выкидываем приложение глобально */
if (process.env.NODE_ENV == 'development') {
  window.app = app;
}
