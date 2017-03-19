import d from 'd';
import _ from 'lodash';
import { isCancel } from 'axios';
import { errorToJSON } from '../../../utils';
import statuses from 'statuses';

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
  return Promise.reject(enhanceRequestError(err));
}

function responseInterceptorResolve (res) {
  const transcriptions = getResponseTranscription(res);

  Object.keys(transcriptions).forEach(key => Object.defineProperty(res, key, d('e', transcriptions[key])));

  return res;
}

function responseInterceptorReject (err) {
  return Promise.reject(enhanceResponseError(err));
}

export function enhanceRequestError (err) {
  const transcriptions = getRequestErrorTranscription(err);
  // если в `transcriptions` ни один из флагов не является `true`,
  // то это какая-то неведомая бубуйня.
  // это могут быть ошибки стримов и `req.on('err')` -
  // axios к таким ошибкам коды не ставит и сообщения отдаёт как есть
  const UNKNOWN_ERROR = !Object.keys(transcriptions).some(key => transcriptions[key]);

  // // и вот если мы смогли охарактеризовать ошибку
  // if (!UNKNOWN_ERROR) {
  //   // значит это 100% ошибка, связанная с запросом.
  //   // заберём из неё все имеющиеся свойства, кроме сообщения и стека
  //   let errJSON = errorToJSON(err);
  //   errJSON = _.omit(errJSON, ['message', 'stack']);
  //
  //   // переинстанцируем её на наш кастомный класс ошибки, чтобы извне можно было проверять `instanceof`ом
  //   err = new RequestError(err.message);
  //
  //   // и запишем в неё выдернутые свойства
  //   Object.keys(errJSON).forEach(key => Object.defineProperty(err, key, d('e', errJSON[key])));
  // }

  // назначим ошибке необходимые свойства
  Object.keys(transcriptions).forEach(key => Object.defineProperty(err, key, d('e', transcriptions[key])));
  Object.defineProperties(err, {
    HTTP_ERROR:    d('e', true),
    REQUEST_ERROR: d('e', true),
    UNKNOWN_ERROR: d('e', UNKNOWN_ERROR)
  });

  return err;
}

export function enhanceResponseError (err) {
  const transcriptions = getResponseErrorTranscription(err);
  // console.log('transcriptions', transcriptions);
  // если в `transcriptions` ни один из флагов не является `true`,
  // то это какая-то неведомая бубуйня.
  const UNKNOWN_ERROR = !Object.keys(transcriptions).some(key => transcriptions[key]);

  // // и вот если мы смогли охарактеризовать ошибку
  // if (!UNKNOWN_ERROR) {
  //   // значит это 100% ошибка, связанная с запросом.
  //   // заберём из неё все имеющиеся свойства, кроме сообщения и стека
  //   let errJSON = errorToJSON(err);
  //   errJSON = _.omit(errJSON, ['message', 'stack']);
  //
  //   // переинстанцируем её на наш кастомный класс ошибки, чтобы извне можно было проверять `instanceof`ом
  //   err = new ResponseError(err.message);
  //
  //   // и запишем в неё выдернутые свойства
  //   Object.keys(errJSON).forEach(key => Object.defineProperty(err, key, d('e', errJSON[key])));
  // }

  // назначим ошибке необходимые свойства
  Object.keys(transcriptions).forEach(key => Object.defineProperty(err, key, d('e', transcriptions[key])));
  Object.defineProperties(err, {
    HTTP_ERROR:     d('e', true),
    RESPONSE_ERROR: d('e', true),
    UNKNOWN_ERROR:  d('e', UNKNOWN_ERROR)
  });

  const { response } = err;
  if (response) {
    const transcriptions = getResponseTranscription(response);
    Object.keys(transcriptions).forEach(key => Object.defineProperty(response, key, d('e', transcriptions[key])));
    // Object.defineProperties(err, {
    //   code:       d('we', response.status),
    //   statusCode: d('we', response.status)
    // });
  }

  return err;
}

/**
 * @typedef {{}} AxiosError
 * @augments Error
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */

/**
 * @typedef {{}} AxiosErrorTranscription
 * @property {boolean} isCanceled
 * @property {boolean} CONNECTION_ERROR
 * @property {boolean} TIMEOUT_ERROR
 * @property {boolean} MAX_CONTENT_LENGTH_ERROR
 * @property {boolean} TRANSFORM_DATA_ERROR
 * @property {boolean} CLIENT_ERROR
 * @property {boolean} SERVER_ERROR
 * @property {boolean} UNKNOWN_ERROR
 */

/**
 * @param {AxiosError} err
 * @returns {AxiosErrorTranscription}
 */
export function getErrorTranscription (err) {
  const { message = null, code = null } = err;
  
  /**
   * ошибка xhr.onerror. это сообщение захардкожено в самом axios'е
   * @link https://github.com/mzabriskie/axios/blob/5630d3be55cd591cd279927616f895356a10a361/lib/adapters/xhr.js#L87
   */
  const xhrErrorMessage = 'Network Error';

  /**
   * коды ответа, которые возвращает нода (если axios запускался из под неё, а не в браузере),
   * если есть проблема с соединением
   * @link https://nodejs.org/api/errors.html#errors_common_system_errors
   */
  const connectionProblemCodes = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'];
  
  /**
   * Сработал таймаут. Если работаем в браузере, то код ошибки захардкожен в самом axios'е
   * @link https://github.com/mzabriskie/axios/blob/5630d3be55cd591cd279927616f895356a10a361/lib/adapters/xhr.js#L95
   * @link https://nodejs.org/api/errors.html#errors_common_system_errors
   */
  const timeoutCodes = ['ECONNABORTED', 'ETIMEDOUT'];
  
  
  const isCanceled = isCancel(err);
  const isTimeout = timeoutCodes.includes[code];
  const isXhrError = message === xhrErrorMessage;
  const isBadConnection = isXhrError || connectionProblemCodes.includes[code];
  
  /**
   * Тело ответа больше установленного в опциях запроса
   * @link https://github.com/mzabriskie/axios/blob/5630d3be55cd591cd279927616f895356a10a361/lib/adapters/http.js#L170
   */
  const isBadMaxContentLength = !!~message.indexOf('maxContentLength');
  
  /**
   * Неправильно трансформировано тело ответа.
   * @link https://github.com/mzabriskie/axios/blob/5630d3be55cd591cd279927616f895356a10a361/lib/adapters/http.js#L38-L41
   */
  const isBadTransformData = !!~message.indexOf('Data after transformation must');
  
  /**
   * Если произошла какая-то ошибка во время выполнения запроса,
   * которую axios решил специальным образом не обрабатывать,
   * то у такой ошибки нет кода или код может быть каким-то нечисловым (т.е. не http-кодом).
   * Это могут быть ошибки req или стримов (внутри ноды), или иметь какое-то
   * захардкоженное строковое значение как `ECONNABORTED`, к примеру.
   * Все известные мне на данный момент строковые коды обрабатываются.
   * Но в новых версиях могут появиться и другие.
   * Поэтому простое правило - если `_.isNumber(err.code) === false`, значит это не http-код,
   * значит это что-то внутреннее. А значит это ошибка на этапе request'а. До response'а дело не дошло.
   *
   * @link https://github.com/mzabriskie/axios/blob/5630d3be55cd591cd279927616f895356a10a361/lib/adapters/http.js#L176
   * @link https://github.com/mzabriskie/axios/blob/5630d3be55cd591cd279927616f895356a10a361/lib/adapters/http.js#L194
   */

  const HttpError = {
    RequestError: false,
    ResponseError: false
  };
  
  
  // если запрос отменён, или это ошибка соединения, таймаута или какой-то нечисловой код
  if (isCanceled || isBadConnection || isTimeout || err.code || !_.isNumber(err.code)) {
    HttpError.RequestError = {
      isCanceled,
      isBadConnection,
      isTimeout
    };
  } else {
    
  }
  
  err.IS_CANCELED = isCancel(err);
  
  const retVal = {};
  
  if (!err.code || IS_CANCELED || LOOSE_CONNECTION || IS_TIMEOUT) {
    retVal.BAD_REQUEST = true;
  }
  
  const transcriptions = {
    // запрос отменён токеном отмены
    isCanceled: isCancel(err),
  
    CONNECTION_ERROR:
      // сработал xhr.onerror, без кодов и статусов (это сообщение захардкожено в самом axios'е)
      message === 'Network Error' ||
      // код ответа, который вернула сама нода (если axios запускался из под неё, а не в браузере) - проблема с соединением
      ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'].includes[code]
    ,
  
    // сработал таймаут (этот код захардкожен в самом axios'е)
    TIMEOUT_ERROR: ['ECONNABORTED'].includes[code],
    // превышение установленного в конфиге максимального размера ответа
    MAX_CONTENT_LENGTH_ERROR: !!~message.indexOf('maxContentLength'),
    // ошибка неправильного результата из transformRequest'а
    TRANSFORM_DATA_ERROR: !!~message.indexOf('Data after transformation must'),
  };
  
  // если нету response'а, а http-код ответа (если он есть) подразумевает обязательное наличие тела ответа
  if (!err.response && !statuses.empty[err.code]) {
    // значит это ошибка запроса.
    // например, таймаут, canceled, ещё какая-нибудь фигня, при которой ответа от сервера не было вообще)
    //
    transcriptions.REQUEST_ERROR = true;
    transcriptions.CLIENT_ERROR = false;
    transcriptions.SERVER_ERROR = false;
  } else {
    // а если `response` есть, то ответ от сервера получен,
    // но он не прошёл валидацию в `config.validateStatus`.
    // запишем, что это ошибка ответа
    transcriptions.RESPONSE_ERROR = true;
    // немного её проклассифицируем
    const { is4xx = false, is5xx = false } = err.response ? getResponseTranscription(err.response) : {};
    transcriptions.CLIENT_ERROR = is4xx;
    transcriptions.SERVER_ERROR = is5xx;
  }
  
  // если в `transcriptions` ни один из флагов не является `true`,
  // то это какая-то неведомая бубуйня.
  // это могут быть ошибки стримов и `req.on('err')` -
  // axios к таким ошибкам коды не ставит и сообщения отдаёт как есть
  transcriptions.UNKNOWN_ERROR = !Object.keys(transcriptions).some(key => transcriptions[key]);
  
  transcriptions.HTTP_ERROR = true;
  
  return transcriptions;
}

/**
 * @param {Error} err
 * @returns {RequestErrorTranscription}
 */
export function getRequestErrorTranscription (err) {
  const { message = '', code = '' } = err;

  return {
    // запрос отменён токеном отмены
    isCanceled: isCancel(err),
  
    CONNECTION_ERROR:
      // сработал xhr.onerror, без кодов и статусов (это сообщение захардкожено в самом axios'е)
      message === 'Network Error' ||
      // код ответа, который вернула сама нода (если axios запускался из под неё, а не в браузере) - проблема с соединением
      ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'].includes[code]
    ,
    
    // сработал таймаут (этот код захардкожен в самом axios'е)
    TIMEOUT_ERROR: ['ECONNABORTED'].includes[code],
    
    // превышение установленного в конфиге максимального размера ответа
    MAX_CONTENT_LENGTH_ERROR: !!~message.indexOf('maxContentLength'),
    // ошибка неправильного результата из transformRequest'а
    TRANSFORM_DATA_ERROR: !!~message.indexOf('Data after transformation must'),
  
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
export function getResponseErrorTranscription (err) {
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
export function getResponseTranscription (res = {}) {
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
