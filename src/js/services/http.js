import axios from 'axios'

axios.factory = function factory (...args) {
  return axios.create(...args);
};

export default axios;
