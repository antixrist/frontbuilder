import d from 'd';

durationTime.destroy = destroy;

/**
 * @param {AxiosInstance} instance
 * @returns {*}
 */
export default function durationTime (instance) {
  Object.defineProperty(instance, 'durationTime', d('', {}));

  const { durationTime } = instance;

  durationTime.interceptors = {
    request:  instance.interceptors.request.use(requestInterceptorResolve, requestInterceptorReject),
    response: instance.interceptors.response.use(responseInterceptorResolve, responseInterceptorReject)
  };

  return instance;
}

/**
 * @param {AxiosInstance} instance
 * @returns {*}
 */
export function destroy (instance) {
  if (!instance.durationTime) { return instance; }

  instance.interceptors.request.eject(instance.durationTime.interceptors.request);
  instance.interceptors.response.eject(instance.durationTime.interceptors.response);

  delete instance.durationTime;

  return instance;
}

/**
 * @param {AxiosRequestConfig} config
 * @returns {AxiosRequestConfig}
 */
function requestInterceptorResolve (config) {
  config.startTime = new Date;
  // Object.defineProperty(config, 'startTime', d('ew', new Date));
  
  return config;
}

/**
 * @param {AxiosError} err
 * @returns {Promise<AxiosError>}
 */
function requestInterceptorReject (err) {
  if (err.config && err.config.startTime) {
    writeDurationTime(err, err.config.startTime, new Date);
    delete err.config.startTime;
  }

  return Promise.reject(err);
}

/**
 * @param {AxiosResponse} res
 * @returns {AxiosResponse}
 */
function responseInterceptorResolve (res) {
  if (res.config && res.config.startTime) {
    writeDurationTime(res, res.config.startTime, new Date);
    delete res.config.startTime;
  }

  return res;
}

/**
 * @param {AxiosError} err
 * @returns {Promise<AxiosError>}
 */
function responseInterceptorReject (err) {
  if (err.config && err.config.startTime) {
    const start = err.config.startTime;
    const end = new Date;
    delete err.config.startTime;

    writeDurationTime(err, start, end);

    err.response && writeDurationTime(err.response, start, end);
  }

  return Promise.reject(err);
}

/**
 * @param obj
 * @param {(Date|Number)} start
 * @param {(Date|Number)} end
 */
function writeDurationTime (obj, start, end) {
  Object.defineProperties(obj, {
    startTime: d('e', start),
    endTime:   d('e', end),
    duration:  d('e', end - start),
  });
}
