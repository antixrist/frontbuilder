// apply global overrides stuff here
// require('babel-runtime/core-js/promise').default = require('bluebird');
// global.Promise = require('bluebird'); // extra override

import {app} from './app';

Promise.config({
  warnings: false,
  cancellation: true
});

app.$mount('#app');

export default app;
