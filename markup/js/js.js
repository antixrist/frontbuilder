import {app} from './app';

Promise.config({
  warnings: false,
  cancellation: true
});

app.$mount('#app');

export default app;
