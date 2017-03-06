import { CancelToken } from 'axios';

easeCancelable.destroy = destroy;

/**
 * @param instance
 * @param {{}} [opts]
 * @returns {*}
 */
export default function easeCancelable (instance, opts = {
  cancelMethodName: 'cancel'
}) {
  Object.defineProperties(instance, {
    easeCancelable: {
      enumerable: false,
      value: {}
    }
  });
  
  instance.easeCancelable.interceptors = {};
  instance.easeCancelable.originalMethods = {};
  ['request', 'delete', 'get', 'head', 'post', 'put', 'patch'].forEach(method => {
    instance.easeCancelable.originalMethods[method] = instance[method];
  });

  instance.easeCancelable.interceptors.request = instance.interceptors.request.use(
    requestInterceptorResolve,
    requestInterceptorReject
  );

  instance.easeCancelable.interceptors.response = instance.interceptors.response.use(
    responseInterceptorResolve,
    responseInterceptorReject
  );

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

    const xhr = instance.easeCancelable.originalMethods.request.call(instance, config);
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

function requestInterceptorResolve (config) {
  return config;
}

function requestInterceptorReject (err) {
  return Promise.reject(err);
}

function responseInterceptorResolve (res) {
  return res;
}

function responseInterceptorReject (err) {
  return Promise.reject(err);
}

export function destroy (instance) {
  if (!instance.easeCancelable) { return instance; }
  
  ['request', 'delete', 'get', 'head', 'post', 'put', 'patch'].forEach(method => {
    instance[method] = instance.easeCancelable.originalMethods[method];
  });
  
  instance.interceptors.request.eject(instance.easeCancelable.interceptors.request);
  instance.interceptors.response.eject(instance.easeCancelable.interceptors.response);

  delete instance.easeCancelable;

  return instance;
}

function noop () {}
