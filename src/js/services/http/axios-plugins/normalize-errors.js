import d from 'd';
import _ from 'lodash';
import { isCancel } from 'axios';
import { errorToJSON } from '../../../utils';
import { HttpError, RequestError, ResponseError } from '../errors';
import statuses from 'statuses';

/**
 * todo: Переписывать ошибки запросов/ответов с `Error` на какие-нибудь `HttpError` или `RequestError`,
 * чтобы в глобальном обработчике ошибок можно было такие ошибки распознать
 */

normalizeErrors.destroy = destroy;

/**
 * @param {AxiosInstance} instance
 * @returns {*}
 */
export default function normalizeErrors (instance) {
  Object.defineProperty(instance, 'normalizeErrors', d('', {}));

  const { normalizeErrors } = instance;

  normalizeErrors.interceptors = {
    request:  instance.interceptors.request.use(requestInterceptorResolve, requestInterceptorReject),
    response: instance.interceptors.response.use(responseInterceptorResolve, responseInterceptorReject)
  };
  
  return instance;
}

/**
 * @param {AxiosInstance} instance
 * @returns {*}
 */
export function destroy (instance) {
  if (!instance.normalizeErrors) { return instance; }

  instance.interceptors.request.eject(instance.normalizeErrors.interceptors.request);
  instance.interceptors.response.eject(instance.normalizeErrors.interceptors.response);

  delete instance.normalizeErrors;

  return instance;
}

function requestInterceptorResolve (config) {
  return config;
}

function requestInterceptorReject (err) {
  const transcriptions = getRequestErrorTranscription(err);
  // если в `transcriptions` ни один из флагов не является `true`,
  // то это какая-то неведомая бубуйня.
  // это могут быть ошибки стримов и `req.on('err')` -
  // axios к таким ошибкам коды не ставит и сообщения отдаёт как есть
  const UNKNOWN_ERROR = !Object.keys(transcriptions).some(key => transcriptions[key]);

  // и вот если мы смогли охарактеризовать ошибку
  if (!UNKNOWN_ERROR) {
    // значит это 100% ошибка, связанная с запросом.
    // заберём из неё все имеющиеся свойства, кроме сообщения и стека
    let errJSON = errorToJSON(err);
    errJSON = _.omit(errJSON, ['message', 'stack']);

    // переинстанцируем её на наш кастомный класс ошибки, чтобы извне можно было проверять `instanceof`ом
    err = new RequestError(err.message);

    // и запишем в неё выдернутые свойства
    Object.keys(errJSON).forEach(key => Object.defineProperty(err, key, d('e', errJSON[key])));
  }

  // назначим ошибке необходимые свойства
  Object.keys(transcriptions).forEach(key => Object.defineProperty(err, key, d('e', transcriptions[key])));
  Object.defineProperties(err, {
    REQUEST_ERROR: d('e', true),
    UNKNOWN_ERROR: d('e', UNKNOWN_ERROR)
  });

  return Promise.reject(err);
}

function responseInterceptorResolve (res) {
  const transcriptions = getResponseTranscription(res);

  Object.keys(transcriptions).forEach(key => Object.defineProperty(res, key, d('e', transcriptions[key])));

  return res;
}

function responseInterceptorReject (err) {
  const transcriptions = getResponseErrorTranscription(err);
  // если в `transcriptions` ни один из флагов не является `true`,
  // то это какая-то неведомая бубуйня.
  const UNKNOWN_ERROR = !Object.keys(transcriptions).some(key => transcriptions[key]);

  // и вот если мы смогли охарактеризовать ошибку
  if (!UNKNOWN_ERROR) {
    // значит это 100% ошибка, связанная с запросом.
    // заберём из неё все имеющиеся свойства, кроме сообщения и стека
    let errJSON = errorToJSON(err);
    errJSON = _.omit(errJSON, ['message', 'stack']);

    // переинстанцируем её на наш кастомный класс ошибки, чтобы извне можно было проверять `instanceof`ом
    err = new ResponseError(err.message);

    // и запишем в неё выдернутые свойства
    Object.keys(errJSON).forEach(key => Object.defineProperty(err, key, d('e', errJSON[key])));
  }

  // назначим ошибке необходимые свойства
  Object.keys(transcriptions).forEach(key => Object.defineProperty(err, key, d('e', transcriptions[key])));
  Object.defineProperties(err, {
    RESPONSE_ERROR: d('e', true),
    UNKNOWN_ERROR:  d('e', UNKNOWN_ERROR)
  });

  const { response = null } = err;
  if (response) {
    const transcriptions = getResponseTranscription(response);

    Object.keys(transcriptions).forEach(key => Object.defineProperty(response, key, d('e', transcriptions[key])));
    Object.defineProperties(err, {
      code:       d('e', response.status),
      statusCode: d('e', response.status)
    });
  }
  
  return Promise.reject(err);
}


/**
 * @typedef {{}} RequestErrorTranscription
 * @property {boolean} CONNECTION_ERROR
 * @property {boolean} TIMEOUT_ERROR
 * @property {boolean} isCanceled
 */

/**
 * @param {Error} err
 * @returns {RequestErrorTranscription}
 */
function getRequestErrorTranscription (err) {
  const { message = '', code = '' } = err;

  return {
    CONNECTION_ERROR:
      // сработал xhr.onerror, без кодов и статусов (это сообщение захардкожено в самом axios'е)
      message === 'Network Error' ||
      // код ответа, который вернула сама нода (если axios запускался из под неё, а не в браузере) - проблема с соединением
      ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'].includes[code]
    ,
    
    // сработал таймаут (этот код захардкожен в самом axios'е)
    TIMEOUT_ERROR: ['ECONNABORTED'].includes[code],
    
    // запрос отменён токеном отмены
    isCanceled: isCancel(err),
  };
}

/**
 * @typedef {{}} ResponseErrorTranscription
 * @property {boolean} MAX_CONTENT_LENGTH_ERROR
 * @property {boolean} TRANSFORM_DATA_ERROR
 * @property {boolean} CLIENT_ERROR
 * @property {boolean} SERVER_ERROR
 */

/**
 * @param {Error} err
 * @param {{}} [err.response]
 * @returns {ResponseErrorTranscription}
 */
function getResponseErrorTranscription (err) {
  const { message = '' } = err;
  
  const transcriptions = {
    // превышение установленного в конфиге максимального размера ответа
    MAX_CONTENT_LENGTH_ERROR: !!~message.indexOf('maxContentLength'),
    // ошибка неправильного результата из transformRequest'а
    TRANSFORM_DATA_ERROR: !!~message.indexOf('Data after transformation must'),

    // запрос отменён токеном отмены
    isCanceled: isCancel(err)
  };
  
  // если у ошибки установлен `response`, значит ответ от сервера получен,
  // но он не прошёл валидацию в `config.validateStatus`
  const { is4xx = false, is5xx = false } = err.response ? getResponseTranscription(err.response) : {};
  
  transcriptions.CLIENT_ERROR = is4xx;
  transcriptions.SERVER_ERROR = is5xx;
  
  return transcriptions;
}

/**
 * @typedef {{}} ResponseTranscription
 * @property {boolean} is1xx
 * @property {boolean} is2xx
 * @property {boolean} is3xx
 * @property {boolean} is4xx
 * @property {boolean} is5xx
 * @property {boolean} isEmpty
 * @property {boolean} hasRedirect
 * @property {boolean} allowRetry
 */

/**
 * @param {{}} [res={}]
 * @param {Number} [res.status=0]
 * @returns {ResponseTranscription}
 */
function getResponseTranscription (res = {}) {
  const { status = 0 } = res;

  return {
    is1xx: status >= 100 && status < 200,
    is2xx: status >= 200 && status < 300,
    is3xx: status >= 300 && status < 400,
    is4xx: status >= 400 && status < 500,
    is5xx: status >= 500,
    
    isEmpty:     !!statuses.empty[status],
    hasRedirect: !!statuses.redirect[status],
    allowRetry:  !!statuses.retry[status],
  };
}
