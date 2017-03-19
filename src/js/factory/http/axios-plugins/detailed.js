import d from 'd';
import _ from 'lodash';
import { isCancel } from 'axios';
import { errorToJSON } from '../../../utils';
import statuses from 'statuses';

normalizeErrors.destroy = destroy;

/**
 * @param {AxiosInstance} instance
 * @returns {AxiosInstance}
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
 * @returns {AxiosInstance}
 */
export function destroy (instance) {
  if (!instance.normalizeErrors) { return instance; }

  instance.interceptors.request.eject(instance.normalizeErrors.interceptors.request);
  instance.interceptors.response.eject(instance.normalizeErrors.interceptors.response);

  delete instance.normalizeErrors;

  return instance;
}

/**
 * @param {AxiosRequestConfig} config
 * @returns {AxiosRequestConfig}
 */
function requestInterceptorResolve (config) {
  return config;
}

/**
 * @param {AxiosError} err
 * @returns {Promise<AxiosError>}
 */
function requestInterceptorReject (err) {
  return Promise.reject(enhanceAxiosError(err));
}

/**
 * @param {AxiosResponse} response
 * @returns {AxiosResponse}
 */
function responseInterceptorResolve (response) {
  return enhanceAxiosResponse(response);
}

/**
 * @param {AxiosError} err
 * @returns {Promise<AxiosError>}
 */
function responseInterceptorReject (err) {
  return Promise.reject(enhanceAxiosError(err));
}

/**
 * @param {AxiosError} err
 * @returns {AxiosError}
 */
export function enhanceAxiosError (err) {
  const errorExtendedData = getAxiosErrorDetails(err);
  
  /** `response`а может и не быть */
  if (err.response) {
    enhanceAxiosResponse(err.response);
  }

  Object.defineProperty(err, 'HttpError', d('e', true));
  Object.keys(errorExtendedData).forEach(key => {
    Object.defineProperty(err, key, d('e', errorExtendedData[key]));
  });
  
  return err;
}

/**
 * @param {AxiosResponse} response
 * @returns {AxiosResponse}
 */
export function enhanceAxiosResponse (response) {
  const responseExtendedData = getAxiosResponseDetails(response);
  
  Object.keys(responseExtendedData).forEach(key => {
    Object.defineProperty(response, key, d('e', responseExtendedData[key]));
  });

  return response;
}

/**
 * @param {AxiosError} err
 * @returns {AxiosErrorDetails}
 */
export function getAxiosErrorDetails (err) {
  const { config, message = '', code = null } = err;
  
  /**
   * ошибка xhr.onerror. это сообщение захардкожено в самом axios'е
   * @link https://github.com/mzabriskie/axios/blob/5630d3be55cd591cd279927616f895356a10a361/lib/adapters/xhr.js#L87
   */
  const xhrErrorMessage = 'Network Error';

  /**
   * коды ответа, которые возвращает нода если есть проблема с соединением
   * (если axios запускается из под неё, а не в браузере)
   * @link https://nodejs.org/api/errors.html#errors_common_system_errors
   */
  const connectionProblemCodes = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'];
  
  /**
   * Сработал таймаут. Если работаем в браузере, то код ошибки захардкожен в самом axios'е
   * @link https://github.com/mzabriskie/axios/blob/5630d3be55cd591cd279927616f895356a10a361/lib/adapters/xhr.js#L95
   * @link https://nodejs.org/api/errors.html#errors_common_system_errors
   */
  const timeoutCodes = ['ECONNABORTED', 'ETIMEDOUT'];
  
  
  /**
   * В восьмом и девятом ишаках нет XMLHttpRequest'а для отсылки запросов.
   * В них используют XDomainRequest. И прикол в том, что у этого XDomainRequest'а
   * нет возможности прочитать http-код ответа. Хотя ответ может быть вполне себе успешным.
   * У него можно прочитать `responseText` (т.е. текстовую расшифровку http-кода),
   * но ориентироваться на строковое значение в старых ишаках - так себе затея.
   * Поэтому проверка строится на наличии ответа и отсутствии http-кода.
   *
   * @link https://developer.mozilla.org/ru/docs/Web/API/XDomainRequest
   * @link https://github.com/mzabriskie/axios/blob/master/lib/core/settle.js#L14-L15
   */
  const isOldIEXDomainRequest = typeof err.response != 'undefined' && !err.response.status;
  
  /**
   * Тело ответа больше установленного в опциях запроса
   * @link https://github.com/mzabriskie/axios/blob/5630d3be55cd591cd279927616f895356a10a361/lib/adapters/http.js#L170
   */
  const isMaxContentLengthOverflow = !!~message.indexOf('maxContentLength');
  
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

  /** запрос отменён */
  const isCanceled = isCancel(err);
  /** сработал таймаут */
  const isTimeout = timeoutCodes.includes[code];
  /** xhr-ошибка, не имеющая подробных характеристик */
  const isXhrError = message === xhrErrorMessage;
  /** возможно, хреновое соединение */
  const isBadConnection = isXhrError || connectionProblemCodes.includes[code];
    
  const retVal = {
    RequestError: false,
    ResponseError: false
  };
  
  /**
   * Вопрос - является ли необходимым условием отсутствие `response`а?
   * Вроде как не факт. Потому что ответ может быть потоком, который ещё не завершён,
   * а пользователь может отменить запрос.
   * Тогда и запрос вроде как отменён, и axios может оставить поле ответа.
   * Проверять я это, конечно же, не буду.
   *
   * Если:
   *  - запрос отменён,
   *  - или это ошибка соединения,
   *  - таймаута,
   *  - или неправильной трансформации;
   *  - может это какой-то нечисловой код или код вообще отсутствует
   *    (при условии, что это не старый ишак, в котором `response` есть, а кода нет)
   */
  if (
    isCanceled ||
    isBadConnection ||
    isTimeout ||
    isBadTransformData ||
    (!isOldIEXDomainRequest && (!err.code || !_.isNumber(err.code)))
  ) {
    /** то это ошибка запроса */
    retVal.RequestError = {
      isTimeout,
      isXhrError,
      isCanceled,
      isBadConnection,
      isBadTransformData,
      /**
       * если кода нет или это какое-то необработанное строковое значение,
       * то пометим ошибку как неизвестную
       */
      isUnknown: !err.code || !_.isNumber(err.code)
    };
  } else {
    /** иначе это ошибка ответа */
    
    /**
     * По логике, в эту ветку условия мы попадаем только в том случае,
     * если ответ от сервера получен, но он не прошёл валидацию в `config.validateStatus`.
     * Но случаи бывают всякие. Поэтому сделаем об этом отдельную пометку, на всякий случай.
     *
     * @link https://github.com/mzabriskie/axios/blob/master/lib/core/settle.js#L14-L15
     */
    const validateStatus = config.validateStatus;
    const isStatusRejected = (!isOldIEXDomainRequest && validateStatus && !validateStatus(err.response.status));
  
    retVal.ResponseError = {
      isStatusRejected,
      isOldIEXDomainRequest,
      isMaxContentLengthOverflow
    };
  }
  
  return retVal;
}

/**
 * @param {AxiosResponse} res
 * @returns {AxiosResponseDetails}
 */
export function getAxiosResponseDetails (res) {
  const { status = 0 } = res;
  
  const isRedirect         = status && statuses.redirect[status];
  const canBeRetried       = status && statuses.retry[status];
  const hasEmptyBody       = !res.data;
  const shouldHasEmptyBody = status && statuses.empty[status];
  
  const is1xx = status >= 100 && status < 200;
  const is2xx = status >= 200 && status < 300;
  const is3xx = status >= 300 && status < 400;
  const is4xx = status >= 400 && status < 500;
  const is5xx = status >= 500;
  const isUnknownStatus = !statuses[status];
  
  return {
    is1xx,
    is2xx,
    is3xx,
    is4xx,
    is5xx,
    isUnknownStatus,
  
    isRedirect,
    canBeRetried,
    hasEmptyBody,
    shouldHasEmptyBody
  };
}

/**
 * @typedef {{}} AxiosResponseDetails
 * @property {boolean} is1xx
 * @property {boolean} is2xx
 * @property {boolean} is3xx
 * @property {boolean} is4xx
 * @property {boolean} is5xx
 * @property {boolean} isUnknownStatus
 * @property {boolean} isRedirect
 * @property {boolean} canBeRetried
 * @property {boolean} hasEmptyBody
 * @property {boolean} shouldHasEmptyBody
 */

/**
 * @typedef {{}} AxiosErrorDetails
 * @property {(boolean|{})} RequestError
 * @property {boolean} [RequestError.isTimeout]
 * @property {boolean} [RequestError.isXhrError]
 * @property {boolean} [RequestError.isCanceled]
 * @property {boolean} [RequestError.isBadConnection]
 * @property {boolean} [RequestError.isBadTransformData]
 * @property {(boolean|{})} ResponseError
 * @property {boolean} [ResponseError.isStatusRejected]
 * @property {boolean} [ResponseError.isOldIEXDomainRequest]
 * @property {boolean} [ResponseError.isMaxContentLengthOverflow]
 */
