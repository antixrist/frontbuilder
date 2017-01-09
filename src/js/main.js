// require('source-map-support/browser-source-map-support');
// sourceMapSupport.install();

import 'babel-polyfill';
import _ from 'lodash';
import Promise from 'bluebird';
import FastClick from 'fastclick';
import '../styles/main.scss';
import { app as vueApp, router, store } from './app';

// http://v4-alpha.getbootstrap.com/content/reboot/#click-delay-optimization-for-touch
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function() {
    FastClick.attach(document.body);
  }, false);
}


vueApp.$mount('#app');
