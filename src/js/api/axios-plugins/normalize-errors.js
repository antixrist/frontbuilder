import httpErrors from 'http-errors';
import createError from 'create-error';


window.httpErrors = httpErrors;
window.createError = createError;
//console.log('createError', createError);

export const NONE = null;
export const CLIENT_ERROR = 'CLIENT_ERROR';
export const SERVER_ERROR = 'SERVER_ERROR';
export const TIMEOUT_ERROR = 'TIMEOUT_ERROR';
export const CONNECTION_ERROR = 'CONNECTION_ERROR';
export const NETWORK_ERROR = 'NETWORK_ERROR';
export const UNKNOWN_ERROR = 'UNKNOWN_ERROR';
export const CANCEL_ERROR = 'CANCEL_ERROR';

function qweqwe (instance) {
  const TIMEOUT_ERROR_CODES = ['ECONNABORTED'];
  const NODEJS_CONNECTION_ERROR_CODES = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'];
  const in200s = RS.isWithin(200, 299);
  const in400s = RS.isWithin(400, 499);
  const in500s = RS.isWithin(500, 599);
  
  
  const isError = axiosResponse instanceof Error || axios.isCancel(axiosResponse);
  const response = isError ? axiosResponse.response : axiosResponse;
  const status = response && response.status || null;
  const problem = isError ? getProblemFromError(axiosResponse) : getProblemFromStatus(status);
  const ok = in200s(status);
  const config = axiosResponse.config || null;
  const headers = response && response.headers || null;
  let data = response && response.data || null;
  
  let transformedResponse = { duration, problem, ok, status, headers, config, data };
  if (responseTransforms.length > 0) {
    R.forEach(transform => transform(transformedResponse), responseTransforms);
  }
  
  
  const getProblemFromError = (error) => {
    // first check if the error message is Network Error (set by axios at 0.12) on platforms other than NodeJS.
    if (error.message === 'Network Error') return NETWORK_ERROR;
    if (axios.isCancel(error)) return CANCEL_ERROR;
    
    // then check the specific error code
    return R.cond([
      // if we don't have an error code, we have a response status
      [R.isNil, () => getProblemFromStatus(error.response.status)],
      [R.contains(R.__, TIMEOUT_ERROR_CODES), R.always(TIMEOUT_ERROR)],
      [R.contains(R.__, NODEJS_CONNECTION_ERROR_CODES), R.always(CONNECTION_ERROR)],
      [R.T, R.always(UNKNOWN_ERROR)]
    ])(error.code);
  };

  /**
   * Given a HTTP status code, return back the appropriate problem enum.
   */
  const getProblemFromStatus = status => {
    return R.cond([
      [R.isNil, R.always(UNKNOWN_ERROR)],
      [in200s, R.always(NONE)],
      [in400s, R.always(CLIENT_ERROR)],
      [in500s, R.always(SERVER_ERROR)],
      [R.T, R.always(UNKNOWN_ERROR)]
    ])(status);
  };
}







normalizeErrors.destroy = destroy;

/**
 * @param instance
 * @returns {*}
 */
export default function normalizeErrors (instance) {
  Object.defineProperties(instance, {
    normalizeErrors: {
      enumerable: false,
      value: {}
    }
  });

  instance.normalizeErrors.interceptors = {};

  instance.normalizeErrors.interceptors.request = instance.interceptors.request.use(
    requestInterceptorResolve,
    requestInterceptorReject
  );

  instance.normalizeErrors.interceptors.response = instance.interceptors.response.use(
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
  if (!instance.normalizeErrors) { return instance; }

  instance.interceptors.request.eject(instance.normalizeErrors.interceptors.request);
  instance.interceptors.response.eject(instance.normalizeErrors.interceptors.response);

  delete instance.normalizeErrors;

  return instance;
}


function requestInterceptorResolve (config) {
  return config;
}

function requestInterceptorReject (err) {
  return Promise.reject(err);
}

function responseInterceptorResolve (res) {
  const { config } = res;

  return res;
}

function responseInterceptorReject (err) {
  const { config } = err;
 
  let obj = err.response || err;

  return Promise.reject(err);
}
