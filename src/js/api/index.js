import _ from 'lodash';
import { API_URL } from '../config';
import axios from 'axios';
import { durationTime, easeCancelable } from './axios-plugins';
import { http } from '../services';
import { errorToJSON } from '../utils';
import pathToRegexp from 'path-to-regexp';
// import qs from 'qs';

const defaults = {
  method: 'post',
  baseURL: API_URL,
  // withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded'
  },
  data: {}
};

const api = axios.create({
  method: 'post',
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded'
  },
  data: {}
});

window.api = api;
window.errorToJSON = errorToJSON;



durationTime(api);
easeCancelable(api);










class Http {
  static get Cancel () { return axios.Cancel; }
  static get CancelToken () { return axios.CancelToken; }
  static get isCancel () { return axios.isCancel; }
  static get defaults () {
    return {
      method: 'post',
      baseURL: API_URL,
      // withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {}
    };
  };

  static makeCancelable (config) {
    let retVal = _.noop;

    if (config.cancelable) {
      const { token, cancel } = Http.CancelToken.source();
      config.cancelToken = token;

      retVal = cancel;
    }

    return retVal;
  }

  constructor (config = {}) {
    this.setConfig(config);

    Object.defineProperties(this, {
      instance: {
        enumerable: false,
        value: axios.create()
      },
      _defaults: {
        enumerable: false,
        value: {}
      },
      defaults: {
        get () {
          return this._defaults;
        },
        set (obj = {}) {
          _.merge(this._defaults, obj);
          this.setup();
        }
      }
    });

    this.defaults = Http.defaults;
  }

  setup () {

  }

  request (opts = {}) {
    let config = opts;
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
      config = _.merge(arguments[1] || {}, {
        url: arguments[0]
      });
    }

    config = _.merge();
  }

  delete (url, config = {}) {
    const cancel = _makeCancelable(config);
    const req = instance.delete(url, config);

    req.cancel = cancel;

    return req;
  }

  post (url, data = {}, config = {}) {
    const cancel = _makeCancelable(config);
    const req = instance.post(url, data, config);

    req.cancel = cancel;

    return req;
  }
}


function create (config = {}) {
  const { logTime = true, cancelable = true } = config;
  delete config.logTime;
  delete config.cancelable;

  const instance = axios.create(_.merge({}, defaults, config));

  if (logTime) {
    instance.interceptors.request.use(
      config => {
        config.startTime = new Date;

        return config;
      },
      err => {
        delete err.config.startTime;

        return Promise.reject(err);
      })
    ;

    instance.interceptors.response.use(
      res => {
        const { config } = res;
        res.startTime = config.startTime;
        res.endTime = new Date;
        res.duration = res.endTime - res.startTime;
        delete config.startTime;

        return res;
      },
      err => {
        const { config, response } = err;
        response.startTime = config.startTime;
        response.endTime = new Date;
        response.duration = response.endTime - response.startTime;
        delete config.startTime;

        return Promise.reject(err);
      }
    );
  }

  const _makeCancelable = cancelable ? () => _.noop : makeCancelable;

  const http = function http (config = {}) {
    const cancel = _makeCancelable(config);
    const req = instance(config);

    req.cancel = cancel;

    return req;
  };

  http.request = function http$request (config = {}) {
    return http(config);
  };

  http.delete = function http$delete (url, config = {}) {
    const cancel = _makeCancelable(config);
    const req = instance.delete(url, config);

    req.cancel = cancel;

    return req;
  };

  http.get = function http$get (url, config = {}) {
    const cancel = _makeCancelable(config);
    const req = instance.get(url, config);

    req.cancel = cancel;

    return req;
  };

  http.head = function http$head (url, config = {}) {
    const cancel = _makeCancelable(config);
    const req = instance.head(url, config);

    req.cancel = cancel;

    return req;
  };

  http.post = function http$post (url, data = {}, config = {}) {
    const cancel = _makeCancelable(config);
    const req = instance.post(url, data, config);

    req.cancel = cancel;

    return req;
  };

  http.put = function http$put (url, data = {}, config = {}) {
    const cancel = _makeCancelable(config);
    const req = instance.put(url, data, config);

    req.cancel = cancel;

    return req;
  };

  http.patch = function http$patch (url, data = {}, config = {}) {
    const cancel = _makeCancelable(config);
    const req = instance.patch(url, data, config);
    req.cancel = cancel;

    return req;
  };

  return http;
}



/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend (a, b, thisArg) {
  _.forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = _.bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}


import qs from 'qs'

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest';

// export const _http = new Http();


http.interceptors.response.use(
  response => response,
  error => {
    /**
     * This is a central point to handle all
     * error messages generated by HTTP
     * requests
     */
    const { response } = error;
    /**
     * If token is either expired, not provided or invalid
     * then redirect to login. On server side the error
     * messages can be changed on app/Providers/EventServiceProvider.php
     */
    if ([401, 400].indexOf(response.status) > -1) {
      router.push({ name: 'login.index' });
    }
    /**
     * Error messages are sent in arrays
     */
    if (isArray(response.data)) {
      store.dispatch('setMessage', { type: 'error', message: response.data.messages });
      /**
       * Laravel generated validation errors are
       * sent in an object
       */
    } else {
      store.dispatch('setMessage', { type: 'validation', message: response.data });
    }

    store.dispatch('setFetching', { fetching: false });

    return Promise.reject(error);
  }
);

// api.interceptors.request.use((request) => {
//   if (request.data && request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
//     request.data = qs.stringify(request.data, { encode: false, arrayFormat: 'brackets' });
//   }
//   return request;
// });

export default api;

export async function reportError (data, opts = {}) {
  const { error } = data;
  const errObj = errorToJSON(error);
  delete data.error;

  errObj.stackframes && errObj.stackframes.map(sf => sf.toString()).join('\n');

  Object.assign(data, errObj, {
    userAgent: navigator.userAgent,
    location: document.location.href,
  });

  return await api.post('/report-error', data, Object.assign({
    silent: true
  }, opts)).catch(err => console.error(err));
}


// let instance = axios.create({
//   baseUrl: ''
// });
//
// _.assign(instance.defaults.headers.common, {
//   Accept: 'application/json',
//   'Content-Type': 'application/json'
// });
//
// instance.interceptors.request.use(req => {
//   progress.start();
//
//   const token = ls.get('token') || 'blablablabla';
//   token && (req.headers['X-HTTP-TOKEN'] = token);
//
//   return req;
// }, err => {
//   progress.done(true);
//
//   return Promise.reject(error)
// });
// instance.interceptors.response.use(res => {
//   progress.done(true);
//
//   const token = res.headers['Authorization'] || res.data['token'];
//   token && ls.set('token', token);
//
//   return res;
// }, err => {
//   progress.done(true);
//
//   return Promise.reject(err)
// });
//
// export default instance;
