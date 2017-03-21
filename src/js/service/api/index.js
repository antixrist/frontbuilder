import d from 'd';
import _ from 'lodash';
import { API_URL, API_TOKEN_NAME, logApiRequests } from '../../config';
import storage from '../storage';
import progress from '../progress';
import status from 'statuses';
import { errorToJSON, getStackFrames } from '../../utils';
import { http } from '../../factory';
import axiosCreateError from 'axios/lib/core/createError';
import { enhanceAxiosError } from '../../factory/http/axios-plugins/detailed';

function createError (msg, config, code, response) {
  const err = axiosCreateError(msg, config, code, response);
  return enhanceAxiosError(err);
}

const LOCAL_ERROR_CODES = [400, 422, 800];

const api = http({
  method: 'post',
  baseURL: API_URL,
  timeout: 10000, // 10 сек.
  headers: {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  },
});

/** Пологируем */
if (logApiRequests) {
  api.interceptors.request.use(
    config => {
      console.log('[start] request', _.cloneDeep(config));
      return config;
    },
    err => {
      console.log('[start] request error', err, errorToJSON(err));
      return Promise.reject(err);
    }
  );
  api.interceptors.response.use(
    res => {
      console.log('[start] response', _.cloneDeep(res));
      return res;
    },
    err => {
      console.log('[start] response error', err, errorToJSON(err));
      return Promise.reject(err);
    }
  );
}

/** Подставим api_token во все запросы к api */
api.interceptors.request.use(config => {
  const token = storage.get(API_TOKEN_NAME);

  if (token) {
    config.data = config.data || {};
    config.data[API_TOKEN_NAME] = token;
  }

  return config;
}, err => Promise.reject(err));

/** Прогресс-бар для запросов к api */
api.interceptors.request.use(
  config => {
    /**
     * если передать { silent: true } в параметрах запроса,
     * то прогресс для этого запроса показан не будет
     */
    !config.silent && progress.requestStart();

    return config;
  },
  err => {
    const { isCanceled, config } = err;

    if (!config || !config.silent) {
      progress.requestDone();
    }

    return Promise.reject(err);
  }
);

api.interceptors.response.use(
  res => {
    const { config } = res;
    !config.silent && progress.requestDone();

    return res;
  },
  err => {
    const { isCanceled, config } = err;

    if (!config || !config.silent) {
      progress.requestDone();
    }

    return Promise.reject(err);
  }
);

/**
 * Если ответ пришёл с 5xx-ошибкой, то на сервере что-то поломалось и валидный json совершенно не обязателен.
 * Или по http-канонам ответ может быть пустым. Тогда тоже всё нормально (вроде как).
 *
 * @param {AxiosResponse} response
 * @returns {boolean}
 */
function apiResponseBodyCanBeInvalid (response) {
  return (response.is5xx || response.bodyShouldBeEmpty);
}

/**
 * Если ответ пустой или это не json
 *
 * @param body
 * @returns {boolean}
 */
function isInvalidApiResponseBody (body) {
  return (!body || !_.isPlainObject(body));
}

/**
 * json-ответ от api обязательно должен иметь поле `success`
 *
 * @param body
 * @returns {boolean}
 */
function apiResponseDataHasValidFormat (body) {
  return typeof body.success != 'undefined';
}

/**
 * @param {{}} data
 * @returns {{success: Boolean, message: String, data: {}}}
 */
export function getSuccessJson (data = {}) {
  return _.merge({
    message: '',
    data: {}
  }, data || {}, {
    success: true,
  });
}

/**
 * @param {{}} extend
 * @returns {{success: Boolean, message: String, code: Number, errors: {}}}
 */
export function getFailedJson (extend = {}) {
  const retVal = _.merge({
    message: '',
    code: 0,
    errors: {}
  }, extend || {}, {
    success: false,
  });
  
  retVal.code = retVal.code ? parseInt(retVal.code, 10) : retVal.code;
  
  return retVal;
}

/**
 * @param body
 * @returns {{}}
 */
function formatApiResponse (body) {
  if (body.error) {
    body.success = false;
    Object.assign(body, body.error);
    delete body.error;
  }

  const possibleTopLevelProps = body.success ? _.keys(getSuccessJson()) : _.keys(getFailedJson());
  
  let data = _.omit(body, possibleTopLevelProps);
  body = _.pick(body, possibleTopLevelProps);
  
  if (body.success) {
    body.data = body.data ? _.merge(body.data, data) : data;
  } else {
    body.errors = body.errors ? _.merge(body.errors, data) : data;
  }

  return body.success ? getSuccessJson(body) : getFailedJson(body);
}

/**
 * На этом шаге проверим - если нам не пришёл распарсенный json, то нормально ли это.
 * Если нет - вернём ошибку с соответствующей пометкой.
 */
api.interceptors.response.use(
  res => {
    if ((isInvalidApiResponseBody(res.body) && !apiResponseBodyCanBeInvalid(res))) {
      const err = createError('', res.config, res.status, res);
      Object.defineProperty(err, 'isInvalidApiResponseBody', d('e', true));
    
      return Promise.reject(err);
    }
    
    return res;
  },
  err => {
    const hasInvalidBody = !!(err.response && isInvalidApiResponseBody(err.response.body) && !apiResponseBodyCanBeInvalid(err.response));
    Object.defineProperty(err, 'isInvalidApiResponseBody', d('e', hasInvalidBody));
    
    return Promise.reject(err);
  }
);

/**
 * Теперь здесь надо проверить валидность формата пришедшего json.
 * Если он не валидный, то попытаться привести его к нормальному виду.
 */
api.interceptors.response.use(res => {
  /** На этом этапе будет либо валидный json, либо разрешённый http-канонами пустой ответ */
  
  /** Если ответ пуст, то просто запишем дефолтовый ответ с `success === true` */
  if (res.hasEmptyBody) {
    res.body = getSuccessJson();
  }
  
  // /** теперь проверим - а в правильном ли формате? */
  // if (!apiResponseDataHasValidFormat(res.body)) {
  //   res.body.success = true;
  // }
  
  /** причешем конечный json */
  res.body.success = true;
  res.body = formatApiResponse(res.body);

  const { body, config } = res;
  
  /**
   * Теперь в чём прикол.
   * Если у нас `success === false`, то в теле ответа может присутствовать ненулевой `code`.
   * Вот здесь-то и надо захардкодить те коды, которые должны обрабатываться снаружи глобальным обработчиком,
   * а какие оставлять в теле ответа, чтобы обрабатывать на месте.
   */
  if (!body.success && body.code && !LOCAL_ERROR_CODES.includes(body.code)) {
    /**
     * т.е. в json'е есть ненулевой код (это может быть, к примеру, 401, 403, 500 и т.д.)
     * и этот код надо выкидывать наружу.
     */
    
    res.status = body.code;
    res.statusText = status[body.code];
    
    const err = createError(body.message || '', config, body.code, res);
    return Promise.reject(enhanceAxiosError(err));
  }
  
  /** возвращаем json-ответ */
  return body;
}, err => {
  /** Здесь надо учесть ещё и все те ошибки, которые были созданы вручную, шагами выше. */

  /**
   * Если мы оказались в этом catch-блоке потому,
   * что не прошла валидация в `config.validateStatus`
   */
  if (err.ResponseError && err.ResponseError.isStatusRejected) {
    /**
     * сотрём axios'овское захардкоженное обобщённое сообщение об ошибке
     * @link @link https://github.com/mzabriskie/axios/blob/master/lib/core/settle.js#L19
     */
    err.message = '';
    
    let { code, message } = err;
    
    /** если есть нормальное тело ответа */

    if (!err.isInvalidApiResponseBody) {
      const { response: res } = err;

      /** Если ответ пуст, то просто запишем дефолтовый ответ с `success === false` */
      if (res.hasEmptyBody) {
        res.body = getFailedJson();
      }
  
      /** причешем конечный json */
      res.body.success = false;
      res.body = formatApiResponse(res.body);

      const { body } = res;
      
      /**
       * теперь вытащим код и сообщение из json-ответа,
       * если такие есть с фоллбеком на уже имеющиеся
       */
      code = body.code || code;
      message = body.message || message;
  
      /**
       * и вот если этот код входит в список "локальных",
       * т.е. такую ошибку **не надо** выкидывать глобально
       */
      if (LOCAL_ERROR_CODES.includes(code)) {
        /** то вернём **json с ошибкой**, а **не объект Error** */
        res.body = getFailedJson(Object.assign(body, {
          code,
          message
        }));
  
        /** возвращаем json-ответ */
        return res.body;
      } else {
        /** иначе просто перезапишем у ошибки код и сообщение */
        err.code = code;
        err.message = message;
        err.response = res;
      }
    }
  }
  
  return Promise.reject(err);
});

/** Пологируем */
if (logApiRequests) {
  api.interceptors.request.use(
    config => {
      console.log('[end] request', _.cloneDeep(config));
      return config;
    },
    err => {
      console.log('[end] request error', err, errorToJSON(err));
      return Promise.reject(err);
    }
  );
  api.interceptors.response.use(
    res => {
      console.log('[end] response', _.cloneDeep(res));
      return res;
    },
    err => {
      console.log('[end] response error', err, errorToJSON(err));
      return Promise.reject(err);
    }
  );
}









export async function reportError (data, opts = {}) {
  const { error } = data;
  const errObj = errorToJSON(error);
  delete data.error;

  try {
    const stackframes = await getStackFrames(error);
    errObj.stackframes = stackframes.map(sf => sf.toString()).join('\n');
  } catch (err) {
    console.error(err);
  }

  Object.assign(data, errObj, {
    userAgent: navigator.userAgent,
    location: document.location.href,
  });

  return await api
    .post('/report-error', data, Object.assign({silent: true}, opts))
    .catch(err => console.error(err))
  ;
}

export default api;
