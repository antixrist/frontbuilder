Promise.config({
  warnings: false,
  cancellation: true
});

// global.Promise = require('bluebird');
// Warnings are useful for user code, but annoying for third party libraries.
// console.log('Promise', Object.keys(Promise));


module.exports = require('./app');
