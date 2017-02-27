import axios from 'axios'

axios.factory = function factory (opts = {}) {
  return axios.create(opts);
};

export default axios;
