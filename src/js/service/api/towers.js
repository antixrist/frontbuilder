import _ from 'lodash';
import { logTowersApiRequests } from '../../config';
import progress from '../progress';
import status from 'statuses';
import { errorToJSON } from '../../utils';
import { http } from '../../factory';
import axiosCreateError from 'axios/lib/core/createError';
import { enhanceAxiosError } from '../../factory/http/axios-plugins/detailed';

// function createError (msg, config, code, response) {
//   const err = axiosCreateError(msg, config, code, response);
//   return enhanceAxiosError(err);
// }

const api = http({
  method: 'post',
  baseURL: process.env.TOWERS_API_URL,
  timeout: 30000, // 30 сек.
  headers: {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  },
  auth: {
    username: process.env.TOWERS_API_USER,
    password: process.env.TOWERS_API_PASS
  },
  withCredentials: false, // ?
});

/** Пологируем */
// if (logTowersApiRequests) {
//   api.interceptors.request.use(
//     config => {
//       console.log('[start] request', _.cloneDeep(config));
//       return config;
//     },
//     err => {
//       console.log('[start] request error', err, errorToJSON(err));
//       return Promise.reject(err);
//     }
//   );
//   api.interceptors.response.use(
//     res => {
//       console.log('[start] response', _.cloneDeep(res));
//       return res;
//     },
//     err => {
//       console.log('[start] response error', err, errorToJSON(err));
//       return Promise.reject(err);
//     }
//   );
// }

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


/** Пологируем */
if (logTowersApiRequests) {
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

export default api;
