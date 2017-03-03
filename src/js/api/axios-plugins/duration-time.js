durationTime.destroy = destroy;

/**
 * @param instance
 * @returns {*}
 */
export default function durationTime (instance) {
  Object.defineProperties(instance, {
    durationTime: {
      enumerable: false,
      value: {}
    }
  });

  instance.durationTime.interceptors = {};

  instance.durationTime.interceptors.request = instance.interceptors.request.use(
    requestInterceptorResolve,
    requestInterceptorReject
  );

  instance.durationTime.interceptors.response = instance.interceptors.response.use(
    responseInterceptorResolve,
    responseInterceptorReject
  );

  return instance;
}

/**
 * @param instance
 * @returns {*}
 */
export function destroy (instance) {
  if (!instance.durationTime) { return instance; }

  instance.interceptors.request.eject(instance.durationTime.interceptors.request);
  instance.interceptors.response.eject(instance.durationTime.interceptors.response);

  delete instance.durationTime;

  return instance;
}


function requestInterceptorResolve (config) {
  config.startTime = new Date;

  return config;
}

function requestInterceptorReject (err) {
  delete err.config.startTime;

  return Promise.reject(err);
}

function responseInterceptorResolve (res) {
  const { config } = res;
  res.startTime = config.startTime;
  res.endTime = new Date;
  res.duration = res.endTime - res.startTime;
  delete config.startTime;

  return res;
}

function responseInterceptorReject (err) {
  const { config, response } = err;
  response.startTime = config.startTime;
  response.endTime = new Date;
  response.duration = response.endTime - response.startTime;
  delete config.startTime;

  return Promise.reject(err);
}
