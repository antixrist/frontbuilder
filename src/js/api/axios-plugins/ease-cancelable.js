import axios from 'axios';

const { CancelToken, isCancel } = axios;

const store = new WeakMap();

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

  instance.easeCancelable.originalRequest = instance.request;
  instance.easeCancelable.interceptors = {};

  instance.easeCancelable.interceptors.request = instance.interceptors.request.use(
    requestInterceptorResolve,
    requestInterceptorReject
  );

  instance.easeCancelable.interceptors.response = instance.interceptors.response.use(
    responseInterceptorResolve,
    responseInterceptorReject
  );

  const request = function request (...args) {
    let config = args[0];
    // if (typeof config === 'string') {
    //   config = _.merge({ url: args[0] }, args[1] || {});
    // }
    //
    // config = _.merge({}, axiosDefaults, instance.defaults, { method: 'get' }, config);

    const cancel = makeCancelable(config);
    const xhr = instance.originalRequest(config);
    config.easeCancelable = { xhr };
    xhr.cancel = cancel;

    return xhr;
  };

  instance.request = request;

  return instance;
}

export function destroy (instance) {
  if (!instance.easeCancelable) { return instance; }

  instance.request = instance.easeCancelable.originalRequest;

  instance.interceptors.request.eject(instance.easeCancelable.interceptors.request);
  instance.interceptors.response.eject(instance.easeCancelable.interceptors.response);

  delete instance.easeCancelable;

  return instance;
}

function cleanupConfig (config) {
  if (config.easeCancelable && config.easeCancelable.xhr) {
    delete config.easeCancelable.xhr.cancel;
    delete config.easeCancelable.xhr;
    delete config.easeCancelable;
  }
}

function requestInterceptorResolve (config) {

}

function requestInterceptorReject (err) {
  cleanupConfig(err.config);
  err.isCanceled = isCancel(err);
}

function responseInterceptorResolve (res) {
  cleanupConfig(res.config);
}

function responseInterceptorReject (err) {
  cleanupConfig(err.config);
  err.isCanceled = isCancel(err);
}

function makeCancelable (config) {
  const { token, cancel } = CancelToken.source();
  config.cancelToken = token;

  return cancel;
}
