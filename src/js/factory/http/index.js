import _ from 'lodash'
import qs from 'qs'
import axios from 'axios'
import { durationTime, easeCancelable } from './axios-plugins';
import normalizeErrors, { getResponseTranscription } from './axios-plugins/normalize-errors';
import { HttpError, RequestError, ResponseError } from './errors';

const { CancelToken, isCancel } = axios;

const defaults = {
  headers: {
    'Accept':           'application/json',
    'Content-Type':     'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  data: {}
};

export default function factory (opts = {}) {
  opts = _.merge({}, defaults, opts);

  const instance = axios.create(opts);

  if (
    opts.headers &&
    opts.headers['Content-Type'] &&
    opts.headers['Content-Type'] == 'application/x-www-form-urlencoded'
  ) {
    instance.interceptors.request.use((request) => {
      if (request.data && request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        request.data = qs.stringify(request.data, { encode: false, arrayFormat: 'brackets' });
      }
      return request;
    });
  }

  durationTime(instance);
  easeCancelable(instance);
  normalizeErrors(instance);

  /** расширим объект ответа */
  instance.interceptors.response.use(
    res => Object.assign({}, res, getResponseTranscription(res)),
    err => Promise.reject(err)
  );

  /** Переименуем `response.data` на `response.body`, чтобы не было `response.data.data` */
  instance.interceptors.response.use(
    response => {
      if (response.data) {
        response.body = response.data;
        delete response.data;
      }

      return response;
    },
    err => {
      if (err.response && err.response.data) {
        err.response.body = err.response.data;
        delete err.response.data;
      }

      return Promise.reject(err);
    }
  );

  return instance;
};

export {
  // errors
  HttpError, RequestError, ResponseError,

  // cancellations
  CancelToken,
  isCancel,

  // plugins
  durationTime,
  easeCancelable,
  normalizeErrors
};
