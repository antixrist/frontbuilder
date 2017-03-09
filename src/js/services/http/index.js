import _ from 'lodash'
import qs from 'qs'
import axios from 'axios'
import { HttpError, RequestError, ResponseError } from './errors';
import { durationTime, easeCancelable, normalizeErrors } from './axios-plugins';

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

axios.originalCreate = axios.create;

axios.create = function (opts = {}) {
  opts = _.merge({}, defaults, opts);

  const instance = axios.originalCreate(opts);

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

  return instance;
};

export default axios;
export {
  // errors
  HttpError,
  RequestError,
  ResponseError,

  // cancellations
  CancelToken,
  isCancel,

  // plugins
  durationTime,
  easeCancelable,
  normalizeErrors,
}
