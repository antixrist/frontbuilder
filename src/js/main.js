import 'babel-polyfill';
import _ from 'lodash';
import Promise from 'bluebird';
import FastClick from 'fastclick';
import '../styles/main.scss';
import { app, router, store } from './app';
app.$mount('#app');

// http://v4-alpha.getbootstrap.com/content/reboot/#click-delay-optimization-for-touch
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', () => FastClick.attach(document.body), false);
}

import { ls } from './app/services';

if (!ls.enabled) {
  throw new Error('LocalStorage не доступен. Пожалуйста, выйдите из приватного режима Safari');
}
