import _ from 'lodash';
import statuses from 'statuses';
import { API_URL } from '../../config';
import bus from '../bus';
import store from '../store';
import progress from '../progress';
import { errorToJSON, getStackFrames } from '../../utils';
import { http } from '../../factory';
import { ResponseError } from '../../factory/http/errors';
import createError from 'axios/lib/core/createError';
import { enhanceResponseError, getResponseTranscription } from '../../factory/http/axios-plugins/normalize-errors';

const api = http({
  method: 'post',
  baseURL: API_URL,
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
  const token = store.getters['account/token'];

  console.log('interceptors.request token', token);

  if (token) {
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
  const { body, config } = res;

  const code = typeof body.code != 'undefined' ? body.code : status;
  // проверка на success - прямиком из `axios/lib/core/settle`
  const success = (!code || !config.validateStatus || config.validateStatus(code));
  const message = typeof body.message != 'undefined' ? body.message : '';
  const data = _.omit(body, ['success', 'code', 'message']);

  res.body = { success, code, message, data };
  // подчистим `undefined` пропертя
  Object.keys(res.body).forEach(prop => {
    if (typeof res.body[prop] == 'undefined') {
      delete res.body[prop];
    }
  });

  return res;
}

/**
 * Сервер всегда присылает ответ в виде:
 * `{ success: true, data: {} }`
 * `{ success: false, code: 401, message: '' }`
 *
 * Но есть соглашение - при `success: false` в `code` будет http-код, например 401, 404 и т.п.
 * А сам http-ответ всегда будет с кодом 200.
 */
api.interceptors.response.use(res => {
  if (!res.body) { return res; }

  /**
   * так же ответ может приходить таким, что он не соответствует принятой схеме.
   * обработаем этот момент.
   */

  if (isInvalidResponseBody(res)) {
    res = formatInvalidResponseBody(res);
  }

  if (!res.body.success) {
    /**
     * здесь любой неудачный ответ завернём в инстанс ошибки.
     * сделаем это родной для axios'а функцией `createError`
     * и нашим улучшателем ошибок ответа сервера
     */
    const err = createError(res.body.message || '', res.config, res.status, res);

    return Promise.reject(enhanceResponseError(err));
  }

  return res;
}, err => {
  const { res } = err;

  if (res) {
    if (isInvalidResponseBody(res)) {
      err.response = formatInvalidResponseBody(res);
    }
  }

  return Promise.reject(err);
});


/**
 * Здесь надо обрабатывать ошибки - какие-то зарубать здесь на месте,
 * какие-то переработать в другой формат.
 * Короче, здесь логика по работе с ответом конретного сервера и его форматом ответов.
 */
api.interceptors.response.use(res => res, err => {
  let retVal;

  if (err.response) {
    const { response } = err;

    /** немножко провалидируем и подчистим данные */
    if (typeof response.body != 'undefined') {
      const { body: { code, message } } = response;

      Object.assign(body, {
        success: false,
        code: code || err.code,
        message: message || err.message
      });
    } else {

    }
  }

  /**
   * а теперь можно систематизировать и захардкодить ошибки,
   * которые можно будет обрабатывать внутри приложения
   */
  switch (err.code) {
    case 401:
      // store.dispatch('account/logout');
      break;
    case 403:
      break;
    case 404:
      break;
    case 500:
      break;
    case 800: // объект уже существует
      break;
    case 422: // ошибка валидации
      break;
  }

  return retVal ? retVal : Promise.reject(err);
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


// http.interceptors.response.use(
//   response => response,
//   error => {
//     /**
//      * This is a central point to handle all
//      * error messages generated by HTTP
//      * requests
//      */
//     const { response } = error;
//     /**
//      * If token is either expired, not provided or invalid
//      * then redirect to login. On server side the error
//      * messages can be changed on app/Providers/EventServiceProvider.php
//      */
//     if ([401, 400].indexOf(response.status) > -1) {
//       router.push({ name: 'login.index' });
//     }
//     /**
//      * Error messages are sent in arrays
//      */
//     if (isArray(response.data)) {
//       store.dispatch('setMessage', { type: 'error', message: response.data.messages });
//       /**
//        * Laravel generated validation errors are
//        * sent in an object
//        */
//     } else {
//       store.dispatch('setMessage', { type: 'validation', message: response.data });
//     }
//
//     store.dispatch('setFetching', { fetching: false });
//
//     return Promise.reject(error);
//   }
// );

// let instance = axios.create({
//   baseUrl: ''
// });
//
// _.assign(instance.defaults.headers.common, {
//   Accept: 'application/json',
//   'Content-Type': 'application/json'
// });
//
// instance.interceptors.request.use(req => {
//   progress.start();
//
//   const token = ls.get('token') || 'blablablabla';
//   token && (req.headers['X-HTTP-TOKEN'] = token);
//
//   return req;
// }, err => {
//   progress.done(true);
//
//   return Promise.reject(error)
// });
// instance.interceptors.response.use(res => {
//   progress.done(true);
//
//   const token = res.headers['Authorization'] || res.data['token'];
//   token && ls.set('token', token);
//
//   return res;
// }, err => {
//   progress.done(true);
//
//   return Promise.reject(err)
// });
//
// export default instance;
