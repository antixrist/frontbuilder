// require('babel-runtime/core-js/promise').default = require('bluebird');
// require('babel-polyfill');

Promise.config({
  warnings: false,
  cancellation: true
});

// global.Promise = require('bluebird');
// Warnings are useful for user code, but annoying for third party libraries.
// console.log('Promise', Object.keys(Promise));


module.exports = require('./app');
