import 'babel-polyfill';

import '../styles/common.scss';
import '../styles/main.scss';
import { app as vueApp, router, store } from './app';

vueApp.$mount('#app');
