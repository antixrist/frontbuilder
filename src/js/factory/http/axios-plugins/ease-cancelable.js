import d from 'd';
import { CancelToken } from 'axios';

easeCancelable.destroy = destroy;

/**
 * @param {AxiosInstance} instance
 * @param {{}} [opts]
 * @returns {*}
 */
export default function easeCancelable (instance, opts = {
  cancelMethodName: 'cancel'
}) {
  Object.defineProperty(instance, 'easeCancelable', d('', {}));

  const { easeCancelable } = instance;

  easeCancelable.interceptors = {};
  easeCancelable.originalMethods = {};

  ['request', 'delete', 'get', 'head', 'post', 'put', 'patch'].forEach(method => {
    easeCancelable.originalMethods[method] = instance[method];
  });

  /** Вешаем на инстанс свои методы */
  instance.request = function request (...args) {
    let config = args[0];
    if (typeof config === 'string') {
      config = Object.assign({ url: args[0] }, args[1] || {});
    }
    
    let cancelFn = noop;

    if (!config.cancelToken) {
      let { token, cancel } = CancelToken.source();
      config.cancelToken = token;
      cancelFn = cancel;
    }

    const xhr = easeCancelable.originalMethods.request.call(instance, config);
    xhr[opts.cancelMethodName] = cancelFn;

    return xhr;
  };

  // Provide aliases for supported request methods
  ['delete', 'get', 'head'].forEach(function forEachMethodNoData(method) {
    instance[method] = function(url, config) {
      return instance.request(Object.assign(config || {}, {
        method: method,
        url: url
      }));
    };
  });

  ['post', 'put', 'patch'].forEach(function forEachMethodWithData(method) {
    instance[method] = function (url, data, config) {
      return instance.request(Object.assign(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });

  return instance;
}

/**
 * @param {AxiosInstance} instance
 * @returns {*}
 */
export function destroy (instance) {
  if (!instance.easeCancelable) { return instance; }

  const { easeCancelable } = instance;

  ['request', 'delete', 'get', 'head', 'post', 'put', 'patch'].forEach(method => {
    instance[method] = easeCancelable.originalMethods[method];
  });

  delete instance.easeCancelable;

  return instance;
}

function noop () {}
