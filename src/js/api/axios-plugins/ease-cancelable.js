import _ from 'lodash';
import axios from 'axios';

const { CancelToken, isCancel } = axios;

const store = new Map();

easeCancelable.destroy = destroy;

/**
 * @param instance
 * @returns {*}
 */
export default function easeCancelable (instance) {
  Object.defineProperties(instance, {
    easeCancelable: {
      enumerable: false,
      value: {}
    }
  });

  instance.easeCancelable.original = {
    request: instance.request,
    delete: instance.delete,
    get: instance.get,
    head: instance.head,
    post: instance.post,
    put: instance.put,
    patch: instance.patch
  };
  instance.easeCancelable.interceptors = {};

  // instance.easeCancelable.interceptors.request = instance.interceptors.request.use(
  //   requestInterceptorResolve,
  //   requestInterceptorReject
  // );

  // instance.easeCancelable.interceptors.response = instance.interceptors.response.use(
  //   responseInterceptorResolve,
  //   responseInterceptorReject
  // );

  instance.request = function request (...args) {
    console.log('request', ...args);
    let config = args[0];
    if (typeof config === 'string') {
      config = Object.assign({ url: args[0] }, args[1] || {});
    }

    const { token, cancel } = CancelToken.source();
    config.cancelToken = token;

    const xhr = instance.easeCancelable.original.request.call(instance, config);
    store.set(token, xhr);

    xhr.cancel = cancel;

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

  instance.interceptors.request.use(function (config) {
    console.log('config', _.merge({}, config));
    console.log('store.get(cancelToken)', cancelToken, store.get(cancelToken));

    return config;
  }, function (err) {
    console.log('err', err);
    // cleanupConfig(err.config);
    err.isCanceled = isCancel(err);

    return Promise.reject(err);
  });
  instance.interceptors.response.use(function (res) {
    console.log('response', _.merge({}, res));
    // cleanupConfig(res.config);


    // console.log('keys', store.keys());

    return res;
  }, function (err) {
    console.log('response err', err);

    // cleanupConfig(err.config);
    err.isCanceled = isCancel(err);

    // console.log('keys', store.keys());

    return Promise.reject(err);
  });

  return instance;
}

function cleanupConfig (config) {
  const { cancelToken = null } = config;

  console.log('store.get(cancelToken)', cancelToken, store.get(cancelToken));

  if (cancelToken && store.has(cancelToken)) {
    const xhr = store.get(cancelToken);

    delete xhr.cancel;
    store.delete(cancelToken);
  }
}

export function destroy (instance) {
  // if (!instance.easeCancelable) { return instance; }
  //
  // instance.request = instance.easeCancelable.originalRequest;
  //
  // instance.interceptors.request.eject(instance.easeCancelable.interceptors.request);
  // instance.interceptors.response.eject(instance.easeCancelable.interceptors.response);
  //
  // delete instance.easeCancelable;
  //
  // return instance;
}

// function requestInterceptorResolve (config) {
//
// }
//
// function requestInterceptorReject (err) {
//   cleanupConfig(err.config);
//   err.isCanceled = isCancel(err);
// }
//
// function responseInterceptorResolve (res) {
//   cleanupConfig(res.config);
// }
//
// function responseInterceptorReject (err) {
//   cleanupConfig(err.config);
//   err.isCanceled = isCancel(err);
// }
//
// function makeCancelable (config) {
//   const { token, cancel } = CancelToken.source();
//   config.cancelToken = token;
//
//   return cancel;
// }
