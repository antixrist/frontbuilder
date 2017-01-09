import _ from 'lodash';
import axios from 'axios';

import { ls, progress } from '../';

let instance = axios.create({
  baseUrl: ''
});

_.assign(instance.defaults.headers.common, {
  Accept: 'application/json',
  'Content-Type': 'application/json'
});

instance.interceptors.request.use(req => {
  progress.start();
  
  console.log('req', req);
  
  const token = ls.get('token') || 'blablablabla';
  token && (req.headers['X-HTTP-TOKEN'] = token);
  
  return req;
}, err => {
  progress.done(true);
  
  console.log('request err', _.keys(err));
  console.log('request', err);
  
  return Promise.reject(error)
});
instance.interceptors.response.use(res => {
  progress.done(true);
  
  const token = res.headers['Authorization'] || res.data['token'];
  token && ls.set('token', token);
  
  return res;
}, err => {
  progress.done(true);
  
  console.log('response err', err);
  console.log('response', err.config === err.response.config, err.config, err.response);
  
  return Promise.reject(err)
});

export default instance;

// export const createClient = (options = {}) => axios.create(_.defaults({}, options));
