import ls from 'store';

// if (typeof localStorage === 'undefined' || localStorage === null) {
//   var LocalStorage = require('node-localstorage').LocalStorage;
//   global.localStorage = new LocalStorage('./scratch');
// }

ls.factory = function factory (opts = {}) {
  return ls;
};

export default ls;
