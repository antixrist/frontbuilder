import _ from 'lodash';
import { API_URL } from '../../config';
import storage from '../storage';
import progress from '../progress';
import { errorToJSON, getStackFrames } from '../../utils';
import { http } from '../../factory';
import createError from 'axios/lib/core/createError';
import { enhanceResponseError } from '../../factory/http/axios-plugins/normalize-errors';

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
// api.interceptors.request.use(
//   config => {
//     console.log('interceptors request', _.cloneDeep(config));
//     return config;
//   },
//   err => {
//     console.log('interceptors request err', errorToJSON(err), err);
//     return Promise.reject(err);
//   }
// );
//
// api.interceptors.response.use(
//   config => {
//     console.log('interceptors response', _.cloneDeep(response));
//     return config;
//   },
//   err => {
//     console.log('interceptors response err', errorToJSON(err), err, err.code);
//     return Promise.reject(err);
//   }
// );

/** Подставим api_token во все запросы к api */
api.interceptors.request.use(config => {
  const token = storage.get('token');

  if (token) {
    config.data = config.data || {};
    config.data.api_token = token;
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

function isInvalidResponseBody (res) {
  return typeof res.body.success == 'undefined';
}

function formatInvalidResponseBody (res) {
  const { body, config, status } = res;

  const code = typeof body.code != 'undefined' ? body.code : status;
  // проверка на success - прямиком из `axios/lib/core/settle`
  const success = !code || !config.validateStatus || config.validateStatus(code);
  const message = typeof body.message != 'undefined' ? body.message : '';

  res.body = { success, code, message };
  if (success) {
    res.body.data = _.omit(body, ['success', 'code', 'message']);
  } else {
    res.body.errors = _.omit(body, ['success', 'code', 'message']);
  }

  // подчистим только что установленные, но `undefined` пропертя
  Object.keys(res.body).forEach(prop => {
    if (typeof res.body[prop] == 'undefined') {
      delete res.body[prop];
    }
  });

  return res;
}

function isApiError (res) {
  return typeof res.body != 'undefined' && typeof res.body.success != 'undefined' && !res.body.success;
}

function formatApiErrorResponseBody (res) {
  if (res.body.error) {
    Object.assign(res.body, res.body.error || {});
    delete res.body.error;
  }
  if (res.body.data) {
    Object.assign(res.body, { errors: res.body.data });
    delete res.body.data;
  }

  if (res.body.code) {
    res.body.code = parseInt(res.body.code, 10);
  }

  res.body.success = false;
}

function formatApiResponse (res) {
  if (isInvalidResponseBody(res)) {
    formatInvalidResponseBody(res);
  }

  const isError = isApiError(res);

  res.body.success = !isError;
  isError && formatApiErrorResponseBody(res);
}

api.interceptors.response.use(res => {
  if (!res.body) { return res; }

  /**
   * так же ответ может приходить таким, что он не соответствует принятой схеме.
   * обработаем этот момент.
   */

  formatApiResponse(res);

  if (!res.body.success) {
    /**
     * здесь любой неудачный ответ завернём в инстанс ошибки.
     * сделаем это родной для axios'а функцией `createError`
     * и нашим улучшателем ошибок ответа сервера
     */

    const err = createError(res.body.message || '', res.config, res.body.code || res.status, res);
    return Promise.reject(enhanceResponseError(err));
  }

  return res;
}, err => Promise.reject(err));

api.interceptors.response.use(res => res, err => {
  const { response: res } = err;
  
  console.log('err', errorToJSON(err));
  
  if (res) {
    formatApiResponse(res);
  }
  
  const errCode = _.get(res, 'body.code') || res.status;
  const errMessage = _.get(res, 'body.message') || err.message;

  err.code = err.statusCode = errCode;
  err.message = errMessage;
  if (res.body) {
    res.body.code = errCode;
    res.body.message = errMessage;
  }

  return Promise.reject(err);
});

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
