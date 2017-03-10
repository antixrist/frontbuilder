/**
 * В точке входа лучше определить все тяжёлые зависимости (даже если они здесь не используются),
 * чтобы при webpack'овском code-splitting'е они не попадали в каждый чанк по отдельности
 */

/** Но `babel-polyfill` надо ставить первым в каждой точке входа */
import 'babel-polyfill';
import _ from 'lodash';
import Vue from 'vue';
import FastClick from 'fastclick';
import { isDevelopment } from './config';
import { assert, uncaughtExceptionHandler, unhandledRejectionHandler } from './utils';
import { HttpError, RequestError, ResponseError } from './factory/http/errors';
import { reportError } from './service/api';

import '../styles/main.scss';
import app from './app';

/** Все кастомные ошибки лучше выкинуть глобально */
window.HttpError     = HttpError;
window.RequestError  = RequestError;
window.ResponseError = ResponseError;

/**
 * Ловим все возможные необработанные ошибки
 * и отправляем каждую в свой обработчик
 */
window.addEventListener('error', uncaughtExceptionHandler(({ error }) => globalErrorsHandler(error)));
window.addEventListener('unhandledrejection', unhandledRejectionHandler(({ error }) => globalErrorsHandler(error)));
Vue.config.errorHandler = globalErrorsHandler;

/** тот самый обработчик необработанных ошибок */
async function globalErrorsHandler (err) {
  const isHttpError       = (err instanceof HttpError);
  const isConnectionError = isHttpError && err.CONNECTION_ERROR;

  if (isHttpError) {
    // если это отменённый запрос, то делать, в принципе, ничего не надо
    if (err.isCanceled) { return; }
  } else {

  }

  // прокидываем ошибку в приложение
  app.$bus.emit('uncaughtException', err);
  // console.error('[app]', err);

  // если у нас продакшн и это не ошибка сети
  if (!isDevelopment && !isConnectionError) {
    // то отправим её на сервер
    await reportError({ err });
  }
}

/** Теперь можно глобально выкидывать ошибки без обработчиков */
/** Проверяем работоспособность LocalStorage'а */
assert(app.$storage.enabled, 'Пожалуйста, выйдите из приватного режима Safari. Стабильность работы приложения не гарантируется');

/**
 * Вешаем событие FastClick'а
 * @link http://v4-alpha.getbootstrap.com/content/reboot/#click-delay-optimization-for-touch
 */
document.addEventListener('DOMContentLoaded', () => FastClick.attach(document.body), false);

/** Монтируем приложение */
app.$mount('#app');

/** А для разработки выкидываем его глобально */
if (process.env.NODE_ENV == 'development') {
  window.app = app;
}
