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

/** обработчик необработанных ошибок */
async function globalErrorsHandler (err) {
  // прокидываем ошибку в приложение
  app.$bus.emit('uncaughtException', err);
}

/** Теперь можно глобально выкидывать ошибки без обработчиков */
/** Проверяем работоспособность LocalStorage'а */
assert(app.$storage.enabled, `Пожалуйста, выйдите из приватного режима Safari.
                              Стабильность работы приложения не гарантируется`);

/**
 * Вешаем событие FastClick'а
 * @link http://v4-alpha.getbootstrap.com/content/reboot/#click-delay-optimization-for-touch
 */
document.addEventListener('DOMContentLoaded', () => FastClick.attach(document.body), false);

/**
 * Если есть state, инициализированный на сервере
 * (определяется во время SSR и вставляется в разметку страницы),
 * то заменим им основной state
 */
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

/** Монтируем приложение */
/** но сперва ждём, пока роутер не зарезолвит все асинхронные компоненты и `beforeEach` хуки */
router.onReady(() => app.$mount('#app'));

/** Для разработки выкидываем приложение глобально */
if (process.env.NODE_ENV == 'development') {
  window.app = app;
}

// // service worker
// if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js')
// }
