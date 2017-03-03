import storage from 'store';

// if (typeof localStorage === 'undefined' || localStorage === null) {
//   var LocalStorage = require('node-localstorage').LocalStorage;
//   global.localStorage = new LocalStorage('./scratch');
// }

storage.factory = function factory (...args) {
  return storage;
};

export default storage;
