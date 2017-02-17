const ENDPOINTS = {
  LOGIN: {
    url: 'login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
};

const AxiosConfig = {
  url: '',
  method: 'get',
  baseURL: API_URL,
  withCredentials: true, // default
  transformResponse: [function (data) {
    if (data == 'Unauthorized') {
      window.location.href = '/login';
    }
    else {
      return JSON.parse(data);
    }
  }],
};

const AuthAxiosConfig = {
  url: '',
  method: 'get',
  baseURL: API_URL,
  withCredentials: true, // default
};

export { ENDPOINTS, AxiosConfig, AuthAxiosConfig }