import 'babel-polyfill';
import _ from 'lodash';
import FastClick from 'fastclick';
import '../styles/main.scss';
import { app, router, store } from './app';
app.$mount('#app');

// http://v4-alpha.getbootstrap.com/content/reboot/#click-delay-optimization-for-touch
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', () => FastClick.attach(document.body), false);
}

if (process.env.NODE_ENV == 'development') {
  window.app = app;
}
