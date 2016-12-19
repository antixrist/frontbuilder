import 'babel-polyfill';
import '../styles/main.scss';
import { app as vueApp, router, store } from './app';

vueApp.$mount('#app');
