import { API_URL } from '../../config';
import { progress, http } from '../services';
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

api.interceptors.request.use(req => {
  progress.start();

  return req;
}, err => {
  progress.done(true);

  return Promise.reject(err);
});
api.interceptors.response.use(res => {
  progress.done(true);

  return res;
}, err => {
  progress.done(true);

  return Promise.reject(err);
});

export default api;
