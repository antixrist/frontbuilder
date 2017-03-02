import _ from 'lodash';
import { API_URL } from '../config';
import { http } from '../services';
import { errorToJSON } from '../utils';
import pathToRegexp from 'path-to-regexp';
// import qs from 'qs';

const api = http.factory({
  method: 'post',
  baseURL: API_URL,
  // withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded'
  },
  data: {}
});

// api.interceptors.request.use((request) => {
//   if (request.data && request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
//     request.data = qs.stringify(request.data, { encode: false, arrayFormat: 'brackets' });
//   }
//   return request;
// });

export default api;

export async function reportError (data, opts = {}) {
  const { err } = data;
  const errObj = errorToJSON(err);
  delete data.err;

  errObj.stackframes && errObj.stackframes.map(sf => sf.toString()).join('\n');

  Object.assign(data, errObj, {
    userAgent: navigator.userAgent,
    location: document.location.href,
  });

  await api.post('/report-error', data, Object.assign({
    silent: true
  }, opts));
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
