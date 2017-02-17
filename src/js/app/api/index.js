import { http } from '../services';

const ENDPOINTS = {
  LOGIN: {
    url: 'login',
  }
};

const api = http.factory({
  method: 'post',
  baseURL: process.env.API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

export default api;
